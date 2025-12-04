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

    const res = await fetch("/api/process-audio", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setResult(data);
  };

  return (
    <div>
      <div className="aspect-video mb-4">
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          className="w-full h-full"
        />
      </div>

      <p className="bg-gray-50 p-3 rounded mb-4">{originalText}</p>

      {!recording ? (
        <button onClick={startRecording} className="px-4 py-2 bg-green-600 text-white rounded">
          Жазуды бастау
        </button>
      ) : (
        <button onClick={stopRecording} className="px-4 py-2 bg-red-600 text-white rounded">
          Аяқтау
        </button>
      )}

      {audioURL && (
        <div className="mt-4">
          <audio controls src={audioURL}></audio>
        </div>
      )}

      {result && (
        <div className="mt-4 bg-white p-4 rounded shadow">
          <h3 className="font-bold mb-2">Нәтиже</h3>
          <p>Transcript: {result.transcript}</p>
          <p>Score: {result.score}/100</p>
        </div>
      )}
    </div>
  );
}
