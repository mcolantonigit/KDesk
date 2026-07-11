# KDesk UI Design System

## Objetivo

La interfaz debe transmitir una sensación de:

- Profesional
- Moderna
- Tecnológica
- Elegante
- Minimalista
- Muy limpia
- Sin elementos innecesarios
- Alto contraste
- Muy cómoda para trabajar durante horas

Debe sentirse como una mezcla entre:

- Linear
- Vercel Dashboard
- Stripe Dashboard
- Clerk
- Raycast
- Modern SaaS Admin Panel

NO debe parecer Bootstrap.

NO debe parecer Material Design.

NO usar sombras exageradas, degradados fuertes ni colores saturados.

---

# Estilo general

Toda la aplicación utilizará un tema oscuro.

Los fondos deben ser semi transparentes, con una sensación de cristal muy suave.

No usar glassmorphism extremo.

La transparencia debe ser muy sutil.

Ejemplo:

background: rgba(18,22,32,.72)

backdrop-filter: blur(14px)

---

# Fondo de pantalla

Todas las pantallas (login, registro, paneles, etc.) usan este patrón
geométrico como fondo del contenedor de página, detrás de las cards de
vidrio:

```css
.pagina {
  --s: 85px; /* controla el tamaño */
  --c1: #000000;
  --c2: #001d29;

  --g1: conic-gradient(from 45deg at 62.5% 12.5%, #0000 75%, var(--c1) 0);
  --g2: conic-gradient(from -45deg at 12.5% 12.5%, #0000 75%, var(--c1) 0);
  --g3: conic-gradient(from 225deg at 87.5% 87.5%, #0000 75%, var(--c2) 0);
  --g4: conic-gradient(from 135deg at 87.5% 37.5%, #0000 75%, var(--c2) 0);

  background:
    var(--g4), var(--g4) var(--s) var(--s),
    var(--g3), var(--g3) var(--s) var(--s),
    var(--g2), var(--g2) var(--s) var(--s),
    var(--g1), var(--g1) var(--s) var(--s),
    repeating-linear-gradient(135deg, var(--c2) 0 12.5%, var(--c1) 0 25%);
  background-size: calc(2 * var(--s)) calc(2 * var(--s));
}
```

Aplicar como background del contenedor raíz de cada pantalla (no en
`html`/`body` global), para no interferir con futuros layouts que
tengan su propio fondo (paneles con sidebar, por ejemplo).

---

# Paleta

## Fondo principal

#0D1117

## Fondo secundario

rgba(18,22,32,.72)

## Cards

rgba(22,28,40,.72)

## Hover

rgba(35,42,58,.90)

## Bordes

rgba(255,255,255,.08)

## Bordes activos

#f26522

## Texto principal

#F5F7FA

## Texto secundario

#B7BDC9

## Texto deshabilitado

#7B8595

## Color principal

#f26522

Usar siempre este naranja exacto como color de acento (selección, foco,
botón primario, bordes activos). Cualquier imagen o referencia visual
que se use como inspiración de layout puede traer un amarillo/ámbar
distinto: no imitar ese tono, reemplazarlo siempre por #f26522.

## Hover principal

#ff7b3b

## Error

#E5484D

## Success

#2FBF71

## Warning

#FFB020

---

# Tipografía

Fuente:

Inter

Alternativas:

- Manrope
- Plus Jakarta Sans

Nunca usar:

- Roboto
- Open Sans

---

## Títulos

700

line-height: 1.1

letter-spacing: -0.03em

---

## Texto normal

400

line-height: 1.6

---

## Labels

500

---

## Botones

600

uppercase: NO

---

# Bordes

Todos los componentes utilizan bordes redondeados.

Inputs

12px

Cards

18px

Modales

20px

Botones

12px

Pills

999px

---

# Sombras

Muy suaves.

Nunca negras.

Ejemplo:

0 8px 32px rgba(0,0,0,.20)

---

# Cards

Las cards deben ser:

- fondo semi transparente
- borde de 1px
- blur suave
- padding amplio
- mucho espacio en blanco

Nunca usar fondos completamente negros.

---

# Botones

## Primario

Fondo:

#f26522

Texto blanco.

Hover:

ligeramente más claro.

Animación:

150ms ease.

---

## Secundario

Transparente.

Borde:

rgba(255,255,255,.08)

Hover:

rgba(255,255,255,.04)

---

# Inputs

Altura:

46-50px

Borde:

1px sólido

Color:

rgba(255,255,255,.08)

Focus:

border-color: #f26522

box-shadow:

0 0 0 3px rgba(242,101,34,.15)

Placeholder:

gris claro.

---

# Tablas

Filas altas.

Hover muy suave.

Separadores mínimos.

Mucho padding horizontal.

---

# Iconos

Lucide Icons

Stroke:

1.75

Nunca usar iconos rellenos.

---

# Espaciado

Usar sistema de 8px.

Separaciones frecuentes:

8

12

16

24

32

40

48

64

Nunca colocar elementos demasiado juntos.

---

# Animaciones

Todas las transiciones:

150ms

ease

Hover:

- subir 1px
- aclarar apenas el fondo

No usar rebotes.

No usar animaciones largas.

---

# Efectos

Glass muy sutil.

Blur:

12-16px

Nunca más de 20px.

---

# Scroll

Scrollbar minimalista.

Color:

rgba(255,255,255,.10)

Hover:

#f26522

---

# Formularios

Labels arriba.

Mucho espacio entre campos.

Los botones ocupan todo el ancho únicamente cuando tiene sentido.

---

# Estados

Seleccionado:

- borde naranja
- fondo apenas más claro

Hover:

- aclarar un 4%

Activo:

- borde naranja
- glow muy suave

---

# Filas seleccionables (radio/lista)

Para listas donde se elige una sola opción (por ejemplo, tipo de ticket).

- fila completa clickeable, altura cómoda, mucho padding horizontal
- radio button a la izquierda, contenido al medio, valor/dato secundario a la derecha
- no seleccionada: borde `rgba(255,255,255,.08)`, fondo de card normal
- seleccionada: borde `#f26522`, fondo apenas más claro (mismo criterio que "Estados > Seleccionado")
- hover: aclarar un 4%, sin mover el layout

---

# Stepper (pasos)

Para flujos de varios pasos (ej. altas o wizards a futuro; no se usa en login/registro, que son formularios de un solo paso).

- pasos en fila horizontal, separados por una línea fina (`rgba(255,255,255,.08)`)
- paso actual: círculo con borde `#f26522`, número o ícono en naranja, label en texto principal
- pasos futuros: círculo con borde tenue, número/label en texto deshabilitado (`#7B8595`)
- pasos completados: círculo relleno `#f26522` con check, label en texto secundario
- sin animaciones de transición entre pasos más allá del fade/slide estándar (150ms ease)

---

# Sensación visual

La interfaz debe transmitir:

- software premium
- empresa tecnológica
- rapidez
- limpieza
- orden
- simplicidad
- confianza

Debe parecer un software de 2026.

Nunca debe parecer una aplicación hecha con Bootstrap o AdminLTE.

Todo componente nuevo debe respetar este sistema visual.