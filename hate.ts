import express from "express";
import { driveService, initDriveService } from "./drivers/services";

const app = express();
const PORT = 3000;

initDriveService();

app.get("/stream/:id", async (req, res) => {
  try {
    const fileId = req.params.id;
    const stream = await driveService.createStream(fileId);

    if (!stream) {
      return res.status(404).send("File not found");
    }

    // Set headers so browser understands it’s media
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Accept-Ranges", "bytes");

    // 🧠 Stream directly to client
    stream.pipe(res);
  } catch (err) {
    console.error("❌ Error streaming:", err);
    res.status(500).send("Failed to stream file");
  }
});

app.listen(PORT, () =>
  console.log(`🚀 Stream server running at http://localhost:${PORT}`)
);
