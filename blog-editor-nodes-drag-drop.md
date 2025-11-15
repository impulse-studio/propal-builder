# Blog Editor: Nodes, Images, Drag & Drop Implementation

This document explains how Tiptap nodes are implemented, how images are handled (including resizing and upload), and how drag & drop functionality works for moving nodes in the blog editor.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Node Configuration](#node-configuration)
- [Image Handling](#image-handling)
- [Drag & Drop](#drag--drop)
- [Node Movement](#node-movement)
- [File Structure](#file-structure)
- [Data Flow](#data-flow)
- [Key Implementation Details](#key-implementation-details)

## Overview

The blog editor uses Tiptap with custom extensions for:
- **Node Configuration**: Custom HTML attributes and classes for draggable blocks
- **Resizable Images**: Custom image node with resize handles and alignment controls
- **Paste & Drop**: Automatic image upload when pasting or dropping images
- **Drag Handle**: Visual handle for dragging and reordering content blocks

## Architecture

```
┌─────────────────────────────────────────┐
│     Tiptap Editor                       │
│  (tiptap-blog-editor.tsx)               │
└──────────────┬──────────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌──────────────┐  ┌──────────────┐
│ StarterKit   │  │ Custom       │
│ (configured) │  │ Extensions   │
└──────┬───────┘  └──────┬───────┘
       │                 │
       │    ┌────────────┼────────────┐
       │    │            │            │
       ▼    ▼            ▼            ▼
   Paragraph  ResizableImage  PasteDrop  DragHandle
   Lists      Extension       Extension  Extension
   Blockquote
   CodeBlock
   HR
```

## Node Configuration

### Draggable Blocks

All block-level nodes are configured with the `draggable-block` class to enable drag handle functionality:

```47:80:app/(application)/(sidebar-layout)/(single-sidebar)/writing/[id]/edit/_components/tiptap-blog-editor.tsx
                StarterKit.configure({
                    heading: {
                        levels: [1, 2, 3],
                    },
                    paragraph: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                    bulletList: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                    orderedList: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                    blockquote: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                    codeBlock: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                    horizontalRule: {
                        HTMLAttributes: {
                            class: "draggable-block",
                        },
                    },
                }),
```

**Key Points:**
- All block nodes get `draggable-block` class
- This class is used by the drag handle extension to identify draggable elements
- The drag handle appears next to elements with this class

### Node Types

The editor supports these node types:

1. **Paragraph** - Regular text blocks
2. **Headings** - H1, H2, H3
3. **Lists** - Bullet lists and ordered lists
4. **Blockquote** - Quoted text blocks
5. **Code Block** - Code snippets
6. **Horizontal Rule** - Dividers
7. **Image** - Resizable images (custom implementation)

## Image Handling

### Resizable Image Extension

**Location:** `lib/utils/tiptap/resizable-image-extension.tsx`

The `ResizableImageExtension` is a custom Tiptap Node that extends the base Image node with resizing capabilities.

**Key Features:**
- Block-level image node (not inline)
- Custom attributes: `src`, `alt`, `title`, `align`, `width`, `height`
- React NodeView for interactive UI
- Draggable images

**Configuration:**

```98:104:app/(application)/(sidebar-layout)/(single-sidebar)/writing/[id]/edit/_components/tiptap-blog-editor.tsx
                ResizableImageExtension.configure({
                    inline: false,
                    allowBase64: false,
                    HTMLAttributes: {
                        class: "max-w-full h-auto rounded-lg my-4",
                    },
                }),
```

**Extension Implementation:**

```29:143:lib/utils/tiptap/resizable-image-extension.tsx
export const ResizableImageExtension = Node.create<ImageOptions>({
    name: "image",

    addOptions() {
        return {
            inline: false,
            allowBase64: true,
            HTMLAttributes: {},
        };
    },

    inline() {
        return this.options.inline;
    },

    group() {
        return this.options.inline ? "inline" : "block";
    },

    draggable: true,

    addAttributes() {
        return {
            src: {
                default: null,
            },
            alt: {
                default: null,
            },
            title: {
                default: null,
            },
            align: {
                default: "center",
                renderHTML: (attributes) => {
                    if (!attributes.align) {
                        return {};
                    }
                    return {
                        "data-align": attributes.align,
                    };
                },
                parseHTML: (element) =>
                    element.getAttribute("data-align") || "center",
            },
            width: {
                default: null,
                renderHTML: (attributes) => {
                    if (!attributes.width) {
                        return {};
                    }
                    return {
                        width: attributes.width,
                    };
                },
                parseHTML: (element) => {
                    const width = element.getAttribute("width");
                    if (!width) return null;
                    const parsed = Number.parseInt(width, 10);
                    return Number.isNaN(parsed) ? null : parsed;
                },
            },
            height: {
                default: null,
                renderHTML: (attributes) => {
                    if (!attributes.height) {
                        return {};
                    }
                    return {
                        height: attributes.height,
                    };
                },
                parseHTML: (element) => {
                    const height = element.getAttribute("height");
                    if (!height) return null;
                    const parsed = Number.parseInt(height, 10);
                    return Number.isNaN(parsed) ? null : parsed;
                },
            },
        };
    },

    parseHTML() {
        return [
            {
                tag: this.options.allowBase64
                    ? "img[src]"
                    : 'img[src]:not([src^="data:"])',
            },
        ];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "img",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(ResizableImageNode);
    },

    addCommands() {
        return {
            setImage:
                (options) =>
                ({ commands }) =>
                    commands.insertContent({
                        type: this.name,
                        attrs: options,
                    }),
        };
    },
});
```

**Attributes:**
- `src`: Image URL (required)
- `alt`: Alt text for accessibility
- `title`: Tooltip text
- `align`: Alignment (`left`, `center`, `right`)
- `width`: Width in pixels
- `height`: Height in pixels

### Resizable Image Node View

**Location:** `lib/utils/tiptap/resizable-image-node.tsx`

The `ResizableImageNode` is a React component that renders the image with interactive controls.

**Features:**
- Resize handles using `interactjs`
- Aspect ratio preservation
- Alignment controls (left, center, right)
- Visual feedback when selected
- Size constraints (min: 100x100, max: 1200x1200)

**Implementation:**

```21:193:lib/utils/tiptap/resizable-image-node.tsx
export const ResizableImageNode = ({
    node,
    updateAttributes,
    selected,
}: NodeViewProps) => {
    const imageRef = useRef<HTMLImageElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);
    const [aspectRatio, setAspectRatio] = useState<number | null>(null);
    const attributes = node.attrs as ImageAttributes;

    useEffect(() => {
        if (!(imageRef.current && containerRef.current)) return;

        const interactable = interact(containerRef.current).resizable({
            edges: { left: true, right: true, bottom: true, top: false },
            listeners: {
                start() {
                    setIsResizing(true);
                },
                move(event) {
                    const { width, height } = event.rect;

                    if (aspectRatio && event.edges?.bottom) {
                        const newHeight = width / aspectRatio;
                        event.target.style.width = `${width}px`;
                        event.target.style.height = `${newHeight}px`;
                        updateAttributes({
                            width: Math.round(width),
                            height: Math.round(newHeight),
                        });
                    } else {
                        event.target.style.width = `${width}px`;
                        event.target.style.height = `${height}px`;
                        updateAttributes({
                            width: Math.round(width),
                            height: Math.round(height),
                        });
                    }
                },
                end() {
                    setIsResizing(false);
                },
            },
            modifiers: [
                interact.modifiers.restrictSize({
                    min: { width: 100, height: 100 },
                    max: { width: 1200, height: 1200 },
                }),
            ],
            inertia: true,
        });

        return () => {
            interactable.unset();
        };
    }, [aspectRatio, updateAttributes]);

    const handleImageLoad = () => {
        if (imageRef.current) {
            const { naturalWidth, naturalHeight } = imageRef.current;
            setAspectRatio(naturalWidth / naturalHeight);
        }
    };

    const handleAlignChange = (align: "left" | "center" | "right") => {
        updateAttributes({ align });
    };

    return (
        <NodeViewWrapper
            className={cn(
                "relative",
                attributes.align === "left" && "text-left",
                attributes.align === "center" && "text-center",
                attributes.align === "right" && "text-right"
            )}
        >
            <div
                className={cn(
                    "relative inline-block max-w-full",
                    selected && "ring-2 ring-primary-base ring-offset-2",
                    isResizing && "cursor-nwse-resize"
                )}
                ref={containerRef}
                style={{
                    width: attributes.width || "auto",
                    height: attributes.height || "auto",
                }}
            >
                <img
                    alt={attributes.alt || ""}
                    className="block h-full w-full object-contain"
                    draggable={false}
                    onLoad={handleImageLoad}
                    ref={imageRef}
                    src={attributes.src}
                    title={attributes.title || ""}
                />

                {selected && (
                    <>
                        <div className="-right-2 -top-2 -bottom-2 absolute w-1 cursor-ew-resize hover:bg-primary-base/20" />
                        <div className="-left-2 -top-2 -bottom-2 absolute w-1 cursor-ew-resize hover:bg-primary-base/20" />
                        <div className="-bottom-2 -left-2 -right-2 absolute h-1 cursor-ns-resize hover:bg-primary-base/20" />

                        <div className="absolute top-2 left-2 flex gap-1 rounded-md bg-bg-white-0/90 p-1 shadow-regular-xs backdrop-blur-sm">
                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Button.Root
                                        mode={
                                            attributes.align === "left"
                                                ? "filled"
                                                : "ghost"
                                        }
                                        onClick={() =>
                                            handleAlignChange("left")
                                        }
                                        size="xxsmall"
                                        variant="neutral"
                                    >
                                        <Button.Icon as={RiAlignLeft} />
                                    </Button.Root>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Align left</Tooltip.Content>
                            </Tooltip.Root>

                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Button.Root
                                        mode={
                                            attributes.align === "center"
                                                ? "filled"
                                                : "ghost"
                                        }
                                        onClick={() =>
                                            handleAlignChange("center")
                                        }
                                        size="xxsmall"
                                        variant="neutral"
                                    >
                                        <Button.Icon as={RiAlignCenter} />
                                    </Button.Root>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Align center</Tooltip.Content>
                            </Tooltip.Root>

                            <Tooltip.Root>
                                <Tooltip.Trigger asChild>
                                    <Button.Root
                                        mode={
                                            attributes.align === "right"
                                                ? "filled"
                                                : "ghost"
                                        }
                                        onClick={() =>
                                            handleAlignChange("right")
                                        }
                                        size="xxsmall"
                                        variant="neutral"
                                    >
                                        <Button.Icon as={RiAlignRight} />
                                    </Button.Root>
                                </Tooltip.Trigger>
                                <Tooltip.Content>Align right</Tooltip.Content>
                            </Tooltip.Root>
                        </div>
                    </>
                )}
            </div>
        </NodeViewWrapper>
    );
};
```

**Resize Behavior:**
- Resize handles appear on left, right, and bottom edges
- Aspect ratio is preserved when resizing from bottom edge
- Free resize available from left/right edges
- Size constraints enforced by `interactjs` modifiers

**Alignment Controls:**
- Appear when image is selected
- Three options: left, center, right
- Updates `align` attribute which affects CSS classes

### Image Upload

**Location:** `lib/utils/tiptap/upload-image.ts`

Images are uploaded to Vercel Blob storage with progress tracking.

**Implementation:**

```20:64:lib/utils/tiptap/upload-image.ts
export async function uploadEditorImage(
    file: File,
    messages?: UploadMessages
): Promise<string> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        throw new Error(
            "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed."
        );
    }

    if (file.size > MAX_FILE_SIZE) {
        throw new Error(
            `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`
        );
    }

    const toastId = toast.loading(messages?.uploading || "Uploading image...");

    try {
        const extension = file.name.split(".").pop() || "jpg";
        const filename = `editor-images/${ulid()}.${extension}`;

        const { url } = await upload(filename, file, {
            access: "public",
            handleUploadUrl: "/api/upload/editor-images",
            onUploadProgress: (event) => {
                const progress = Math.round((event.loaded / event.total) * 100);
                const message = messages?.uploadingWithProgress
                    ? messages.uploadingWithProgress(progress)
                    : `Uploading image... ${progress}%`;
                toast.loading(message, { id: toastId });
            },
        });

        toast.success(messages?.success || "Image uploaded successfully", {
            id: toastId,
        });
        return url;
    } catch (error) {
        toast.error(messages?.error || "Failed to upload image", {
            id: toastId,
        });
        throw error;
    }
}
```

**Upload API Route:**

```6:54:app/api/upload/editor-images/route.ts
export async function POST(request: NextRequest): Promise<NextResponse> {
    const body = (await request.json()) as HandleUploadBody;

    try {
        const jsonResponse = await handleUpload({
            body,
            request,
            onBeforeGenerateToken: async () => {
                const session = await getServerSession();

                if (!session?.user?.id)
                    return {
                        allowedContentTypes: [],
                        tokenPayload: null,
                    };

                return {
                    allowedContentTypes: [
                        "image/jpeg",
                        "image/png",
                        "image/webp",
                        "image/gif",
                    ],
                    maxSize: 10 * 1024 * 1024,
                    tokenPayload: JSON.stringify({
                        userId: session.user.id,
                    }),
                };
            },
            onUploadCompleted: async ({ tokenPayload }) => {
                try {
                    if (!tokenPayload) {
                        throw new Error("No token payload");
                    }
                } catch (error) {
                    console.error(error);
                    throw new Error("Failed to process editor image upload");
                }
            },
        });

        return NextResponse.json(jsonResponse);
    } catch (error) {
        return NextResponse.json(
            { error: (error as Error).message },
            { status: 400 }
        );
    }
}
```

**Upload Constraints:**
- Allowed types: JPEG, PNG, WebP, GIF
- Max size: 10MB
- Requires authentication
- Files stored in `editor-images/` directory with ULID filenames

## Drag & Drop

### Paste & Drop Extension

**Location:** `lib/utils/tiptap/paste-drop-extension.tsx`

The `PasteDropExtension` handles both paste and drop events for images.

**Features:**
- Handles paste events (Ctrl+V / Cmd+V)
- Handles drop events (drag files into editor)
- Automatic image upload
- Error handling with custom messages
- Position-aware insertion

**Implementation:**

```14:177:lib/utils/tiptap/paste-drop-extension.tsx
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
                        const items = Array.from(
                            event.clipboardData?.items || []
                        );
                        const images = items.filter((item) =>
                            item.type.startsWith("image/")
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
                                            view.state.tr.replaceSelectionWith(
                                                node
                                            );
                                        view.dispatch(transaction);
                                    })
                                    .catch((error) => {
                                        console.error(
                                            "Failed to upload image:",
                                            error
                                        );
                                        const errorMessage =
                                            error instanceof Error
                                                ? error.message
                                                : errorMessages?.genericError ||
                                                  "Failed to upload image";

                                        // Use custom error messages if they match known patterns
                                        if (
                                            errorMessage.includes(
                                                "Invalid file type"
                                            )
                                        ) {
                                            toast.error(
                                                errorMessages?.invalidFileType ||
                                                    errorMessage
                                            );
                                        } else if (
                                            errorMessage.includes(
                                                "File size exceeds"
                                            )
                                        ) {
                                            toast.error(
                                                errorMessages?.fileTooLarge ||
                                                    errorMessage
                                            );
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
                            file.type.startsWith("image/")
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
                                        node
                                    );
                                    view.dispatch(transaction);
                                })
                                .catch((error) => {
                                    console.error(
                                        "Failed to upload image:",
                                        error
                                    );
                                    const errorMessage =
                                        error instanceof Error
                                            ? error.message
                                            : errorMessages?.genericError ||
                                              "Failed to upload image";

                                    // Use custom error messages if they match known patterns
                                    if (
                                        errorMessage.includes(
                                            "Invalid file type"
                                        )
                                    ) {
                                        toast.error(
                                            errorMessages?.invalidFileType ||
                                                errorMessage
                                        );
                                    } else if (
                                        errorMessage.includes(
                                            "File size exceeds"
                                        )
                                    ) {
                                        toast.error(
                                            errorMessages?.fileTooLarge ||
                                                errorMessage
                                        );
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
```

**Paste Behavior:**
- Detects image files in clipboard
- Replaces current selection with image node
- Uploads image asynchronously
- Shows error toast on failure

**Drop Behavior:**
- Detects image files in drop event
- Calculates drop position using `posAtCoords`
- Inserts image at drop position
- Uploads image asynchronously
- Shows error toast on failure

**Configuration:**

```105:114:app/(application)/(sidebar-layout)/(single-sidebar)/writing/[id]/edit/_components/tiptap-blog-editor.tsx
                PasteDropExtension.configure({
                    handleUpload: uploadWithMessages,
                    errorMessages: {
                        invalidFileType: t("errors.invalidFileType"),
                        fileTooLarge: t("errors.fileTooLarge", {
                            fileSize: "unknown",
                        }),
                        genericError: t("errors.genericError"),
                    },
                }),
```

## Node Movement

### Drag Handle Extension

**Location:** `lib/utils/tiptap/drag-handle-extension.tsx`

The `OfficialDragHandle` uses Tiptap's official drag handle extension to enable block reordering.

**Features:**
- Visual drag handle appears on hover
- Custom styled handle with SVG icon
- Theme-aware (light/dark mode)
- Smooth animations
- Positioned on the left side of blocks

**Implementation:**

```1:116:lib/utils/tiptap/drag-handle-extension.tsx
import DragHandle from "@tiptap/extension-drag-handle";

export const OfficialDragHandle = DragHandle.configure({
    render: () => {
        const element = document.createElement("div");
        element.className = "drag-handle-container";

        element.style.cssText = `
            z-index: 50;
            cursor: grab;
            border-radius: 6px;
            padding: 6px;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.15s ease;
            backdrop-filter: blur(8px);
        `;

        element.innerHTML = `
            <div class="drag-handle" style="display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;">
                <svg width="8" height="12" viewBox="0 0 8 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="2" cy="2" r="1" fill="currentColor"/>
                    <circle cx="6" cy="2" r="1" fill="currentColor"/>
                    <circle cx="2" cy="6" r="1" fill="currentColor"/>
                    <circle cx="6" cy="6" r="1" fill="currentColor"/>
                    <circle cx="2" cy="10" r="1" fill="currentColor"/>
                    <circle cx="6" cy="10" r="1" fill="currentColor"/>
                </svg>
            </div>
        `;

        const updateTheme = (isDark?: boolean) => {
            const darkMode =
                isDark ??
                (window.matchMedia("(prefers-color-scheme: dark)").matches ||
                    document.documentElement.classList.contains("dark"));

            if (darkMode) {
                element.style.background = "rgba(39, 39, 42, 0.8)";
                element.style.border = "1px solid rgba(255, 255, 255, 0.1)";
                element.style.color = "rgba(161, 161, 170, 0.8)";
                element.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.3)";
            } else {
                element.style.background = "rgba(255, 255, 255, 0.8)";
                element.style.border = "1px solid rgba(0, 0, 0, 0.1)";
                element.style.color = "rgba(107, 114, 128, 0.7)";
                element.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
            }
        };

        updateTheme();

        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        mediaQuery.addEventListener("change", (e) => updateTheme(e.matches));

        const observer = new MutationObserver(() => {
            updateTheme();
        });
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });

        element.addEventListener("mouseenter", () => {
            element.style.transform = "scale(1.05)";
            element.style.cursor = "grab";

            const darkMode =
                window.matchMedia("(prefers-color-scheme: dark)").matches ||
                document.documentElement.classList.contains("dark");

            if (darkMode) {
                element.style.background = "rgba(63, 63, 70, 0.9)";
                element.style.color = "rgba(212, 212, 216, 0.9)";
                element.style.borderColor = "rgba(255, 255, 255, 0.2)";
            } else {
                element.style.background = "rgba(249, 250, 251, 0.9)";
                element.style.color = "rgba(75, 85, 99, 0.9)";
                element.style.borderColor = "rgba(0, 0, 0, 0.15)";
            }
        });

        element.addEventListener("mouseleave", () => {
            element.style.transform = "scale(1)";
            updateTheme();
        });

        element.addEventListener("mousedown", () => {
            element.style.cursor = "grabbing";
            element.style.transform = "scale(0.95)";
        });

        element.addEventListener("mouseup", () => {
            element.style.cursor = "grab";
            element.style.transform = "scale(1.05)";
        });

        return element;
    },

    tippyOptions: {
        placement: "left-start",
        offset: [4, 28],
        duration: [200, 0],
        animation: "fade",
        hideOnClick: false,
        interactive: true,
        getReferenceClientRect: () =>
            document
                .querySelector(".drag-handle-container")
                ?.getBoundingClientRect() || new DOMRect(),
    },
});
```

**Drag Handle Behavior:**
- Appears on hover next to draggable blocks
- Uses Tippy.js for positioning
- Theme-aware styling
- Smooth hover animations
- Cursor changes: `grab` → `grabbing`

**Styling:**

```1:113:app/(application)/(sidebar-layout)/(single-sidebar)/writing/[id]/edit/_components/drag-handle-styles.css
.drag-handle-container {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    z-index: 50;
    transition: opacity 0.2s ease-in-out;
    cursor: grab;
}

.drag-handle-container:active {
    cursor: grabbing;
}

.drag-handle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 4px;
    background-color: transparent;
    transition: all 0.2s ease-in-out;
    color: rgb(var(--text-soft-400));
}

.drag-handle:hover {
    background-color: rgb(var(--bg-weak-50));
    color: rgb(var(--text-sub-600));
}

.dark .drag-handle:hover {
    background-color: rgb(var(--bg-weak-950));
    color: rgb(var(--text-soft-400));
}

.drag-handle svg {
    width: 16px;
    height: 16px;
}

/* Dragging state */
.drag-handle-container.is-dragging .drag-handle {
    background-color: rgb(var(--bg-weak-100));
    color: rgb(var(--text-strong-950));
    transform: scale(1.1);
}

.dark .drag-handle-container.is-dragging .drag-handle {
    background-color: rgb(var(--bg-weak-800));
    color: rgb(var(--text-strong-100));
}

/* Visual feedback during drag */
.ProseMirror.is-dragging {
    cursor: grabbing;
}

.ProseMirror .is-drag-over {
    position: relative;
}

.ProseMirror .is-drag-over::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background-color: rgb(var(--primary-base));
    z-index: 100;
}

.ProseMirror .is-drag-over-top::before {
    top: -1px;
}

.ProseMirror .is-drag-over-bottom::before {
    bottom: -1px;
}

/* Smooth transitions for blocks during reordering */
.ProseMirror > * {
    transition: transform 0.2s ease-in-out;
}

/* Ghost element while dragging */
.ProseMirror .is-dragging {
    opacity: 0.5;
}

/* Drop indicator line */
.drop-indicator {
    position: absolute;
    left: 0;
    right: 0;
    height: 2px;
    background-color: rgb(var(--primary-base));
    z-index: 1000;
    pointer-events: none;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}
```

**Visual Feedback:**
- Drop indicator line shows where block will be inserted
- Dragged block becomes semi-transparent
- Smooth transitions during reordering
- Pulse animation on drop indicator

## File Structure

```
lib/utils/tiptap/
├── drag-handle-extension.tsx      # Drag handle for block reordering
├── paste-drop-extension.tsx       # Paste & drop image handling
├── resizable-image-extension.tsx  # Image node extension
├── resizable-image-node.tsx       # React component for image node
├── upload-image.ts               # Image upload utility
└── slash-extension.tsx            # Slash commands (separate doc)

app/(application)/.../writing/[id]/edit/_components/
├── tiptap-blog-editor.tsx         # Main editor component
└── drag-handle-styles.css         # Drag handle styling

app/api/upload/
└── editor-images/route.ts        # Image upload API endpoint
```

## Data Flow

### Image Upload Flow

1. **User pastes/drops image** → `PasteDropExtension` detects event
2. **File extracted** → From clipboard or drop event
3. **Upload initiated** → `uploadEditorImage()` called
4. **Validation** → File type and size checked
5. **Upload to Vercel Blob** → Via `/api/upload/editor-images`
6. **Progress tracking** → Toast notifications with progress
7. **URL returned** → Image URL from Vercel Blob
8. **Node created** → Image node inserted into editor
9. **Success notification** → Toast success message

### Drag & Drop Flow

1. **User drags block** → Drag handle clicked
2. **Drag starts** → Tiptap drag handle extension activates
3. **Visual feedback** → Block becomes semi-transparent
4. **Drag over target** → Drop indicator appears
5. **Position calculated** → Based on mouse position
6. **Drop** → Block moved to new position
7. **Transaction dispatched** → ProseMirror transaction updates document
8. **Visual reset** → Opacity returns to normal

### Image Resize Flow

1. **User selects image** → Image node becomes selected
2. **Resize handles appear** → Left, right, bottom edges
3. **User drags handle** → `interactjs` handles resize
4. **Aspect ratio preserved** → When resizing from bottom
5. **Size constraints enforced** → Min/max limits applied
6. **Attributes updated** → Width/height saved to node
7. **Visual update** → Image resizes in real-time

## Key Implementation Details

### Node Identification

- Blocks marked with `draggable-block` class are draggable
- Drag handle appears automatically for these blocks
- Custom styling applied via CSS classes

### Image Resizing

- Uses `interactjs` library for resize interactions
- Aspect ratio calculated from natural image dimensions
- Size constraints: 100x100 to 1200x1200 pixels
- Inertia enabled for smooth dragging

### Upload Handling

- Asynchronous upload with progress tracking
- Error handling with specific error messages
- Toast notifications for user feedback
- Files stored with ULID for uniqueness

### Drag Handle Positioning

- Uses Tippy.js for tooltip positioning
- Positioned on left side of blocks
- Theme-aware styling
- Smooth animations on hover/interaction

### ProseMirror Integration

- All extensions use ProseMirror plugins
- Transactions used for document updates
- Node views for React components
- Schema defines node structure

## Troubleshooting

### Images not uploading
- Check file type is allowed (JPEG, PNG, WebP, GIF)
- Verify file size is under 10MB
- Check authentication session is valid
- Review API route logs

### Drag handle not appearing
- Verify `draggable-block` class is on elements
- Check `OfficialDragHandle` extension is included
- Ensure Tippy.js is working correctly
- Check CSS styles are loaded

### Images not resizing
- Verify `interactjs` is installed
- Check `ResizableImageNode` is rendering
- Ensure image has loaded (aspect ratio calculation)
- Verify resize handles are visible when selected

### Drop not working
- Check `PasteDropExtension` is configured
- Verify `handleUpload` function is provided
- Check browser console for errors
- Ensure drop event is not prevented elsewhere

## Related Files

- **Slash Commands:** `docs/blog-editor-slash-commands.md`
- **Tiptap Editor:** `app/(application)/.../tiptap-blog-editor.tsx`
- **Image Upload API:** `app/api/upload/editor-images/route.ts`
- **Drag Handle Styles:** `app/(application)/.../drag-handle-styles.css`

