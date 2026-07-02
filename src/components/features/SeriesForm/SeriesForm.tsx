import { useEffect, useRef, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { seriesSchema } from '@/utils/seriesSchema';
import type { SeriesFormValues } from '@/utils/seriesSchema';
import { useGenres, useAuth } from '@/hooks';
import { imageService } from '@/services';
import { Button, FormField, Input, Textarea, Select, Rating, Tag, FileInput, ConfirmDialog } from '@/components/ui';
import { MESSAGES } from '@/constants';
import { categoricalColor } from '@/utils';
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
    setValue,
    getValues,
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
  const [genreInput, setGenreInput] = useState('');
  const [genreToDelete, setGenreToDelete] = useState<string | null>(null);
  const [isDeletingGenre, setIsDeletingGenre] = useState(false);
  const filePreviewUrlRef = useRef<string | null>(null);
  const { genres: genreCatalog, add: addGenreToCatalog, remove: removeGenreFromCatalog } = useGenres();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const genreOptions = genreCatalog.map((g) => ({ value: g, label: g }));

  async function handleConfirmDeleteGenre() {
    if (!genreToDelete) return;
    setIsDeletingGenre(true);
    try {
      await removeGenreFromCatalog(genreToDelete);
      const current = getValues('genres') ?? [];
      setValue(
        'genres',
        current.filter((g) => g.toLowerCase() !== genreToDelete.toLowerCase()),
      );
      setGenreToDelete(null);
    } finally {
      setIsDeletingGenre(false);
    }
  }

  useEffect(() => {
    if (!existingImageId) return;
    let src: string | undefined;
    imageService.getSrc(existingImageId).then((s) => {
      src = s;
      if (s) setImagePreview(s);
    });
    return () => {
      if (src) URL.revokeObjectURL(src);
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
      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{MESSAGES.series.sections.cover}</legend>

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
              <FileInput
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                ariaLabel={MESSAGES.series.cover}
                buttonLabel={MESSAGES.series.coverSelectFile}
                fileName={imageFile?.name}
              />
            </div>
          </div>
        </FormField>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{MESSAGES.series.sections.basics}</legend>

        <div className={styles.row}>
          <FormField label={MESSAGES.series.title} htmlFor="title" error={errors.title?.message} required>
            <Input id="title" {...register('title')} hasError={!!errors.title} />
          </FormField>

          <FormField label={MESSAGES.series.year} htmlFor="year" error={errors.year?.message}>
            <Input id="year" type="number" {...register('year')} hasError={!!errors.year} />
          </FormField>
        </div>

        <FormField label={MESSAGES.series.synopsis} htmlFor="synopsis" error={errors.synopsis?.message}>
          <Textarea id="synopsis" rows={4} {...register('synopsis')} hasError={!!errors.synopsis} />
        </FormField>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{MESSAGES.series.sections.classification}</legend>

        <FormField label={MESSAGES.series.seasons} htmlFor="seasons" error={errors.seasons?.message}>
          <Textarea id="seasons" rows={3} {...register('seasons')} hasError={!!errors.seasons} />
        </FormField>

        <FormField label={MESSAGES.series.genres} htmlFor="genres" error={errors.genres?.message}>
          <Controller
            name="genres"
            control={control}
            render={({ field }) => {
              const selected = (field.value ?? []) as string[];
              const addGenre = async () => {
                const canonical = await addGenreToCatalog(genreInput);
                if (!canonical) return;
                if (!selected.some((g) => g.toLowerCase() === canonical.toLowerCase())) {
                  field.onChange([...selected, canonical]);
                }
                setGenreInput('');
              };
              return (
                <div className={styles.chips}>
                  {selected.length > 0 && (
                    <div className={styles.selectedGenres}>
                      <span className={styles.chipRowLabel}>{MESSAGES.series.selectedGenres}</span>
                      <div className={styles.chipRow}>
                        {selected.map((g, i) => (
                          <Tag
                            key={g}
                            label={g}
                            color={categoricalColor(i)}
                            onRemove={isAdmin ? () => setGenreToDelete(g) : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  )}
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
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{MESSAGES.series.sections.rating}</legend>

        <FormField label={MESSAGES.series.rating} error={errors.rating?.message}>
          <Controller
            name="rating"
            control={control}
            render={({ field }) => (
              <Rating value={field.value ?? 0} onChange={field.onChange} label={MESSAGES.series.rating} />
            )}
          />
        </FormField>
      </fieldset>

      <fieldset className={styles.fieldset}>
        <legend className={styles.legend}>{MESSAGES.series.sections.opinion}</legend>

        <FormField label={MESSAGES.series.opinion} htmlFor="opinion" error={errors.opinion?.message}>
          <Textarea id="opinion" rows={3} {...register('opinion')} hasError={!!errors.opinion} />
        </FormField>
      </fieldset>

      <div className={styles.formActions}>
        <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting}>
          {MESSAGES.actions.save}
        </Button>
      </div>

      <ConfirmDialog
        isOpen={!!genreToDelete}
        title={genreToDelete ? MESSAGES.series.genreDeleteConfirm(genreToDelete) : ''}
        message={MESSAGES.series.genreDeleteConfirmDetail}
        onConfirm={handleConfirmDeleteGenre}
        onClose={() => setGenreToDelete(null)}
        isLoading={isDeletingGenre}
      />
    </form>
  );
}
