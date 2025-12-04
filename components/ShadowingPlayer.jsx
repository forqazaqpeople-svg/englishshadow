import React, { useState, useRef } from "react";

export default function ShadowingPlayer({ youtubeId, originalText }) {
  const [recording, setRecording] = useState(false);
  const [audioURL, setAudioURL] = useState(null);
  const [result, setResult] = useState(null);
  const recorder = useRef(null);
  const chunks = useRef([]);

  const startRecording = async () => {
    setResult(null);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRec = new MediaRecorder(stream);

    mediaRec.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.current.push(e.data);
    };

    mediaRec.onstop = () => {
      const blob = new Blob(chunks.current, { type: "audio/webm" });
      setAudioURL(URL.createObjectURL(blob));
    };

    recorder.current = mediaRec;
    chunks.current = [];
    mediaRec.start();
    setRecording(true);
  };

  const stopRecording = async () => {
    recorder.current.stop();
    setRecording(false);

    await new Promise((r) => setTimeout(r, 800));

    const blob = new Blob(chunks.current, { type: "audio/webm" });
    const formData = new FormData();

    formData.append("file", blob, "speech.webm");
    formData.append("originalText", originalText);

    setResult({ status: "loading" });

    const res = await fetch("/api/process-audio", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div className="space-y-6">

      {/* VIDEO BLOCK */}
      <div className="relative w-full overflow-hidden rounded-xl shadow-md border border-gray-200">
        <div className="aspect-video">
          <iframe
            src={`https://www.youtube.com/embed/${youtubeId}`}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media;"
          />
        </div>
      </div>

      {/* TEXT BLOCK */}
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 shadow">
        {originalText}
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3">
        {!recording ? (
          <button
            onClick={startRecording}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold shadow"
          >
            🎙 Жазуды бастау
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold shadow"
          >
            ⏹ Аяқтау
          </button>
        )}
      </div>

      {/* AUDIO PREVIEW */}
      {audioURL && (
        <div className="p-4 bg-white rounded-xl shadow-md border border-gray-200">
          <h3 className="font-semibold mb-2">🎧 Сенің жазбаң:</h3>
          <audio controls src={audioURL} className="w-full" />
        </div>
      )}

      {/* RESULT BLOCK */}
      {result && result.status === "loading" && (
        <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-700 rounded-lg shadow">
          Талдап жатырмыз... 5–10 секунд күте тұр ✨
        </div>
      )}

      {result && result.status === "done" && (
        <div className="p-5 bg-white border border-gray-200 rounded-xl shadow space-y-4">
          <h3 className="text-xl font-bold">📊 Нәтиже</h3>

          <div>
            <p className="font-semibold">AI Transcript:</p>
            <p className="p-2 bg-gray-50 rounded border">{result.transcript}</p>
          </div>

          <div className="text-lg">
            ⭐ <strong>Баллың:</strong> {result.score}/100
          </div>
        </div>
      )}
    </div>
  );
}
