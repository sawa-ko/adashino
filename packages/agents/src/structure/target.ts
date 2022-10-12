import { pathToFileURL } from 'node:url';

import type { TargetOptions } from '../types/agent.js';
import type { AgentStructure } from './agent.js';

/**
 * Default class for an agent targets.
 * @since 1.0.0
 */
export abstract class Target {
	/**
	 * Agent assigned to manage the target.
	 */
	public agent: AgentStructure;

	/**
	 * Name of the target in the agent.
	 */
	public name: string;

	/**
	 * Target status.
	 * If disabled, the target will not be executed.
	 */
	public enabled: boolean;

	/**
	 * Complete path where the target is located.
	 */
	public path: URL;

	public constructor(agent: AgentStructure, options: TargetOptions) {
		this.agent = agent;
		this.path = pathToFileURL(import.meta.url);

		this.name = options.name;
		this.enabled = options.enabled;
	}

	public abstract run(): PromiseLike<unknown> | unknown;
	public isReloaded?(): PromiseLike<unknown> | unknown;
	public isLoaded?(): PromiseLike<unknown> | unknown;
	public isUnLoaded?(): PromiseLike<unknown> | unknown;
}
