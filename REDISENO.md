# Rediseño — No Fluke Store

## Qué cambió y por qué

**1. El catálogo se vuelve claro. Lo oscuro queda para la bienvenida y el admin.**

La razón no es de gusto: tus fotos van a llegar de proveedores, casi todas
sobre fondo blanco. Sobre una interfaz oscura se ven como recortes flotando con
la costura visible, y tendrías que editar cada foto para arreglarlo. Sobre papel
claro se integran solas y la mercancía es lo más brillante de la pantalla, que
es lo que quiere una tienda.

La bienvenida se queda oscura y dramática. El contraste al entrar al catálogo
funciona a favor: se siente como cruzar la puerta del local.

**2. El verde deja de ser un brillo y pasa a ser señalización.**

Regla: el verde **nunca** va como texto sobre fondo claro. No tiene contraste
suficiente y se lee sucio. Va como bloque relleno con tinta encima, o como
texto sobre tinta. Así aparece en el marcador de rebaja, en el escalón de
mayoreo, en la franja de mayoreo y en el indicador de la pestaña activa. Menos
lugares, más peso en cada uno.

**3. La audacia se gasta en el precio.**

En un catálogo el precio es el contenido emocional, y en tu caso además carga
el argumento de negocio. Por eso el componente `Precio` es la pieza con más
peso visual del sitio: cifra en Syne con numerales tabulares, y debajo el
escalón de mayoreo como bloque verde. Todo lo demás alrededor se mantiene
callado para que ese bloque destaque.

**4. Se elimina el marco de tarjeta.**

Borde, radio y relleno translúcido en cada producto es el kit genérico. Ahora
la foto se apoya en lienzo blanco, un filete de tinta la ata a su información,
y el texto va debajo. En rejilla apretada las fotos forman un muro de
mercancía.

**5. Fuera las mayúsculas espaciadas y los emojis.**

Las etiquetas tipo `NUEVA COLECCIÓN` con `tracking-[0.3em]` sobre cada sección
son decoración, no información. Los emojis en la navegación inferior son el
mayor delator de "sitio sin terminar". Ahora hay iconos SVG de trazo
consistente.

**6. El movimiento se concentra en la bienvenida.**

Las clases `aparecer-1` a `aparecer-6` desaparecen del catálogo. Animar la
entrada de cada sección retrasa la primera vista del producto y se siente
generado. La bienvenida conserva su secuencia completa: un momento
orquestado vale más que efectos repartidos.

---

## Archivos

| Archivo | Estado |
|---|---|
| `app/globals.css` | Reemplaza el actual |
| `components/tienda/Precio.tsx` | Nuevo |
| `components/tienda/TarjetaProducto.tsx` | Reemplaza el actual |
| `components/tienda/MarcoTienda.tsx` | Reemplaza el actual |
| `app/tienda/page.tsx` | Reemplaza el actual |

### Un cambio pendiente en `app/layout.tsx`

El `<body>` tiene el fondo oscuro fijo. Quítalo de ahí para que cada territorio
ponga el suyo:

```diff
- <body className="bg-[#040705] text-white min-h-dvh flex flex-col">
+ <body className="min-h-dvh flex flex-col">
```

Y en `app/page.tsx` (la bienvenida) añade `bg-tinta text-white` al contenedor
raíz, ya que ahora no lo hereda.

---

## Paleta

| Token | Hex | Uso |
|---|---|---|
| `tinta` | `#0A1310` | Texto, hero, panel lateral, bienvenida |
| `tinta-suave` | `#16211C` | Superficies elevadas en oscuro |
| `papel` | `#EDF0EC` | Campo del catálogo |
| `lienzo` | `#FFFFFF` | Fondo de las fotos de producto |
| `verde` | `#16DB65` | Bloques de acción y marcadores |
| `verde-hondo` | `#0B8F43` | Hover, foco, subrayados |
| `verde-humo` | `#D7F5E3` | Fondos suaves de aviso |
| `humo` | `#66756D` | Texto secundario |
| `linea` | `#D3D9D3` | Filetes y separadores |
| `alerta` | `#D92D20` | Últimas unidades |

## Tipografía

Se mantienen Syne y Geist, pero con roles más estrictos.

- `.titular` — Syne 800, interlineado 0.92, tracking −0.03em. Solo en el lema
  del hero y en los títulos de sección. Nunca en párrafos ni etiquetas.
- `.cifra` — Syne 800 con `tabular-nums`, para que las columnas de precios
  alineen verticalmente en la rejilla.
- Geist para todo lo demás, en caja normal.

## Reglas que conviene no romper

1. Verde nunca como texto sobre claro.
2. Nada de mayúsculas espaciadas como etiqueta de sección.
3. Sin animaciones de entrada en el catálogo. El movimiento responde a acciones
   del usuario o vive en la bienvenida.
4. Un solo radio de borde: ninguno. Las esquinas rectas sostienen el aire de
   señalización urbana. La excepción son los avatares y el logo.
5. El bloque de precio no compite con nada a su alrededor.

---

## Prompt para Claude Code

```
Voy a reemplazar cinco archivos con un rediseño. Lee REDISENO.md antes de nada.

1. Reemplaza globals.css, TarjetaProducto.tsx, MarcoTienda.tsx y
   app/tienda/page.tsx con las versiones que te doy, y crea
   components/tienda/Precio.tsx.
2. Aplica el cambio a app/layout.tsx descrito en REDISENO.md.
3. Recorre el resto de pantallas de /tienda (categoría, producto, carrito,
   ofertas) y adáptalas al nuevo sistema: fondo papel, texto tinta, sin
   marcos de tarjeta, sin mayúsculas espaciadas, sin emojis, usando el
   componente Precio donde haya precios.
4. El panel /admin se queda oscuro, pero cámbiale los tokens a tinta,
   tinta-suave, verde y humo para que use la misma paleta.
5. Revisa que ninguna clase use el verde como color de texto sobre fondo
   claro, y dime si encuentras alguna.

No toques la bienvenida, ya está resuelta.
```
