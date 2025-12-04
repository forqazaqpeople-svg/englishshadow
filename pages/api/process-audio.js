import formidable from "formidable";
import fs from "fs";
import { OpenAI } from "openai";

export const config = {
  api: { bodyParser: false }
};

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      const originalText = fields.originalText;
      const filePath = files.file.filepath;
      const stream = fs.createReadStream(filePath);

      const transcription = await openai.audio.transcriptions.create({
        file: stream,
        model: "whisper-1"
      });

      const transcript = transcription.text;

      const score = calculateScore(originalText, transcript);

      return res.json({
        status: "done",
        transcript,
        score
      });

    } catch (e) {
      console.log(e);
      return res.status(500).json({ error: "server error" });
    }
  });
}

function calculateScore(ref, hyp) {
  const r = ref.toLowerCase().split(" ");
  const h = hyp.toLowerCase().split(" ");
  let errors = 0;

  r.forEach((word, i) => {
    if (h[i] !== word) errors++;
  });

  const wer = errors / r.length;
  return Math.max(0, Math.round(100 * (1 - wer)));
}
