"use client";

import React, { useState } from "react";
import { footProfileSchema, useFootProfileStore, FootProfile } from "@/store/footProfileStore";

const footShapes = ["Egyptian", "Roman", "Greek", "Germanic", "Celtic"] as const;
const volumes = ["Low", "Medium", "High"] as const;

export default function FootProfilePage() {
  const { profile, setProfile } = useFootProfileStore();
  const [shape, setShape] = useState<string>("");
  const [volume, setVolume] = useState<string>("");
  const [error, setError] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = footProfileSchema.safeParse({ shape, volume });
    if (!result.success) {
      setError("Please select both a valid foot shape and volume.");
      return;
    }
    setError("");
    setProfile(result.data as FootProfile);
  };

  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">Foot Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block font-medium mb-1">Foot Shape</label>
          <select
            value={shape}
            onChange={e => setShape(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select shape</option>
            {footShapes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-medium mb-1">Foot Volume</label>
          <select
            value={volume}
            onChange={e => setVolume(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Select volume</option>
            {volumes.map(v => (
              <option key={v} value={v}>{v}</option>
            ))}
          </select>
        </div>
        {error && <div className="text-red-500 text-sm">{error}</div>}
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Save Profile
        </button>
      </form>

      {profile && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Saved Profile</h2>
          <p><strong>Shape:</strong> {profile.shape}</p>
          <p><strong>Volume:</strong> {profile.volume}</p>
        </div>
      )}
    </div>
  );
}
