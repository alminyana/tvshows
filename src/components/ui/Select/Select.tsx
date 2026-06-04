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
  );
});
