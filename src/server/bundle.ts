import { denoPlugin, esbuild } from "./deps.ts";
import { Page } from "./routes.ts";

let esbuildInitialized: boolean | Promise<void> = false;
async function ensureEsbuildInitalized() {
  if (esbuildInitialized === false) {
    esbuildInitialized = await esbuild.initialize({
      wasmURL: "https://unpkg.com/esbuild-wasm@0.11.19/esbuild.wasm",
      worker: false,
    });
    await esbuildInitialized;
    esbuildInitialized = true;
  } else if (esbuildInitialized instanceof Promise) {
    await esbuildInitialized;
  }
}

export async function bundle(page: Page): Promise<string> {
  const runtime = new URL("../../runtime.ts", import.meta.url);
  const contents = `
import Page from "${page.url}";
import { h, render } from "${runtime.href}";

addEventListener("DOMContentLoaded", () => {
  const props = JSON.parse(document.getElementById("__FRSH_PROPS").textContent);
  render(h(Page, props), document.body);
});
`;

  await ensureEsbuildInitalized();
  const bundle = await esbuild.build({
    plugins: [denoPlugin({ loader: "portable" })],
    write: false,
    bundle: true,
    minify: true,
    platform: "neutral",
    outfile: "",
    jsxFactory: "h",
    jsxFragment: "Fragment",
    stdin: {
      contents,
      sourcefile: `fresh://entrypoint/${page.name}`,
    },
  });

  return bundle.outputFiles[0].text;
}
