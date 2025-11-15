import { upload } from "@vercel/blob/client";
import { toast } from "sonner";
import { ulid } from "ulid";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface UploadMessages {
  uploading?: string;
  uploadingWithProgress?: (progress: number) => string;
  success?: string;
  error?: string;
}

export async function uploadEditorImage(
  file: File,
  messages?: UploadMessages,
): Promise<string> {
  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number],
    )
  ) {
    throw new Error(
      "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      `File size exceeds 10MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
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
