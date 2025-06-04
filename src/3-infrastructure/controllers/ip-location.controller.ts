import { GetLocationUseCase } from '@application/use-cases/get-location.usecase';
import { container } from '@infrastructure/ioc/container';
import Router from '@koa/router';
import { Context } from 'koa';

const router = new Router();

router.get('/ip/location', async (ctx: Context) => {
  const ip = ctx.query.ip as string;
  if (!ip) ctx.throw(400, 'IP parameter is required');

  const useCase = await container.getAsync(GetLocationUseCase);
  const location = await useCase.execute({ ip });
  if (!location) ctx.throw(404, 'Not Found');

  ctx.body = location;
});

export const ipLocationController = router;
