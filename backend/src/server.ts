import "dotenv/config";

import cors from "cors";
import express from "express";

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

async function startServer(): Promise<void> {
  app.listen(PORT, () => {
    console.log(
      `AIO backend running on http://localhost:${PORT}`,
    );
  });
}

startServer().catch((error) => {
  console.error("❌ Failed to start AIO backend");
  console.error(error);
  process.exit(1);
});