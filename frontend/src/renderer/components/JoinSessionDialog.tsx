import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { setApiBaseUrl, setApiToken } from "../lib/api-client";

export function JoinSessionDialog({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) {
	const [link, setLink] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		try {
			// Parse ensemble://join?host=...&port=...
			const url = new URL(link);
			if (url.protocol !== "ensemble:" || url.hostname !== "join") {
				throw new Error("Invalid invite link format. Expected ensemble://join?...");
			}
			const host = url.searchParams.get("host");
			const port = url.searchParams.get("port");
			if (!host || !port) {
				throw new Error("Link is missing host or port.");
			}
			
			const remoteUrl = `http://${host}:${port}`;
			
			// Store in API client
			setApiToken(password);
			setApiBaseUrl(remoteUrl);
			
			// Close dialog
			onOpenChange(false);
		} catch (err: any) {
			setError(err.message || "Invalid link");
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<form onSubmit={handleSubmit}>
					<DialogHeader>
						<DialogTitle>Join a remote session</DialogTitle>
						<DialogDescription>
							Enter the invite link and password to connect to a remote host.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label htmlFor="link">Invite Link</Label>
							<Input
								id="link"
								value={link}
								onChange={(e) => setLink(e.target.value)}
								placeholder="ensemble://join?host=..."
								autoComplete="off"
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								placeholder="Password"
								autoComplete="off"
							/>
						</div>
						{error && <div className="text-sm text-destructive">{error}</div>}
					</div>
					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={!link || !password}>
							Connect
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
