import React from "react";
import ShadowingPlayer from "../components/ShadowingPlayer";

export default function Home() {
  const youtubeId = "dQw4w9WgXcQ";
  const originalText = `This is the original text for shadowing. Replace it with your own script.`;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Бүгінгі Shadowing Тапсырмасы</h1>
        <ShadowingPlayer youtubeId={youtubeId} originalText={originalText} />
      </div>
    </div>
  );
}
