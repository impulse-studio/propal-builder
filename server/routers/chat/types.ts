import type { InferUITool, UIMessage } from "ai";
import type { editorTools } from "./tools/editor-tools";

type FindAndReplaceTool = InferUITool<typeof editorTools.findAndReplace>;
type InsertAtPositionTool = InferUITool<typeof editorTools.insertAtPosition>;
type ReplaceSectionTool = InferUITool<typeof editorTools.replaceSection>;
type SetDocumentContentTool = InferUITool<
  typeof editorTools.setDocumentContent
>;
type DeleteTextTool = InferUITool<typeof editorTools.deleteText>;
type GetDocumentContentTool = InferUITool<
  typeof editorTools.getDocumentContent
>;
type InsertPricingCardTool = InferUITool<typeof editorTools.insertPricingCard>;
type InsertFeatureListTool = InferUITool<typeof editorTools.insertFeatureList>;
type InsertCallToActionTool = InferUITool<
  typeof editorTools.insertCallToAction
>;
type UpdateBlockTool = InferUITool<typeof editorTools.updateBlock>;
type DeleteBlockTool = InferUITool<typeof editorTools.deleteBlock>;
type GetBlockTool = InferUITool<typeof editorTools.getBlock>;
type GetAllBlocksTool = InferUITool<typeof editorTools.getAllBlocks>;

export type ChatUITools = {
  findAndReplace: FindAndReplaceTool;
  insertAtPosition: InsertAtPositionTool;
  replaceSection: ReplaceSectionTool;
  setDocumentContent: SetDocumentContentTool;
  deleteText: DeleteTextTool;
  getDocumentContent: GetDocumentContentTool;
  insertPricingCard: InsertPricingCardTool;
  insertFeatureList: InsertFeatureListTool;
  insertCallToAction: InsertCallToActionTool;
  updateBlock: UpdateBlockTool;
  deleteBlock: DeleteBlockTool;
  getBlock: GetBlockTool;
  getAllBlocks: GetAllBlocksTool;
};

type ChatMetadata = {
  sessionId: {
    sessionId: string;
  };
};

export type ChatUIMessage = UIMessage<never, ChatMetadata, ChatUITools>;
