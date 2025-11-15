import { base } from "@/server/context";
import { chatRouter } from "./chat/router";
import { propalRouter } from "./propal/router";
import { sttRouter } from "./stt/router";

export const appRouter = base.router({
  chat: chatRouter,
  propal: propalRouter,
  stt: sttRouter,
});
