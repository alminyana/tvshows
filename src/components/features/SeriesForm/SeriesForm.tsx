import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seriesSchema } from '@/utils/seriesSchema';
import type { SeriesFormValues } from '@/utils/seriesSchema';
import { getAllGenres, addCustomGenre } from '@/utils/genresCatalog';
import { imageService } from '@/services';
import { Button, FormField, Input, Textarea, Select, Rating, Tag } from '@/components/ui';
import { MESSAGES } from '@/constants';
import styles from './SeriesForm.module.scss';

interface SeriesFormProps {
  initialValues?: Partial<SeriesFormValues>;
  existingImageId?: string;
  onSubmit: (data: SeriesFormValues, file?: File) => Promise<void>;
  isSubmitting?: boolean;
}

export function SeriesForm({ initialValues, existingImageId, onSubmit, isSubmitting }: SeriesFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<SeriesFormValues>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: '',
      synopsis: '',
      cast: [],
      opinion: '',
      genres: [],
      rating: 0,
      ...initialValues,
    },
  });

  const [imageFile, setImageFile] = useState<File | undefined>();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);
  const [castInput, setCastInput] = useState('');
  const [genreCatalog, setGenreCatalog] = useState<string[]>(() => getAllGenres());
  const [genreInput, setGenreInput] = useState('');
  const filePreviewUrlRef = useRef<string | null>(null);

  const genreOptions = genreCatalog.map((g) => ({ value: g, label: g }));

  useEffect(() => {
    if (!existingImageId) return;
    let url: string | null = null;
    imageService.get(existingImageId).then((blob) => {
      if (blob) {
        url = URL.createObjectURL(blob);
        setImagePreview(url);
      }
    });
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [existingImageId]);

  useEffect(() => {
    return () => {
      if (filePreviewUrlRef.current) URL.revokeObjectURL(filePreviewUrlRef.current);
    };
  }, []);

  function processImageFile(file: File) {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setImageError(MESSAGES.errors.imageType);
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setImageError(MESSAGES.errors.imageSize);
      return;
    }
    setImageError(null);
    if (filePreviewUrlRef.current) URL.revokeObjectURL(filePreviewUrlRef.current);
    const url = URL.createObjectURL(file);
    filePreviewUrlRef.current = url;
    setImageFile(file);
    setImagePreview(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  }

  function handlePaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'));
    const file = item?.getAsFile();
    if (!file) {
      setImageError(MESSAGES.errors.clipboardNoImage);
      return;
    }
    e.preventDefault();
    processImageFile(file);
  }

  function addCastMember(value: string, currentCast: string[], onChange: (v: string[]) => void) {
    const trimmed = value.trim();
    if (trimmed && !currentCast.includes(trimmed)) {
      onChange([...currentCast, trimmed]);
      setCastInput('');
    }
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data, imageFile))} className={styles.form} noValidate>
      <FormField
        label={MESSAGES.series.cover}
        error={imageError ?? undefined}
      >
        <div className={styles.imageField}>
          {imagePreview ? (
            <img src={imagePreview} alt="Previsualización de portada" className={styles.imagePreview} />
          ) : (
            <div className={styles.imagePlaceholder} aria-hidden="true" />
          )}
          <div className={styles.imageControls}>
            <div
              className={styles.pasteZone}
              tabIndex={0}
              role="button"
              aria-label={MESSAGES.series.coverPaste}
              onPaste={handlePaste}
            >
              {MESSAGES.series.coverPaste}
            </div>
            <p className={styles.pasteHint}>{MESSAGES.series.coverPasteHint}</p>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileChange}
              className={styles.fileInput}
              aria-label={MESSAGES.series.cover}
            />
          </div>
        </div>
      </FormField>

      <FormField label={MESSAGES.series.title} htmlFor="title" error={errors.title?.message} required>
        <Input id="title" {...register('title')} hasError={!!errors.title} />
      </FormField>

      <FormField label={MESSAGES.series.synopsis} htmlFor="synopsis" error={errors.synopsis?.message}>
        <Textarea id="synopsis" rows={4} {...register('synopsis')} hasError={!!errors.synopsis} />
      </FormField>

      <FormField label={MESSAGES.series.year} htmlFor="year" error={errors.year?.message}>
        <Input id="year" type="number" {...register('year')} hasError={!!errors.year} />
      </FormField>

      <FormField label={MESSAGES.series.seasons} htmlFor="seasons" error={errors.seasons?.message}>
        <Textarea id="seasons" rows={3} {...register('seasons')} hasError={!!errors.seasons} />
      </FormField>

      <FormField label={MESSAGES.series.rating} error={errors.rating?.message}>
        <Controller
          name="rating"
          control={control}
          render={({ field }) => (
            <Rating value={field.value} onChange={field.onChange} label={MESSAGES.series.rating} />
          )}
        />
      </FormField>

      <FormField label={MESSAGES.series.genres} htmlFor="genres" error={errors.genres?.message}>
        <Controller
          name="genres"
          control={control}
          render={({ field }) => {
            const selected = (field.value ?? []) as string[];
            const addGenre = () => {
              const canonical = addCustomGenre(genreInput);
              if (!canonical) return;
              setGenreCatalog(getAllGenres());
              if (!selected.some((g) => g.toLowerCase() === canonical.toLowerCase())) {
                field.onChange([...selected, canonical]);
              }
              setGenreInput('');
            };
            return (
              <div className={styles.chips}>
                <Select
                  id="genres"
                  multiple
                  options={genreOptions}
                  value={selected}
                  onChange={(vals) => field.onChange(vals)}
                  hasError={!!errors.genres}
                />
                <div className={styles.chipInput}>
                  <Input
                    value={genreInput}
                    onChange={(e) => setGenreInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addGenre();
                      }
                    }}
                    placeholder="Nuevo género y Enter para añadir"
                    aria-label="Añadir nuevo género"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label="Añadir género"
                    onClick={addGenre}
                  >
                    {MESSAGES.actions.add}
                  </Button>
                </div>
              </div>
            );
          }}
        />
      </FormField>

      <FormField label={MESSAGES.series.cast} error={errors.cast?.message}>
        <Controller
          name="cast"
          control={control}
          render={({ field }) => {
            const cast = field.value ?? [];
            return (
              <div className={styles.chips}>
                {cast.length > 0 && (
                  <div className={styles.chipRow}>
                    {cast.map((name) => (
                      <Tag
                        key={name}
                        label={name}
                        onRemove={() => field.onChange(cast.filter((n) => n !== name))}
                      />
                    ))}
                  </div>
                )}
                <div className={styles.chipInput}>
                  <Input
                    value={castInput}
                    onChange={(e) => setCastInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCastMember(castInput, cast, field.onChange);
                      }
                    }}
                    placeholder="Nombre y Enter para añadir"
                    aria-label="Añadir miembro del reparto"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    aria-label="Añadir reparto"
                    onClick={() => addCastMember(castInput, cast, field.onChange)}
                  >
                    {MESSAGES.actions.add}
                  </Button>
                </div>
              </div>
            );
          }}
        />
      </FormField>

      <FormField label={MESSAGES.series.opinion} htmlFor="opinion" error={errors.opinion?.message}>
        <Textarea id="opinion" rows={3} {...register('opinion')} hasError={!!errors.opinion} />
      </FormField>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {MESSAGES.actions.save}
        </Button>
      </div>
    </form>
  );
}
