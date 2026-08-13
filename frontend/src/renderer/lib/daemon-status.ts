import { aoBridge } from "./bridge";
import { setApiBaseUrl, setApiDaemonStatus, getApiToken } from "./api-client";

export type DaemonStatus = Awaited<ReturnType<typeof aoBridge.daemon.getStatus>>;

export function applyDaemonStatus(nextStatus: DaemonStatus): void {
	setApiDaemonStatus(nextStatus);
	// Do not overwrite the base URL if we are in a remote session (which has a token)
	if (getApiToken() !== null) return;

	if (nextStatus.state === "ready" && nextStatus.port) {
		setApiBaseUrl(`http://127.0.0.1:${nextStatus.port}`);
	} else {
		setApiBaseUrl(null);
	}
}

export async function refreshDaemonStatus(): Promise<DaemonStatus> {
	const nextStatus = await readDaemonStatus();
	applyDaemonStatus(nextStatus);
	return nextStatus;
}

export function readDaemonStatus(): Promise<DaemonStatus> {
	return aoBridge.daemon.getStatus();
}
