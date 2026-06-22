import { useState } from 'react';
import { seriesService } from '@/services/seriesService';
import { imageService } from '@/services/imageService';
import { Button } from '@/components/ui';
import styles from './ExportPage.module.scss';

interface ExportSeries {
  id: string;
  title: string;
  synopsis: string;
  seasons: string;
  year: number;
  rating: number;
  opinion: string | undefined;
  genres: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  coverImageBase64: string | null;
  coverMime: string | null;
}

type Status = 'idle' | 'loading' | 'done' | 'error';

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function parseDataUrl(dataUrl: string): { base64: string; mime: string } | null {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) return null;
  return { mime: match[1], base64: match[2] };
}

export function ExportPage() {
  const [status, setStatus] = useState<Status>('idle');
  const [progress, setProgress] = useState('');

  async function handleExport() {
    setStatus('loading');
    setProgress('Leyendo series…');
    try {
      const allSeries = await seriesService.getAll();
      const exportSeries: ExportSeries[] = [];

      for (let i = 0; i < allSeries.length; i++) {
        const s = allSeries[i];
        setProgress(`Procesando ${i + 1} / ${allSeries.length}: ${s.title}`);

        let coverImageBase64: string | null = null;
        let coverMime: string | null = null;

        if (s.coverImage) {
          const blob = await imageService.get(s.coverImage);
          if (blob) {
            const dataUrl = await blobToDataUrl(blob);
            const parsed = parseDataUrl(dataUrl);
            if (parsed) {
              coverImageBase64 = parsed.base64;
              coverMime = parsed.mime;
            }
          }
        }

        exportSeries.push({
          id: s.id,
          title: s.title,
          synopsis: s.synopsis,
          seasons: s.seasons,
          year: s.year,
          rating: s.rating,
          opinion: s.opinion,
          genres: s.genres,
          createdBy: s.createdBy,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          coverImageBase64,
          coverMime,
        });
      }

      const json = JSON.stringify({ series: exportSeries }, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tvshows-export.json';
      a.click();
      URL.revokeObjectURL(url);

      setProgress(`Exportadas ${exportSeries.length} series.`);
      setStatus('done');
    } catch (err) {
      setProgress(err instanceof Error ? err.message : 'Error desconocido');
      setStatus('error');
    }
  }

  return (
    <div className={styles.page}>
      <h1>Exportar datos (DEV)</h1>
      <p>Descarga un JSON con todas las series y sus portadas en base64 para migrarlas a Supabase.</p>
      <Button onClick={handleExport} disabled={status === 'loading'}>
        {status === 'loading' ? 'Exportando…' : 'Exportar datos'}
      </Button>
      {progress && (
        <p className={status === 'error' ? styles.error : styles.info}>{progress}</p>
      )}
    </div>
  );
}
