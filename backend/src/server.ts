import "dotenv/config";

import cors from "cors";
import express from "express";

import { connectDatabase } from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import bookmarkRoutes from "./routes/bookmark.routes.js";

const app = express();

const PORT = Number(process.env.PORT ?? 5000);
const CLIENT_URL =
  process.env.CLIENT_URL ?? "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (_request, response) => {
  response.json({
    success: true,
    message: "AIO API is running",
  });
});

app.get("/health", (_request, response) => {
  response.json({
    success: true,
    service: "aio-backend",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/posts/:id/comments", commentRoutes);
app.use("/api/bookmarks", bookmarkRoutes);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(PORT, () => {
      console.log(
        `AIO backend running on http://localhost:${PORT}`,
      );
    });
  } catch (error) {
    console.error("Failed to start AIO backend");
    console.error(error);
    process.exit(1);
  }
}

startServer();