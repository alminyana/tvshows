import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renderiza el label asociado al input', () => {
    render(
      <FormField label="Título" htmlFor="titulo">
        <input id="titulo" />
      </FormField>,
    );
    expect(screen.getByLabelText('Título')).toBeInTheDocument();
  });

  it('muestra el mensaje de error con role alert', () => {
    render(
      <FormField label="Título" htmlFor="titulo" error="Campo obligatorio.">
        <input id="titulo" />
      </FormField>,
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Campo obligatorio.');
  });

  it('no renderiza el error si no se pasa', () => {
    render(
      <FormField label="Título">
        <input />
      </FormField>,
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('muestra asterisco cuando required es true', () => {
    render(
      <FormField label="Título" required>
        <input />
      </FormField>,
    );
    expect(screen.getByText('Título', { exact: false })).toBeInTheDocument();
  });
});
