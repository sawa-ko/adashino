import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL, URL } from 'node:url';

import { AgentError, TargetError } from '../utils/error.js';
import { Target } from './target.js';
import type { AgentOptions } from '../types/agent.js';

/**
 * Structure for creating new modules and load its files.
 * @since 1.0.0
 */
export class AgentStructure<T extends Target = Target> {
	/**
	 * Name of the module structure
	 */
	public name: string;

	/**
	 * Path where the files will be obtained and loaded.
	 */
	public path: string;

	/**
	 * Targets loaded in the agent.
	 */
	public targets: Map<string, T>;

	public constructor(options: AgentOptions) {
		this.name ??= options.name;
		this.path ??= options.name;

		this.targets = new Map();
	}

	/**
	 * Resolve the module path based on the main property of the project's package.json file.
	 * @returns Full path of files for the module.
	 */
	public async resolvedPath() {
		const mainPath = await this.readPackageJson();
		if (!mainPath) throw new AgentError(this.name, 'Cannot resolve the path of the property "main" in the file package.json');

		return pathToFileURL(join(mainPath, this.path));
	}

	/**
	 * Load all targets found in the path specified for the agent.
	 */
	public async loadAll() {
		const targets = await this.readDir(await this.resolvedPath());
		for (const fileModule of targets) await this.insert(fileModule);
	}

	/**
	 * Unload all targets loaded in the agent.
	 */
	public unLoadAll() {
		for (const target of [...this.targets.values()]) this.targets.delete(target.name);
	}

	/**
	 * Unload target loaded in the agent.
	 * @param name Name of the target
	 */
	public async unload(name: string) {
		const target = this.targets.get(name);
		if (!target) throw new TargetError(name, this.name, 'The target cannot be found.');

		await this.targets.delete(target.name);
		if (target.isUnLoaded) await target.isUnLoaded();
	}

	/**
	 * Reload the target loaded in the agent.
	 * @param name Name of the target
	 */
	public async reload(name: string) {
		const target = this.targets.get(name);
		if (!target) throw new TargetError(name, this.name, 'The target cannot be found.');

		await this.insert(target.path);
		if (target.isReloaded) await target.isReloaded();
	}

	/**
	 * Processes the target so that it can be assigned to the agent.
	 * @param path Path where the target is located.
	 */
	private async insert(path: URL) {
		try {
			const target = await import(fileURLToPath(path));
			Object.values(target).forEach((target: any) => {
				if (typeof target !== 'function' || typeof target.prototype !== 'object') {
					throw new TargetError('[null]', this.name, 'The targe has not exported the default class or any class.', path);
				}

				if (!(target.prototype instanceof Target)) {
					throw new TargetError(
						'[null]',
						this.name,
						`The target (${path.href}) could not be imported into the agent because it does not extend a Target class.`,
						path
					);
				}

				const targetParsed: T = new target(this);
				this.targets.set(targetParsed.name, targetParsed);
			});
		} catch (error) {
			throw new TargetError('[null]', this.name, `The target (${path.href}) cannot be loaded.`, path);
		}
	}

	/**
	 * Internal method to obtain the main property of the package.json file of the project.
	 * @returns Full path of main property or null is property is not set.
	 */
	private async readPackageJson() {
		try {
			const cwd = process.cwd();
			const packageJson = JSON.parse(await readFile(join(cwd, 'package.json'), 'utf8')) as { main?: string };
			if (!packageJson.main) return null;

			return packageJson.main;
		} catch (error: unknown) {
			return null;
		}
	}

	private async readDir(path: URL) {
		const directory = await readdir(path, { withFileTypes: true });
		const modules: URL[] = [];

		for (const item of directory) {
			if (item.isDirectory()) modules.push(...(await this.readDir(new URL(item.name, path))));
			else modules.push(new URL(item.name, path));
		}

		return modules;
	}
}
