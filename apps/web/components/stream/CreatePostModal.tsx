"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";

export interface CreatePostData {
  content: string;
  imageUrl?: string;
}

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (post: CreatePostData) => void;
}

export default function CreatePostModal({
  open,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] =
    useState<File | null>(null);

  const fileInputRef =
    useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  function resetForm() {
    setContent("");
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function handlePublish() {
    const trimmedContent = content.trim();

    if (!trimmedContent && !selectedImage) {
      return;
    }

    /*
     * For now, create a temporary browser URL for the
     * selected image. Later this will be replaced by
     * actual backend/cloud storage upload logic.
     */
    const imageUrl = selectedImage
      ? URL.createObjectURL(selectedImage)
      : undefined;

    onPublish({
      content: trimmedContent,
      imageUrl,
    });

    resetForm();
    onClose();
  }

  function handleImageSelect(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    setSelectedImage(file);
  }

  function handleRemoveImage() {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  const imagePreviewUrl = selectedImage
    ? URL.createObjectURL(selectedImage)
    : null;

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
        className="create-post-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-post-title"
      >
        <div className="modal-header">
          <div>
            <span className="eyebrow">CREATE</span>

            <h2 id="create-post-title">
              Share with your world
            </h2>
          </div>

          <button
            type="button"
            className="modal-close"
            onClick={handleClose}
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
            <strong>Santhosh</strong>
            <span>@santhosh</span>
          </div>
        </div>

        <textarea
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          placeholder="What is on your mind?"
          maxLength={500}
          autoFocus
        />

        {imagePreviewUrl && (
          <div className="image-preview-wrapper">
            <Image
              src={imagePreviewUrl}
              alt="Selected image preview"
              className="image-preview"
              width={600}
              height={400}
              unoptimized
            />

            <button
              type="button"
              className="image-remove-button"
              onClick={handleRemoveImage}
              aria-label="Remove selected image"
            >
              <X size={16} />
            </button>
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
            />

            <button
              type="button"
              aria-label="Add image"
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <ImageIcon size={18} />
            </button>

            <button
              type="button"
              aria-label="AI writing assistance"
            >
              <Sparkles size={18} />
            </button>
          </div>

          <span>{content.length}/500</span>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="cancel-button"
            onClick={handleClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="publish-button"
            onClick={handlePublish}
            disabled={
              !content.trim() && !selectedImage
            }
          >
            Publish
          </button>
        </div>
      </section>
    </div>
  );
}