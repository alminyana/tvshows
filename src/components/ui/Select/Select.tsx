import { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import styles from './Select.module.scss';

export interface SelectOption {
  value: string;
  label: string;
}

interface SingleSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  hasError?: boolean;
  multiple?: false;
}

interface MultiSelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  options: SelectOption[];
  hasError?: boolean;
  multiple: true;
  value: string[];
  onChange: (values: string[]) => void;
}

type SelectProps = SingleSelectProps | MultiSelectProps;

// `appearance: none` elimina la flecha nativa, así que la dibujamos. Solo aplica
// al modo simple: con `multiple` el control es una lista, no un desplegable.
function ChevronDownIcon() {
  return (
    <svg
      className={styles.chevron}
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={16}
      height={16}
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(props, ref) {
  const { options, hasError, className, ...rest } = props;

  if (props.multiple) {
    const { value: selectedValues, onChange, ...nativeProps } = rest as MultiSelectProps;
    return (
      <select
        {...nativeProps}
        ref={ref}
        multiple
        value={selectedValues}
        onChange={(e) => {
          const chosen = Array.from(e.target.selectedOptions, (opt) => opt.value);
          onChange(chosen);
        }}
        className={[styles.select, hasError ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-invalid={hasError || undefined}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
    );
  }

  return (
    <span className={styles.wrap}>
      <select
        {...(rest as SingleSelectProps)}
        ref={ref}
        className={[styles.select, hasError ? styles.error : '', className].filter(Boolean).join(' ')}
        aria-invalid={hasError || undefined}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      <ChevronDownIcon />
    </span>
  );
});
