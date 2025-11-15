import { base } from "@/server/context";
import { chatRouter } from "./chat/router";
import { propalRouter } from "./propal/router";

export const appRouter = base.router({
  chat: chatRouter,
  propal: propalRouter,
});
