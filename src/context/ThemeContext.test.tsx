import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, ThemeContext } from './ThemeContext';
import { use } from 'react';

function ThemeDisplay() {
  const { theme, mode, setTheme, setMode, toggleMode } = use(ThemeContext);
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="mode">{mode}</span>
      <button onClick={() => setTheme('ocean')}>set ocean</button>
      <button onClick={() => setMode('dark')}>set dark</button>
      <button onClick={toggleMode}>toggle</button>
    </div>
  );
}

function renderWithProvider() {
  return render(
    <ThemeProvider>
      <ThemeDisplay />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  document.documentElement.removeAttribute('data-mode');
});

describe('ThemeContext', () => {
  it('aplica data-theme y data-mode al documentElement', () => {
    renderWithProvider();
    expect(document.documentElement.dataset.theme).toBe('default');
    expect(document.documentElement.dataset.mode).toBeDefined();
  });

  it('cambia el tema y lo persiste en localStorage', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('set ocean'));
    expect(screen.getByTestId('theme').textContent).toBe('ocean');
    expect(localStorage.getItem('tv-shows:theme')).toBe('ocean');
  });

  it('cambia el modo y lo persiste en localStorage', async () => {
    renderWithProvider();
    await userEvent.click(screen.getByText('set dark'));
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    expect(localStorage.getItem('tv-shows:mode')).toBe('dark');
  });

  it('toggleMode alterna entre light y dark', async () => {
    localStorage.setItem('tv-shows:mode', 'light');
    renderWithProvider();
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('mode').textContent).toBe('dark');
    await userEvent.click(screen.getByText('toggle'));
    expect(screen.getByTestId('mode').textContent).toBe('light');
  });

  it('recupera tema y modo persistidos en localStorage', () => {
    localStorage.setItem('tv-shows:theme', 'sunset');
    localStorage.setItem('tv-shows:mode', 'dark');
    renderWithProvider();
    expect(screen.getByTestId('theme').textContent).toBe('sunset');
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });

  it('respeta prefers-color-scheme cuando no hay valor en localStorage', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query: string) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }),
    });
    renderWithProvider();
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });
});
