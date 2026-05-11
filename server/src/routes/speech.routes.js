// ==============================================
// SARA — Speech-to-Text Route
// POST /api/speech — converts audio to text via Gemini
// ==============================================

import { Router } from "express";
import { roleGuard } from "../middleware/index.js";

const router = Router();

router.post("/", roleGuard("student", "faculty"), async (req, res) => {
  try {
    const audioBuffer = req.body;

    console.log("[SPEECH] Body type:", typeof audioBuffer, "isBuffer:", Buffer.isBuffer(audioBuffer), "length:", audioBuffer?.length);

    if (!audioBuffer || !audioBuffer.length) {
      return res.status(400).json({ error: "No audio data received" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    // Use a lighter model for speech to avoid hitting quota on the main model
    const model = "gemini-2.0-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const base64Audio = audioBuffer.toString("base64");
    console.log("[SPEECH] Audio size:", audioBuffer.length, "bytes, base64 length:", base64Audio.length);

    const body = {
      contents: [{
        parts: [
          { text: "Transcribe this audio exactly as spoken. Return ONLY the transcribed text, nothing else. If Arabic, keep it in Arabic. If English, keep it in English." },
          { inlineData: { mimeType: "audio/webm", data: base64Audio } },
        ],
      }],
    };

    // Try up to 2 times with a short wait on rate limit
    let data;
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      data = await response.json();
      if (data?.error?.code === 429 && attempt === 0) {
        console.log("[SPEECH] Rate limited, retrying in 8s...");
        await new Promise((r) => setTimeout(r, 8000));
        continue;
      }
      break;
    }

    console.log("[SPEECH] Gemini response:", JSON.stringify(data).slice(0, 300));
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      if (data?.error?.code === 429) {
        return res.status(429).json({ error: "AI is busy, please try again in a few seconds." });
      }
      return res.status(400).json({ error: "Could not transcribe audio", detail: data?.error?.message || data?.candidates?.[0]?.finishReason });
    }

    res.json({ text });
  } catch (err) {
    console.error("[SPEECH] Error:", err.message);
    res.status(500).json({ error: "Speech transcription failed" });
  }
});

export default router;
