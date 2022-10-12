/**
 * Class used to display error messages about an agent target.
 * @since 1.0.0
 */
export class TargetError {
	/**
	 * Name of the target that got an error.
	 */
	public name: string;

	/**
	 * Name of the agent assigned to manage the target.
	 */
	public agent: string;

	/**
	 * Complete path where the target that gave error is located.
	 */
	public path?: URL;

	/**
	 * Reason for the error of the target.
	 */
	public reason: string;

	public constructor(name: string, agent: string, reason: string, path?: URL) {
		this.name = name;
		this.agent = agent;
		this.path = path;
		this.reason = reason;
	}
}

/**
 * Class used to display error messages about an agent target.
 * @since 1.0.0
 */
export class AgentError {
	/**
	 * Name of the agent that got an error.
	 */
	public name: string;

	/**
	 * Complete path where the agent that gave error is located.
	 */
	public path?: URL;

	/**
	 * Reason for the error of the target.
	 */
	public reason: string;

	public constructor(name: string, reason: string, path?: URL) {
		this.name = name;
		this.path = path;
		this.reason = reason;
	}
}
