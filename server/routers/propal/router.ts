import { base } from "@/server/context";
import { getPropalsHandler } from "./queries";

export const propalRouter = base.router({
  getPropals: getPropalsHandler,
});
