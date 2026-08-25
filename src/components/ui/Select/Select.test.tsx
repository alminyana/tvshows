import { render, screen } from '@testing-library/react';
import { useState } from 'react';
import { Select } from './Select';

const OPTIONS = [
  { value: 'drama', label: 'Drama' },
  { value: 'comedia', label: 'Comedia' },
  { value: 'thriller', label: 'Thriller' },
];

describe('Select — single', () => {
  it('renderiza las opciones', () => {
    render(<Select options={OPTIONS} aria-label="género" />);
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('aplica aria-invalid con hasError', () => {
    render(<Select options={OPTIONS} aria-label="género" hasError />);
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-invalid', 'true');
  });

  it('dibuja un chevron decorativo junto al select', () => {
    const { container } = render(<Select options={OPTIONS} aria-label="género" />);
    const chevron = container.querySelector('svg[aria-hidden="true"]');
    expect(chevron).toBeInTheDocument();
  });
});

describe('Select — multiple', () => {
  function MultiWrapper() {
    const [value, setValue] = useState<string[]>([]);
    return (
      <>
        <Select multiple options={OPTIONS} aria-label="géneros" value={value} onChange={setValue} />
        <span data-testid="selected">{value.join(',')}</span>
      </>
    );
  }

  it('renderiza un listbox múltiple', () => {
    render(<MultiWrapper />);
    expect(screen.getByRole('listbox')).toBeInTheDocument();
  });

  it('no dibuja chevron: es una lista, no un desplegable', () => {
    const { container } = render(<MultiWrapper />);
    expect(container.querySelector('svg[aria-hidden="true"]')).not.toBeInTheDocument();
  });
});
