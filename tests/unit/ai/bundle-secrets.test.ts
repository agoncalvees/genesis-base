import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const root = ".vercel/output/static";
const forbidden = [
	"OPENROUTER",
	"AI_MODEL_",
	"openrouter.ai",
	"AI_ENDPOINTS_ENABLED",
	"AI_ACCESS_TOKEN",
];

function scan(dir: string): string[] {
	return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) return scan(path);
		if (!entry.isFile()) return [];
		const data = readFileSync(path);
		return forbidden
			.filter((marker) => data.includes(marker))
			.map((marker) => `${path} includes ${marker}`);
	});
}

const built = existsSync(root);

test.skipIf(!built)(
	built
		? "public Vercel output has no AI environment names or provider URL"
		: "bundle scan skipped — run bun run build to create .vercel/output/static",
	() => expect(scan(root)).toEqual([]),
);
