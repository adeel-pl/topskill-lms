'use client';

import dynamic from 'next/dynamic';
import { ComponentProps, useState, useEffect } from 'react';

// Dynamically import ReactPlayer with SSR disabled to fix chunk loading issues
const ReactPlayer = dynamic(
  () => import('react-player').then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <span className="ml-4 text-white">Loading video player...</span>
      </div>
    )
  }
);

interface VideoPlayerProps extends ComponentProps<typeof ReactPlayer> {
  url: string;
}

export default function VideoPlayer(props: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
        <span className="ml-4 text-white">Loading video player...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="text-center text-white">
          <p className="text-lg mb-2">Video unavailable</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500 mt-2">URL: {props.url}</p>
        </div>
      </div>
    );
  }

  return (
    <ReactPlayer
      {...props}
      onError={(err: any) => {
        console.error('ReactPlayer error:', err);
        setError(err?.message || 'Failed to load video');
      }}
      onReady={() => {
        setError(null);
      }}
    />
  );
}

