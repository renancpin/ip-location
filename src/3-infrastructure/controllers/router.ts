import Router from '@koa/router';
import { ipLocationController } from '@infrastructure/controllers/ip-location.controller';

export const router = new Router();

router.use(
  ipLocationController.routes(),
  ipLocationController.allowedMethods(),
);
