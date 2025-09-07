import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle = () => {
  const { toggleTheme, isLight } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`btn btn-outline-${isLight ? 'dark' : 'light'} btn-sm`}
      title={`Cambiar a tema ${isLight ? 'oscuro' : 'claro'}`}
    >
      {isLight ? (
        <>
          <i className="bi bi-moon-fill"></i>
          <span className="ms-2 d-none d-sm-inline">Oscuro</span>
        </>
      ) : (
        <>
          <i className="bi bi-sun-fill"></i>
          <span className="ms-2 d-none d-sm-inline">Claro</span>
        </>
      )}
    </button>
  );
};