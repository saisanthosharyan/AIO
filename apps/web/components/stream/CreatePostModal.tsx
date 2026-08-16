"use client";

import { useRef, useState } from "react";
import {
  Image as ImageIcon,
  Sparkles,
  X,
} from "lucide-react";

interface CreatePostModalProps {
  open: boolean;
  onClose: () => void;
  onPublish: (content: string) => void;
}

export default function CreatePostModal({
  open,
  onClose,
  onPublish,
}: CreatePostModalProps) {
  const [content, setContent] = useState("");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) {
    return null;
  }

  const handlePublish = () => {
    const trimmedContent = content.trim();

    if (!trimmedContent) {
      return;
    }

    onPublish(trimmedContent);

    setContent("");
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    onClose();
  };

  const handleImageSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      return;
    }

    setSelectedImage(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div
      className="modal-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
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
            onClick={onClose}
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
          onChange={(event) => setContent(event.target.value)}
          placeholder="What is on your mind?"
          maxLength={500}
          autoFocus
        />

        {selectedImage && (
          <div className="selected-file">
            <ImageIcon size={16} />

            <span>{selectedImage.name}</span>

            <button
              type="button"
              onClick={handleRemoveImage}
              aria-label="Remove selected image"
            >
              <X size={15} />
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
              onClick={() => fileInputRef.current?.click()}
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
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            type="button"
            className="publish-button"
            onClick={handlePublish}
            disabled={!content.trim()}
          >
            Publish
          </button>
        </div>
      </section>
    </div>
  );
}