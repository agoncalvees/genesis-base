/** Font registry: family -> package, license and the CSS entry points to load. */
export const fonts: Record<
	string,
	{ package: string | null; license: string; imports: readonly string[] }
> = {
	"system-ui": { package: null, license: "system", imports: [] },
	"-apple-system": { package: null, license: "system", imports: [] },
	"Segoe UI": { package: null, license: "system", imports: [] },
	"sans-serif": { package: null, license: "system", imports: [] },
	serif: { package: null, license: "system", imports: [] },
	"ui-monospace": { package: null, license: "system", imports: [] },
	"SF Mono": { package: null, license: "system", imports: [] },
	Menlo: { package: null, license: "system", imports: [] },
	Consolas: { package: null, license: "system", imports: [] },
	monospace: { package: null, license: "system", imports: [] },
	"IBM Plex Sans Variable": {
		package: "@fontsource-variable/ibm-plex-sans",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/ibm-plex-sans"],
	},
	"IBM Plex Mono": {
		package: "@fontsource/ibm-plex-mono",
		license: "OFL-1.1",
		imports: [
			"@fontsource/ibm-plex-mono/400.css",
			"@fontsource/ibm-plex-mono/600.css",
		],
	},
	"Bricolage Grotesque Variable": {
		package: "@fontsource-variable/bricolage-grotesque",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/bricolage-grotesque"],
	},
	"Figtree Variable": {
		package: "@fontsource-variable/figtree",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/figtree"],
	},
	"Sora Variable": {
		package: "@fontsource-variable/sora",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/sora"],
	},
	"Instrument Serif": {
		package: "@fontsource/instrument-serif",
		license: "OFL-1.1",
		imports: [
			"@fontsource/instrument-serif/400.css",
			"@fontsource/instrument-serif/400-italic.css",
		],
	},
	"Archivo Variable": {
		package: "@fontsource-variable/archivo",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/archivo/wdth.css"],
	},
	Georgia: { package: null, license: "system", imports: [] },
	"JetBrains Mono Variable": {
		package: "@fontsource-variable/jetbrains-mono",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/jetbrains-mono"],
	},
	"Newsreader Variable": {
		package: "@fontsource-variable/newsreader",
		license: "OFL-1.1",
		imports: ["@fontsource-variable/newsreader"],
	},
	"Atkinson Hyperlegible": {
		package: "@fontsource/atkinson-hyperlegible",
		license: "OFL-1.1",
		imports: [
			"@fontsource/atkinson-hyperlegible/400.css",
			"@fontsource/atkinson-hyperlegible/700.css",
		],
	},
};
