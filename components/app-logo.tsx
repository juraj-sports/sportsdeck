"use client";

import { useState, useRef, useEffect } from "react";
import { Star } from "lucide-react";

type AppLogoProps = {
  src?: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
  /** App's website URL — used to derive a favicon fallback if `src` fails. */
  appUrl?: string;
};

function faviconFor(appUrl?: string): string | null {
  if (!appUrl) return null;
  try {
    const { hostname } = new URL(appUrl);
    if (!hostname) return null;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(hostname)}&sz=128`;
  } catch {
    return null;
  }
}

export function AppLogo({ src, alt, className, fallback, appUrl }: AppLogoProps) {
  // Stage: 0 = primary src, 1 = favicon derived from appUrl, 2 = fallback node
  const [stage, setStage] = useState<0 | 1 | 2>(src ? 0 : (faviconFor(appUrl) ? 1 : 2));
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setStage(src ? 0 : (faviconFor(appUrl) ? 1 : 2));
  }, [src, appUrl]);

  // Catch the case where the image errored before React attached the onError
  // handler (e.g., 404/SSL failure on a cached request): after mount, if the
  // img is already complete with zero naturalWidth, it already errored.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      advance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  const advance = () => {
    setStage((s) => {
      if (s === 0) return faviconFor(appUrl) ? 1 : 2;
      return 2;
    });
  };

  if (stage === 2) {
    return <>{fallback ?? <Star className="w-4 h-4 text-gray-400" />}</>;
  }

  const currentSrc = stage === 0 ? src! : faviconFor(appUrl)!;

  return (
    <img
      ref={imgRef}
      src={currentSrc}
      alt={alt}
      className={className}
      onError={advance}
    />
  );
}
