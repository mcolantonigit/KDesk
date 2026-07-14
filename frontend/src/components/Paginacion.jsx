import '../styles/Paginacion.css';

function construirPaginas(pagina, totalPaginas) {
  const paginas = [];
  for (let i = 1; i <= totalPaginas; i++) {
    if (i === 1 || i === totalPaginas || Math.abs(i - pagina) <= 1) {
      paginas.push(i);
    } else if (paginas[paginas.length - 1] !== '…') {
      paginas.push('…');
    }
  }
  return paginas;
}

function Paginacion({ pagina, totalPaginas, onCambiarPagina }) {
  if (totalPaginas <= 1) return null;

  const paginas = construirPaginas(pagina, totalPaginas);

  return (
    <div className="paginacion">
      <button type="button" disabled={pagina === 1} onClick={() => onCambiarPagina(pagina - 1)}>
        ‹ Anterior
      </button>

      {paginas.map((item, indice) =>
        item === '…' ? (
          <span key={`ellipsis-${indice}`} className="paginacion-ellipsis">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className={item === pagina ? 'activo' : ''}
            onClick={() => onCambiarPagina(item)}
          >
            {item}
          </button>
        )
      )}

      <button type="button" disabled={pagina === totalPaginas} onClick={() => onCambiarPagina(pagina + 1)}>
        Siguiente ›
      </button>
    </div>
  );
}

export default Paginacion;
