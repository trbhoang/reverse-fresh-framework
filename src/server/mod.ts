import { createPages, PageModules } from "./routes.ts";
import { createServer } from "./server.ts";

export function setup(pageModules: PageModules[], selfUrl: string) {
  const baseUrl = new URL("./", selfUrl).href;
  const pages = createPages(pageModules, baseUrl);
  console.log(pages);
  const app = createServer(pages);
  app.listen({ port: 8000 });
  app.addEventListener("error", (err) => {
    console.error(err.message);
  });
  addEventListener("fetch", app.fetchEventHandler());
}
