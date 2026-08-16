"use client";

import { useState } from "react";
import CreatePanel from "../../components/stream/CreatePanel";
import CreatePostModal, {
  CreatePostData,
} from "../../components/stream/CreatePostModal";
import PostCard from "../../components/stream/PostCard";

interface StreamPost {
  id: string;
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  imageUrl?: string;
  type: "thought" | "space";
}

const initialPosts: StreamPost[] = [
  {
    id: "1",
    name: "Santhosh",
    username: "@santhosh",
    time: "2m",
    initials: "SA",
    avatarClass: "avatar-purple",
    content:
      "Building AIO step by step. The goal is to create one social platform where conversations, communities, short-form content, and AI actually work together.",
    type: "thought",
  },
  {
    id: "2",
    name: "Aarav",
    username: "@aarav",
    time: "18m",
    initials: "AR",
    avatarClass: "avatar-green",
    content:
      "AI products become much more interesting when AI is part of the experience instead of being just another chatbot.",
    type: "space",
  },
  {
    id: "3",
    name: "Meera",
    username: "@meera",
    time: "42m",
    initials: "MR",
    avatarClass: "avatar-orange",
    content:
      "What are you building today? Share an idea, a project, or something you discovered.",
    type: "thought",
  },
];

export default function StreamPage() {
  const [posts, setPosts] =
    useState<StreamPost[]>(initialPosts);

  const [createModalOpen, setCreateModalOpen] =
    useState(false);

  function handleOpenCreate() {
    setCreateModalOpen(true);
  }

  function handleCloseCreate() {
    setCreateModalOpen(false);
  }

  function handlePostCreated(
    postData: CreatePostData,
  ) {
    const newPost: StreamPost = {
      id: crypto.randomUUID(),
      name: "Santhosh",
      username: "@santhosh",
      time: "now",
      initials: "SA",
      avatarClass: "avatar-purple",
      content: postData.content,
      imageUrl: postData.imageUrl,
      type: "thought",
    };

    setPosts((currentPosts) => [
      newPost,
      ...currentPosts,
    ]);

    setCreateModalOpen(false);
  }

  return (
    <section className="stream-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            YOUR WORLD
          </span>

          <h1>Stream</h1>

          <p>
            Ideas, conversations, people and
            moments that matter to you.
          </p>
        </div>
      </div>

      <CreatePanel
        onOpenCreate={handleOpenCreate}
      />

      <div className="stream-label">
        <span>
          LATEST FROM YOUR NETWORK
        </span>

        <div />
      </div>

      <div>
        {posts.map((post) => (
          <PostCard
            key={post.id}
            name={post.name}
            username={post.username}
            time={post.time}
            initials={post.initials}
            avatarClass={post.avatarClass}
            content={post.content}
            imageUrl={post.imageUrl}
            type={post.type}
          />
        ))}
      </div>

      <CreatePostModal
        open={createModalOpen}
        onClose={handleCloseCreate}
        onPublish={handlePostCreated}
      />
    </section>
  );
}