"use client";

import { useParams } from 'next/navigation';

export default function GameDetailsPage() {
  const params = useParams();
  const gameId = params.id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex flex-col items-center justify-center py-10">
          <h1 className="text-3xl font-bold mb-4">Game Details</h1>
          <div className="p-6 bg-white rounded-lg shadow-md w-full text-center">
            <p className="text-2xl font-semibold text-gray-600 mb-2">Coming Soon</p>
            <p className="text-gray-500 mb-4">
              Detailed game view will be available in a future update.
            </p>
            <p className="text-sm text-gray-400">Game ID: {gameId}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 