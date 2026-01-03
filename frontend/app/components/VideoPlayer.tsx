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
      </div>
    )
  }
);

interface VideoPlayerProps extends ComponentProps<typeof ReactPlayer> {
  url: string;
}

export default function VideoPlayer(props: VideoPlayerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center h-full bg-black">
        <div className="w-12 h-12 border-4 border-gray-600 border-t-white rounded-full animate-spin"></div>
      </div>
    );
  }

  return <ReactPlayer {...props} />;
}

