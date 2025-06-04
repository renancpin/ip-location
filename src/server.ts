import Koa, { Context } from "koa";
import { Router } from "./routes/router";
import { Server } from "http";

let server: Server | null = null;

export function start(port = 3000) {
  if (!server) {
    const app = new Koa();
    const router = Router();

    app.use(router.routes());
    app.use(router.allowedMethods());

    // Default 404 handler
    app.use(async (ctx: Context) => {
      ctx.throw(404, "Not Found");
    });

    server = app.listen(port, () => {
      console.log(`Server listening at http://localhost:${port}`);
    });
  }
}

export function stop() {
  if (server) {
    server.close();
  }
}
