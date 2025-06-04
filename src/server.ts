import { router } from '@infrastructure/controllers/router';
import { Server } from 'http';
import Koa, { Context } from 'koa';

let server: Server | null = null;

export function start(port = 3000) {
  if (server) return;

  const app = new Koa();

  app.use(router.routes());

  // Default 404 handler
  app.use((ctx: Context) => {
    ctx.throw(404, 'Not Found');
  });

  server = app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
  });
}

export function stop() {
  if (server) server.close();
}
