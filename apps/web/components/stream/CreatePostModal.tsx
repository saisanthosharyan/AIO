"use client";

import {
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import Image from "next/image";

import {
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";

import {
  uploadImage,
} from "@/lib/api";

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (
    post: CreatePostData,
  ) => Promise<void>;
}

const MAX_IMAGE_SIZE =
  5 * 1024 * 1024;

function fileToDataUrl(
  file: File,
): Promise<string> {
  return new Promise(
    (resolve, reject) => {
      const reader =
        new FileReader();

      reader.onload = () => {
        if (
          typeof reader.result ===
          "string"
        ) {
          resolve(
            reader.result,
          );
          return;
        }

        reject(
          new Error(
            "Failed to read image",
          ),
        );
      };

      reader.onerror = () => {
        reject(
          new Error(
            "Failed to read image",
          ),
        );
      };

      reader.readAsDataURL(file);
    },
  );
}

export default function CreatePostModal({
  open,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const [
    content,
    setContent,
  ] = useState("");

  const [
    selectedImage,
    setSelectedImage,
  ] = useState<File | null>(
    null,
  );

  const [
    imagePreviewUrl,
    setImagePreviewUrl,
  ] = useState<
    string | null
  >(null);

  const [
    publishing,
    setPublishing,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(
      null,
    );

  function revokePreviewUrl() {
    if (
      imagePreviewUrl
    ) {
      URL.revokeObjectURL(
        imagePreviewUrl,
      );
    }
  }

  function resetForm() {
    revokePreviewUrl();

    setContent("");
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setError("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  function handleClose() {
    if (publishing) {
      return;
    }

    resetForm();
    onClose();
  }

  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setError(
        "Please select a valid image file.",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_IMAGE_SIZE
    ) {
      setError(
        "Image must be smaller than 5MB.",
      );

      event.target.value = "";
      return;
    }

    revokePreviewUrl();

    const previewUrl =
      URL.createObjectURL(file);

    setSelectedImage(file);
    setImagePreviewUrl(
      previewUrl,
    );
  }

  function handleRemoveImage() {
    revokePreviewUrl();

    setSelectedImage(null);
    setImagePreviewUrl(null);
    setError("");

    if (
      fileInputRef.current
    ) {
      fileInputRef.current.value =
        "";
    }
  }

  async function handlePublish() {
    if (publishing) {
      return;
    }

    const trimmedContent =
      content.trim();

    if (
      !trimmedContent &&
      !selectedImage
    ) {
      setError(
        "Write something or select an image before publishing.",
      );
      return;
    }

    try {
      setPublishing(true);
      setError("");

      let imageUrl:
        | string
        | undefined;

      /*
       * Step 1:
       * Convert the selected image
       * to Base64.
       */
      if (selectedImage) {
        const imageData =
          await fileToDataUrl(
            selectedImage,
          );

        /*
         * Step 2:
         * Upload the Base64 image
         * to the Express backend.
         */
        const uploadResponse =
          await uploadImage(
            imageData,
          );

        if (
          !uploadResponse.success ||
          !uploadResponse.imageUrl
        ) {
          throw new Error(
            uploadResponse.message ||
              "Image upload failed",
          );
        }

        /*
         * Step 3:
         * Backend returns:
         *
         * /uploads/posts/file.png
         *
         * Convert it into a complete
         * backend URL for the browser.
         */
        const apiUrl =
          process.env
            .NEXT_PUBLIC_API_URL ??
          "http://localhost:5000";

        imageUrl =
          uploadResponse.imageUrl.startsWith(
            "http",
          )
            ? uploadResponse.imageUrl
            : `${apiUrl.replace(
                /\/$/,
                "",
              )}${uploadResponse.imageUrl}`;
      }

      /*
       * Step 4:
       * Create the post using the
       * uploaded image URL.
       */
      await onPublish({
        content:
          trimmedContent,
        imageUrl,
      });

      /*
       * Step 5:
       * Reset the modal only after
       * everything succeeded.
       */
      resetForm();
      onClose();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish post",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >
      <section
        className="create-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">
              CREATE
            </span>

            <h2 id="create-post-title">
              Share with your world
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={
              handleClose
            }
            disabled={
              publishing
            }
            aria-label="Close create post"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-author">
          <div className="avatar avatar-purple">
            SA
          </div>

          <div>
            <strong>
              Santhosh
            </strong>

            <span>
              @santhosh
            </span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(event) =>
            setContent(
              event.target.value,
            )
          }
          placeholder="What is on your mind?"
          maxLength={500}
          autoFocus
          disabled={publishing}
        />

        {imagePreviewUrl && (
          <div className="image-preview-wrapper">
            <Image
              src={
                imagePreviewUrl
              }
              alt="Selected image preview"
              className="image-preview"
              width={600}
              height={400}
              unoptimized
            />

            <button
              type="button"
              className="image-remove-button"
              onClick={
                handleRemoveImage
              }
              disabled={
                publishing
              }
              aria-label="Remove selected image"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {error && (
          <p
            role="alert"
            style={{
              color:
                "var(--aio-danger)",
              fontSize:
                "13px",
              margin:
                "8px 0 0",
            }}
          >
            {error}
          </p>
        )}

        <div className="modal-toolbar">
          <div className="modal-tools">
            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/*"
              hidden
              onChange={
                handleImageSelect
              }
              disabled={
                publishing
              }
            />

            <button
              type="button"
              aria-label="Add image"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={
                publishing
              }
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              aria-label="AI writing assistance"
              disabled={
                publishing
              }
            >
              <Sparkles size={18} />
            </button>
          </div>

          <span>
            {content.length}/500
          </span>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={
              handleClose
            }
            disabled={
              publishing
            }
          >
            Cancel
          </button>

          <button
            type="button"
            className="publish-button"
            onClick={
              handlePublish
            }
            disabled={
              publishing ||
              (!content.trim() &&
                !selectedImage)
            }
          >
            {publishing
              ? "Publishing..."
              : "Publish"}
          </button>
        </div>
      </section>
    </div>
  );
}
