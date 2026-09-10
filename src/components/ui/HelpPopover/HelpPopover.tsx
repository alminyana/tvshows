import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { MESSAGES } from '@/constants';
import styles from './HelpPopover.module.scss';

interface HelpPopoverProps {
  /** Nombre del campo que se explica; compone las etiquetas accesibles. */
  label: string;
  /** Id del panel, para que el control lo referencie con `aria-describedby`. */
  id?: string;
  children: ReactNode;
}

function QuestionIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={17}
      height={17}
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2-2.4 3.6" />
      <path d="M12 17.2v.02" />
    </svg>
  );
}

export function HelpPopover({ label, id, children }: HelpPopoverProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const autoId = useId();
  const panelId = id ?? autoId;

  // Cierre con Escape (devolviendo el foco al disparador) y con click fuera.
  // Solo suscrito mientras el panel está abierto, como en `Modal` y `Header`.
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (wrapperRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('pointerdown', handlePointerDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [open]);

  return (
    <span className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        ref={triggerRef}
        className={`${styles.trigger} ${open ? styles.triggerOpen : ''}`}
        aria-label={MESSAGES.actions.helpAbout(label)}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((prev) => !prev)}
      >
        <QuestionIcon />
      </button>

      {open && (
        <span
          id={panelId}
          role="dialog"
          aria-label={MESSAGES.actions.helpAbout(label)}
          className={styles.panel}
        >
          <button
            type="button"
            className={styles.close}
            aria-label={MESSAGES.actions.close}
            onClick={() => {
              setOpen(false);
              triggerRef.current?.focus();
            }}
          >
            ×
          </button>
          {children}
        </span>
      )}
    </span>
  );
}
