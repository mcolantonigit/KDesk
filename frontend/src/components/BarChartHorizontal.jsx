import '../styles/BarChartHorizontal.css';

function BarChartHorizontal({ data, formatValue = (value) => value }) {
  if (data.length === 0) {
    return <p className="bar-chart-vacio">Sin datos para mostrar</p>;
  }

  const maximo = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="bar-chart">
      {data.map((item) => (
        <div className="bar-chart-fila" key={item.label} title={`${item.label}: ${formatValue(item.value)}`}>
          <span className="bar-chart-etiqueta">{item.label}</span>
          <div className="bar-chart-track">
            <div className="bar-chart-barra" style={{ width: `${(item.value / maximo) * 100}%` }} />
          </div>
          <span className="bar-chart-valor">{formatValue(item.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default BarChartHorizontal;
