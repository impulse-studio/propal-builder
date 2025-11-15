import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { toast } from "sonner";

export interface PasteDropOptions {
  handleUpload: (file: File) => Promise<string>;
  errorMessages?: {
    invalidFileType?: string;
    fileTooLarge?: string;
    genericError?: string;
  };
}

export const PasteDropExtension = Extension.create<PasteDropOptions>({
  name: "pasteDrop",

  addOptions() {
    return {
      handleUpload: async () => "",
      errorMessages: {
        invalidFileType:
          "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        fileTooLarge: "File size exceeds limit.",
        genericError: "Failed to upload image",
      },
    };
  },

  addProseMirrorPlugins() {
    const { handleUpload, errorMessages } = this.options;

    return [
      new Plugin({
        key: new PluginKey("pasteDrop"),
        props: {
          handlePaste: (view, event) => {
            const items = Array.from(event.clipboardData?.items || []);
            const images = items.filter((item) =>
              item.type.startsWith("image/"),
            );

            if (images.length === 0) return false;

            event.preventDefault();

            images.forEach((item) => {
              const file = item.getAsFile();
              if (file) {
                handleUpload(file)
                  .then((url) => {
                    const { schema } = view.state;
                    const node = schema.nodes.image.create({
                      src: url,
                    });

                    const transaction =
                      view.state.tr.replaceSelectionWith(node);
                    view.dispatch(transaction);
                  })
                  .catch((error) => {
                    console.error("Failed to upload image:", error);
                    const errorMessage =
                      error instanceof Error
                        ? error.message
                        : errorMessages?.genericError ||
                          "Failed to upload image";

                    // Use custom error messages if they match known patterns
                    if (errorMessage.includes("Invalid file type")) {
                      toast.error(
                        errorMessages?.invalidFileType || errorMessage,
                      );
                    } else if (errorMessage.includes("File size exceeds")) {
                      toast.error(errorMessages?.fileTooLarge || errorMessage);
                    } else {
                      toast.error(errorMessage);
                    }
                  });
              }
            });

            return true;
          },

          handleDrop: (view, event) => {
            if (!event.dataTransfer?.files?.length) return false;

            const files = Array.from(event.dataTransfer.files);
            const images = files.filter((file) =>
              file.type.startsWith("image/"),
            );

            if (images.length === 0) return false;

            event.preventDefault();

            const coordinates = view.posAtCoords({
              left: event.clientX,
              top: event.clientY,
            });

            images.forEach((file) => {
              handleUpload(file)
                .then((url) => {
                  const { schema } = view.state;
                  const node = schema.nodes.image.create({
                    src: url,
                  });

                  const transaction = view.state.tr.insert(
                    coordinates?.pos || 0,
                    node,
                  );
                  view.dispatch(transaction);
                })
                .catch((error) => {
                  console.error("Failed to upload image:", error);
                  const errorMessage =
                    error instanceof Error
                      ? error.message
                      : errorMessages?.genericError || "Failed to upload image";

                  // Use custom error messages if they match known patterns
                  if (errorMessage.includes("Invalid file type")) {
                    toast.error(errorMessages?.invalidFileType || errorMessage);
                  } else if (errorMessage.includes("File size exceeds")) {
                    toast.error(errorMessages?.fileTooLarge || errorMessage);
                  } else {
                    toast.error(errorMessage);
                  }
                });
            });

            return true;
          },
        },
      }),
    ];
  },
});
