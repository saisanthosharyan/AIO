"use client";

import { useState } from "react";
import CreatePanel from "@/components/stream/CreatePanel";
import CreatePostModal, {
  CreatePostData,
} from "@/components/stream/CreatePostModal";
import PostCard from "@/components/stream/PostCard";

interface StreamPost {
  postId: string;
  name: string;
  username: string;
  time: string;
  initials: string;
  avatarClass: string;
  content: string;
  imageUrl?: string;
  type?: "thought" | "space";
}

const initialPosts: StreamPost[] = [
  {
    postId: "6a8be51095a9e0537dc2f6f7",
    name: "Alex Morgan",
    username: "@alexm",
    time: "2h",
    initials: "A",
    avatarClass: "avatar-blue",
    content:
      "Building something new today. The future of social platforms should feel more connected, not more complicated.",
    type: "thought",
  },
  {
    postId: "6a8be51095a9e0537dc2f6f8",
    name: "Sarah Kim",
    username: "@sarahk",
    time: "4h",
    initials: "S",
    avatarClass: "avatar-pink",
    content:
      "Just discovered an amazing new idea around AI, creativity and communities. What are you all working on?",
  },
];

export default function StreamPage() {
  const [posts, setPosts] =
    useState<StreamPost[]>(initialPosts);

  const [createOpen, setCreateOpen] =
    useState(false);

  function handlePublish(post: CreatePostData) {
    const newPost: StreamPost = {
      postId: `local-${Date.now()}`,
      name: "Santhosh",
      username: "@santhosh",
      time: "now",
      initials: "SA",
      avatarClass: "avatar-purple",
      content: post.content,
      imageUrl: post.imageUrl,
      type: "thought",
    };

    setPosts((currentPosts) => [
      newPost,
      ...currentPosts,
    ]);
  }

  return (
    <>
      <div className="aio-page-header">
        <div>
          <h1>Stream</h1>

          <p>
            What&apos;s happening in your world?
          </p>
        </div>
      </div>

      <section className="aio-feed">
        <CreatePanel
          onOpenCreate={() =>
            setCreateOpen(true)
          }
        />

        {posts.map((post) => (
          <PostCard
            key={post.postId}
            postId={post.postId}
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
      </section>

      <CreatePostModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onPublish={handlePublish}
      />
    </>
  );
}

