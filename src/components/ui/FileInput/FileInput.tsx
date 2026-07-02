import { useId, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { Button } from '../Button/Button';
import styles from './FileInput.module.scss';

interface FileInputProps {
  accept?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  ariaLabel: string;
  buttonLabel: string;
  fileName?: string;
}

export function FileInput({ accept, onChange, ariaLabel, buttonLabel, fileName }: FileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  return (
    <div className={styles.wrapper}>
      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={onChange}
        className="sr-only"
        aria-label={ariaLabel}
      />
      <Button type="button" variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
        {buttonLabel}
      </Button>
      {fileName && <span className={styles.fileName}>{fileName}</span>}
    </div>
  );
}
