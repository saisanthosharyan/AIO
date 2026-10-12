
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";

import Image from "next/image";

import {
  Image as ImageIcon,
  Loader2,
  Sparkles,
  UserRound,
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
  onPublish: (post: CreatePostData) => Promise<void>;
}

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_CONTENT_LENGTH = 500;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image."));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image."));
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
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const previewUrlRef = useRef<string | null>(null);
  const publishingRef = useRef(false);

  function clearPreview() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setImagePreviewUrl(null);
  }

  function resetForm() {
    clearPreview();
    setContent("");
    setSelectedImage(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    if (publishingRef.current) return;

    resetForm();
    onClose();
  }

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!open) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      textareaRef.current?.focus();
    }, 0);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      previousFocusRef.current?.focus();
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && !publishingRef.current) {
        event.preventDefault();
        handleClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  });

  function handleModalKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "Tab") return;

    const modal = modalRef.current;
    if (!modal) return;

    const focusable = Array.from(
      modal.querySelectorAll<HTMLElement>(
        'button:not([disabled]), textarea:not([disabled]), input:not([disabled]):not([type="hidden"]), a[href]',
      ),
    ).filter((element) => element.getClientRects().length > 0);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image must be smaller than 5MB.");
      event.target.value = "";
      return;
    }

    clearPreview();

    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;

    setSelectedImage(file);
    setImagePreviewUrl(previewUrl);
  }

  function handleRemoveImage() {
    clearPreview();
    setSelectedImage(null);
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handlePublish() {
    if (publishingRef.current) return;

    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedImage) {
      setError("Write something or add an image before publishing.");
      return;
    }

    publishingRef.current = true;
    setPublishing(true);
    setError("");

    try {
      let imageUrl: string | undefined;

      if (selectedImage) {
        const imageData = await fileToDataUrl(selectedImage);
        const uploadResponse = await uploadImage(imageData);

        if (!uploadResponse.success || !uploadResponse.imageUrl) {
          throw new Error(
            uploadResponse.message || "Image upload failed.",
          );
        }

        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

        imageUrl = uploadResponse.imageUrl.startsWith("http")
          ? uploadResponse.imageUrl
          : `${apiUrl.replace(/\/$/, "")}/${uploadResponse.imageUrl.replace(/^\//, "")}`;
      }

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
      publishingRef.current = false;
      setPublishing(false);
    }
  }

  if (!open) return null;

  const canPublish =
    Boolean(content.trim() || selectedImage) && !publishing;

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          handleClose();
        }
      }}
    >
      <section
        ref={modalRef}
        className="create-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
        aria-describedby="create-post-description"
        onKeyDown={handleModalKeyDown}
      >
        <header className="modal-header">
          <div>
            <span className="eyebrow">CREATE</span>
            <h2 id="create-post-title">Share with your world</h2>
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

        <div className="modal-author">
          <div className="avatar avatar-purple" aria-hidden="true">
            <UserRound size={19} />
          </div>

          <div>
            <strong>Your post</strong>
            <span id="create-post-description">
              Visible to the AIO community
            </span>
          </div>
        </div>

        <div className="composer-body">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(event) =>
              setContent(event.target.value.slice(0, MAX_CONTENT_LENGTH))
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
                onClick={handleRemoveImage}
                disabled={publishing}
                aria-label="Remove selected image"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>

        {error && (
          <div className="aio-error composer-error" role="alert">
            {error}
          </div>
        )}

        <div className="modal-toolbar">
          <div className="modal-tools">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageSelect}
              disabled={publishing}
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={publishing}
              aria-label="Add image"
              title="Add image"
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              disabled
              aria-label="AI writing assistance coming soon"
              title="AI writing assistance coming soon"
            >
              <Sparkles size={18} />
            </button>
          </div>

          <span>
            {content.length}/{MAX_CONTENT_LENGTH}
          </span>
        </div>

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
            onClick={() => void handlePublish()}
            disabled={!canPublish}
          >
            {publishing ? (
              <>
                <Loader2 size={17} className="aio-spin" />
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
