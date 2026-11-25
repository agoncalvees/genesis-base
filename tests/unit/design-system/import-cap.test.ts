import { describe, expect, test } from "vitest";
import { readCapped } from "../../../tools/design-engine/cli";

function streamOf(bytes: number, headers: Record<string, string> = {}) {
	const body = new ReadableStream<Uint8Array>({
		start(controller) {
			let sent = 0;
			while (sent < bytes) {
				const size = Math.min(4096, bytes - sent);
				controller.enqueue(new Uint8Array(size).fill(97));
				sent += size;
			}
			controller.close();
		},
	});
	return new Response(body, { headers });
}

describe("design:import size cap", () => {
	test("reads bodies within the limit", async () => {
		await expect(readCapped(streamOf(10), 100)).resolves.toBe("a".repeat(10));
	});

	test("rejects a declared Content-Length above the limit before reading", async () => {
		await expect(
			readCapped(streamOf(10, { "content-length": "5000" }), 100),
		).rejects.toThrow(/excede 100 bytes/);
	});

	test("aborts a streamed body that grows past the limit without Content-Length", async () => {
		await expect(readCapped(streamOf(20_000), 8_192)).rejects.toThrow(
			/excede 8192 bytes/,
		);
	});
});
