import { base } from "@/server/context";
import { sendMessageHandler } from "./mutations/send-message";

export const chatRouter = base.router({
  sendMessage: sendMessageHandler,
});
