import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SeriesForm } from './SeriesForm';
import type { SeriesFormValues } from '@/utils/seriesSchema';

vi.mock('@/services', () => ({
  imageService: { get: vi.fn().mockResolvedValue(undefined) },
}));

const validValues: SeriesFormValues = {
  title: 'Breaking Bad',
  synopsis: 'Un profesor de química.',
  seasons: 5,
  year: 2008,
  rating: 5,
  genres: ['Drama', 'Thriller'],
  cast: ['Bryan Cranston'],
  opinion: 'Magistral.',
};

function renderForm(props: Partial<React.ComponentProps<typeof SeriesForm>> = {}) {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  render(<SeriesForm onSubmit={onSubmit} {...props} />);
  return { onSubmit };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('SeriesForm', () => {
  it('renderiza todos los campos', () => {
    renderForm();
    expect(screen.getByLabelText(/título/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/sinopsis/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/año/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/temporadas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/géneros/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument();
  });

  it('precarga datos en modo edición', () => {
    renderForm({ initialValues: validValues });
    expect(screen.getByLabelText<HTMLInputElement>(/título/i).value).toBe('Breaking Bad');
    expect(screen.getByLabelText<HTMLTextAreaElement>(/sinopsis/i).value).toBe('Un profesor de química.');
  });

  it('muestra chip del reparto precargado en edición', () => {
    renderForm({ initialValues: validValues });
    expect(screen.getByText('Bryan Cranston')).toBeInTheDocument();
  });

  it('añade miembro del reparto con Enter', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText(/añadir miembro del reparto/i);
    await user.type(input, 'Aaron Paul');
    await user.keyboard('{Enter}');
    expect(screen.getByText('Aaron Paul')).toBeInTheDocument();
    expect((input as HTMLInputElement).value).toBe('');
  });

  it('añade miembro del reparto con el botón Añadir', async () => {
    const user = userEvent.setup();
    renderForm();
    const input = screen.getByLabelText(/añadir miembro del reparto/i);
    await user.type(input, 'Anna Gunn');
    await user.click(screen.getByRole('button', { name: /añadir/i }));
    expect(screen.getByText('Anna Gunn')).toBeInTheDocument();
  });

  it('quita un chip del reparto', async () => {
    const user = userEvent.setup();
    renderForm({ initialValues: validValues });
    expect(screen.getByText('Bryan Cranston')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /quitar Bryan Cranston/i }));
    expect(screen.queryByText('Bryan Cranston')).not.toBeInTheDocument();
  });

  it('muestra errores de validación al enviar vacío', async () => {
    const user = userEvent.setup();
    renderForm();
    await user.click(screen.getByRole('button', { name: /guardar/i }));
    await waitFor(() => {
      expect(screen.getAllByRole('alert').length).toBeGreaterThan(0);
    });
  });

  it('llama a onSubmit con datos válidos', async () => {
    const user = userEvent.setup();
    const { onSubmit } = renderForm();

    await user.type(screen.getByLabelText(/título/i), validValues.title);
    await user.type(screen.getByLabelText(/sinopsis/i), validValues.synopsis);
    await user.clear(screen.getByLabelText(/año/i));
    await user.type(screen.getByLabelText(/año/i), String(validValues.year));
    await user.clear(screen.getByLabelText(/temporadas/i));
    await user.type(screen.getByLabelText(/temporadas/i), String(validValues.seasons));

    // valoración: click en estrella 5
    const stars = screen.getAllByRole('radio');
    await user.click(stars[4]);

    // géneros: seleccionar Drama
    const genreSelect = screen.getByLabelText(/géneros/i);
    await user.selectOptions(genreSelect, ['Drama']);

    await user.click(screen.getByRole('button', { name: /guardar/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledOnce();
    });

    const [calledData] = onSubmit.mock.calls[0];
    expect(calledData.title).toBe(validValues.title);
  });

  it('rechaza imagen con tipo no válido', async () => {
    renderForm();
    const file = new File(['img'], 'foto.gif', { type: 'image/gif' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/solo se aceptan imágenes/i)).toBeInTheDocument();
    });
  });

  it('rechaza imagen que supera 2 MB', async () => {
    renderForm();
    const largeBuffer = new ArrayBuffer(3 * 1024 * 1024);
    const file = new File([largeBuffer], 'foto.jpg', { type: 'image/jpeg' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
    await waitFor(() => {
      expect(screen.getByText(/no puede superar 2 mb/i)).toBeInTheDocument();
    });
  });
});
