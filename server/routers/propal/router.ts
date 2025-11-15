import { call } from "@orpc/server";
import { base } from "@/server/context";
import {
  getPropalBase,
  getPropalHandler,
  getPropalsBase,
  getPropalsHandler,
} from "./queries";

export const propalRouter = base.router({
  getPropals: getPropalsBase.handler(async ({ context }) => {
    return await call(
      getPropalsHandler,
      {},
      {
        context,
      },
    );
  }),

  getPropal: getPropalBase.handler(async ({ context, input }) => {
    return await call(getPropalHandler, input, {
      context,
    });
  }),
});
