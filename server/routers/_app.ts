import { base } from "@/server/context";
import { chatRouter } from "./chat/router";

export const appRouter = base.router({
  chat: chatRouter,
});
