import { useState, useEffect, useRef } from 'react';
import { seriesService } from '@/services/seriesService';
import { imageService } from '@/services/imageService';

interface UseLandingImagesResult {
  images: string[];
  loading: boolean;
  hasFallback: boolean;
}

export function useLandingImages(): UseLandingImagesResult {
  const [images, setImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const urlsRef = useRef<string[]>([]);

  useEffect(() => {
    let cancelled = false;

    seriesService
      .getAll()
      .then(async (series) => {
        if (cancelled) return;
        const urls: string[] = [];
        for (const s of series) {
          if (!s.coverImage) continue;
          const blob = await imageService.get(s.coverImage);
          if (blob && !cancelled) {
            urls.push(URL.createObjectURL(blob));
          }
        }
        if (!cancelled) {
          urlsRef.current = urls;
          setImages(urls);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      urlsRef.current = [];
    };
  }, []);

  return { images, loading, hasFallback: !loading && images.length === 0 };
}
