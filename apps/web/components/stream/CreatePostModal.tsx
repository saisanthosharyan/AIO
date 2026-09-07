"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import Image from "next/image";

import {
  Image as ImageIcon,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";

import { uploadImage } from "@/lib/api";

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

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 500;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(
        new Error("Failed to read image."),
      );
    };

    reader.onerror = () => {
      reject(
        new Error("Failed to read image."),
      );
    };

    reader.readAsDataURL(file);
  });
}

export default function CreatePostModal({
  open,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");

  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const [imagePreviewUrl, setImagePreviewUrl] =
    useState<string | null>(null);

  const [publishing, setPublishing] =
    useState(false);

  const [error, setError] = useState("");

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  /*
   * Revoke the current image preview URL.
   */
  const revokePreviewUrl = useCallback(() => {
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
    }
  }, [imagePreviewUrl]);

  /*
   * Reset the composer state.
   */
  const resetForm = useCallback(() => {
    revokePreviewUrl();

    setContent("");
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [revokePreviewUrl]);

  /*
   * Close the modal.
   *
   * useCallback keeps the function reference
   * stable and prevents the Escape-key effect
   * from triggering an ESLint dependency warning.
   */
  const handleClose = useCallback(() => {
    if (publishing) {
      return;
    }

    resetForm();
    onClose();
  }, [onClose, publishing, resetForm]);

  /*
   * Clean up the object URL when the component
   * unmounts or the preview URL changes.
   */
  useEffect(() => {
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
      }
    };
  }, [imagePreviewUrl]);

  /*
   * Focus the textarea whenever the modal opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  /*
   * Allow Escape to close the modal.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (
        event.key === "Escape" &&
        !publishing
      ) {
        handleClose();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    open,
    publishing,
    handleClose,
  ]);

  /*
   * Handle image selection.
   */
  function handleImageSelect(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError("");

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file.",
      );

      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
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
    setImagePreviewUrl(previewUrl);
  }

  /*
   * Remove the currently selected image.
   */
  function handleRemoveImage() {
    revokePreviewUrl();

    setSelectedImage(null);
    setImagePreviewUrl(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  /*
   * Publish the post.
   */
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
        "Write something or add an image before publishing.",
      );

      return;
    }

    try {
      setPublishing(true);
      setError("");

      let imageUrl: string | undefined;

      /*
       * Upload the selected image first.
       */
      if (selectedImage) {
        const imageData =
          await fileToDataUrl(
            selectedImage,
          );

        const uploadResponse =
          await uploadImage(imageData);

        if (
          !uploadResponse.success ||
          !uploadResponse.imageUrl
        ) {
          throw new Error(
            uploadResponse.message ||
              "Image upload failed.",
          );
        }

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
       * Send the post data to the parent.
       */
      await onPublish({
        content: trimmedContent,
        imageUrl,
      });

      resetForm();
      onClose();
    } catch (publishError) {
      setError(
        publishError instanceof Error
          ? publishError.message
          : "Failed to publish post.",
      );
    } finally {
      setPublishing(false);
    }
  }

  if (!open) {
    return null;
  }

  const canPublish =
    Boolean(
      content.trim() ||
        selectedImage,
    ) && !publishing;

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
        {/* Header */}
        <header className="modal-header">
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
            onClick={handleClose}
            disabled={publishing}
            aria-label="Close create post"
          >
            <X size={20} />
          </button>
        </header>

        {/* Author */}
        <div className="modal-author">
          <div
            className="avatar avatar-purple"
            aria-hidden="true"
          >
            AI
          </div>

          <div>
            <strong>Your post</strong>

            <span>
              Visible to the AIO community
            </span>
          </div>
        </div>

        {/* Composer */}
        <div className="composer-body">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) =>
              setContent(
                event.target.value.slice(
                  0,
                  MAX_CONTENT_LENGTH,
                ),
              )
            }
            placeholder="What is on your mind?"
            maxLength={MAX_CONTENT_LENGTH}
            disabled={publishing}
            aria-label="Post content"
          />

          {imagePreviewUrl && (
            <div className="image-preview-wrapper">
              <Image
                src={imagePreviewUrl}
                alt="Selected image preview"
                className="image-preview"
                width={900}
                height={600}
                sizes="(max-width: 760px) 100vw, 560px"
                unoptimized
              />

              <button
                type="button"
                className="image-remove-button"
                onClick={
                  handleRemoveImage
                }
                disabled={publishing}
                aria-label="Remove selected image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div
            className="aio-error composer-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Toolbar */}
        <div className="modal-toolbar">
          <div className="modal-tools">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={
                handleImageSelect
              }
              disabled={publishing}
            />

            <button
              type="button"
              onClick={() =>
                fileInputRef.current?.click()
              }
              disabled={publishing}
              aria-label="Add image"
              title="Add image"
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              disabled={publishing}
              aria-label="AI writing assistance"
              title="AI writing assistance"
            >
              <Sparkles size={18} />
            </button>
          </div>

          <span>
            {content.length}/
            {MAX_CONTENT_LENGTH}
          </span>
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={handleClose}
            disabled={publishing}
          >
            Cancel
          </button>

          <button
            type="button"
            className="publish-button"
            onClick={() =>
              void handlePublish()
            }
            disabled={!canPublish}
          >
            {publishing ? (
              <>
                <Loader2
                  size={17}
                  className="aio-spin"
                />

                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </button>
        </footer>
      </section>
    </div>
  );
}