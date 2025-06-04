import { Context } from "koa";
import KoaRouter from "koa-router";
import {
  ILocationService,
  LocationServiceToken,
} from "../ioc/services/location-service.interfaces";
import { container } from "../ioc/container";

export const Router = () => {
  const router = new KoaRouter();

  router.get("/ip/location", async (ctx: Context) => {
    const ip = ctx.query.ip as string;

    if (!ip) {
      ctx.throw(400, "IP parameter is required");
    }

    try {
      const service: ILocationService = await container.getAsync(
        LocationServiceToken
      );

      const location = await service.findIpLocation(ip);
      if (!location) ctx.throw(404, "Not Found");

      ctx.body = location;
    } catch (error) {
      ctx.throw(404, "Not Found");
    }
  });

  return router;
};
