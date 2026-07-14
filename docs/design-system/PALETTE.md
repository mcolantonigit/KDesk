# Paleta de gráficos (KDesk)

KDesk es una app de un solo tema (oscuro fijo, `color-scheme: dark` en
`index.css`, sin toggle de modo claro). Estos son los valores ya validados
para usar en cualquier gráfico nuevo (barras, líneas, etc.), y el script para
validar valores nuevos si hace falta agregar más series.

## Superficie de referencia

- Fondo de la app (`--bg` en `frontend/src/index.css`): `#0d1117`

## Serie 1 (uso actual: Estadísticas)

- `--series-1: #3987e5` (azul), definida en `frontend/src/index.css`.
- Se usa en los gráficos de barras de `Estadisticas.jsx` (una sola serie por
  gráfico, así que no hace falta leyenda: el título de cada card ya dice qué
  se mide).
- Elegido a propósito **distinto** del `--accent` naranja de KDesk (que ya se
  usa para botones/acciones), para no confundir "dato" con "acción".

## Set categórico completo (por si se necesitan más series)

Si en el futuro un gráfico necesita mostrar más de una serie a la vez (por
ejemplo, tickets por técnico separados por estado en el mismo gráfico), usar
estos 8 tonos en este orden — el orden ya fue optimizado para que los pares
adyacentes se distingan bajo daltonismo:

| Slot | Hue     | Hex (dark) |
|------|---------|------------|
| 1    | blue    | `#3987e5`  |
| 2    | aqua    | `#199e70`  |
| 3    | yellow  | `#c98500`  |
| 4    | green   | `#008300`  |
| 5    | violet  | `#9085e9`  |
| 6    | red     | `#e66767`  |
| 7    | magenta | `#d55181`  |
| 8    | orange  | `#d95926`  |

Validado contra la superficie `#0d1117` con `validate_palette.js` (ver
abajo): todos los checks pasan (lightness, chroma, contraste); el par
adyacente más ajustado de daltonismo (verde↔amarillo) queda en la banda
"floor" (ΔE 10.3), lo que es legal siempre que esas dos series tengan además
una etiqueta directa visible (no dependan solo del color) — ya es la práctica
en `BarChartHorizontal`, que siempre muestra el valor como texto.

## Cómo validar una paleta nueva

```bash
node docs/design-system/validate_palette.js \
  "#3987e5,#199e70,#c98500,#008300,#9085e9,#e66767,#d55181,#d95926" \
  --mode dark --surface "#0d1117"
```

Poné solo los hex que vayas a usar (no hace falta pasar los 8 si el gráfico
usa menos series). Para una rampa secuencial (magnitud, no identidad) o un
solo color de estado, no hace falta este script — ver el resto de la guía en
la skill `dataviz` si se necesita ese caso.
