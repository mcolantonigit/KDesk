import { Link } from 'react-router-dom';
import '../styles/BackButton.css';

function IconoFlecha() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// Botón "volver": con `to` navega a esa ruta; sin `to` ejecuta `onClick`
// (por ejemplo navigate(-1) para volver a donde se estaba).
function BackButton({ children = 'Volver', to, onClick }) {
  const contenido = (
    <>
      <IconoFlecha />
      <span>{children}</span>
    </>
  );

  if (to) {
    return (
      <Link to={to} className="back-button">
        {contenido}
      </Link>
    );
  }

  return (
    <button type="button" className="back-button" onClick={onClick}>
      {contenido}
    </button>
  );
}

export default BackButton;
