# Tienda Catálogo — Especificación Técnica (Firebase)

Proyecto: catálogo de productos (perfumes, ropa, t-shirts, zapatos) con panel
administrativo, carrito y cierre de pedido por WhatsApp.

---

## 1. Stack

| Capa | Tecnología | Nota |
|---|---|---|
| Framework | Next.js 15 (App Router) | Mismo stack que Sport'Zone85 |
| Estilos | Tailwind CSS | |
| Base de datos | **Cloud Firestore** | |
| Imágenes | **Firebase Storage** + `next/image` | Vercel hace la optimización |
| Autenticación | **Firebase Auth** | Solo para el admin, no para clientes |
| Backend seguro | **Firebase Admin SDK** | En Server Actions, nunca en el cliente |
| Hosting | Vercel | |
| App móvil | PWA instalable | Sección 11 |
| Carrito | Zustand + localStorage | No toca la base de datos |

**Web y celular con un solo proyecto.** El mismo código sirve sitio responsive,
app instalable (PWA) y, si más adelante hace falta, app en Play Store y App
Store vía Capacitor. Ver sección 11.

### 1.1 Dos SDK, dos usos

Esta separación es la base de toda la seguridad del proyecto:

- **SDK de cliente** (`firebase/app`, `firebase/firestore`): solo para leer el
  catálogo público y para el login del admin. Sus claves son públicas por
  diseño; lo que protege los datos son las Security Rules.
- **Admin SDK** (`firebase-admin`): solo en el servidor. Ignora las Security
  Rules por completo. Se usa para crear pedidos, descontar stock y todas las
  escrituras del panel. Su credencial **nunca** lleva el prefijo `NEXT_PUBLIC_`.

---

## 2. Modelo de datos

Firestore no tiene joins. La regla es: **si dos cosas siempre se leen juntas,
van en el mismo documento.** Por eso las variantes y las imágenes viven dentro
del producto, no en colecciones separadas.

### `categorias/{id}`

```ts
{
  nombre: "Zapatos",
  slug: "zapatos",
  imagenUrl: string | null,
  orden: 1,
  activa: true,
  creadoEn: Timestamp
}
```

### `productos/{id}`

```ts
{
  nombre: "T-Shirt Oversize Negro",
  slug: "t-shirt-oversize-negro",         // único, se valida al guardar
  descripcion: "Algodón 100%...",
  marca: "Nike",

  // Denormalizado: se copia de la categoría para no hacer segunda lectura.
  // Si se renombra una categoría, hay que actualizar sus productos (ver 2.2).
  categoriaId: "abc123",
  categoriaNombre: "Ropa",
  categoriaSlug: "ropa",

  precio: 1250.00,
  precioOferta: 950.00 | null,
  ofertaHasta: Timestamp | null,

  // Precio al por mayor: se aplica solo al llegar a la cantidad mínima
  precioMayor: 800.00 | null,
  cantidadMayor: 6 | null,        // unidades del producto, sumando variantes

  activo: true,
  destacado: false,

  // Embebidas. Una lectura trae el producto completo.
  variantes: [
    { id: "v1", talla: "M", color: "Negro", sku: "TS-M-NEG", stock: 5, activo: true },
    { id: "v2", talla: "L", color: "Negro", sku: "TS-L-NEG", stock: 0, activo: true }
  ],

  imagenes: [
    { path: "productos/abc/1.webp", url: "https://...", alt: "Frente", orden: 0 }
  ],

  // Para búsqueda con array-contains: tokens en minúscula y sin acentos
  keywords: ["ts","tsh","tshi","tshir","tshirt","oversize","negro","nike"],

  stockTotal: 5,          // suma de variantes, se recalcula al guardar
  creadoEn: Timestamp,
  actualizadoEn: Timestamp
}
```

### `pedidos/{id}`

```ts
{
  codigo: "PED-8F3K",                     // corto, para decirlo por WhatsApp
  clienteNombre: "María Pérez",
  clienteTelefono: "18095551234",
  nota: "Entregar en la tarde",

  // Copia congelada. Si mañana sube el precio, el pedido viejo no cambia.
  items: [
    {
      productoId: "abc123",
      varianteId: "v1",
      productoNombre: "T-Shirt Oversize Negro",
      varianteDesc: "Talla M / Negro",
      precioUnitario: 950.00,
      tipoPrecio: "mayor",              // detalle | oferta | mayor
      cantidad: 2,
      imagenUrl: "https://..."
    }
  ],

  subtotal: 1900.00,
  costoEnvio: 0,
  total: 1900.00,

  estado: "pendiente",                    // pendiente|confirmado|entregado|cancelado
  stockDescontado: false,                 // evita descontar dos veces
  creadoEn: Timestamp,
  actualizadoEn: Timestamp
}
```

### `config/tienda` (documento único)

```ts
{
  nombreTienda: "Mi Tienda",
  whatsapp: "1809XXXXXXX",                // internacional, sin +
  moneda: "DOP",
  costoEnvio: 0,
  mensajeBienvenida: string | null,
  logoUrl: string | null
}
```

### 2.1 Índices compuestos

Firestore los pide cuando se combina `where` con `orderBy`. Crear en la consola:

- `productos`: `activo` (asc) + `creadoEn` (desc)
- `productos`: `activo` (asc) + `categoriaSlug` (asc) + `creadoEn` (desc)
- `productos`: `activo` (asc) + `destacado` (asc) + `creadoEn` (desc)
- `pedidos`: `estado` (asc) + `creadoEn` (desc)

Cuando una consulta falla, Firestore devuelve en el mensaje de error un enlace
directo para crear el índice que falta. Es la forma más rápida de hacerlo.

### 2.2 Lo que hay que mantener a mano

Firestore no tiene claves foráneas ni triggers. Estas tres cosas se actualizan
en código al guardar:

1. **`stockTotal`** — recalcular sumando las variantes cada vez que se guarda
   un producto.
2. **`keywords`** — regenerar desde `nombre` y `marca` al guardar.
3. **`categoriaNombre` / `categoriaSlug`** — si el admin renombra una categoría,
   actualizar en lote los productos de esa categoría con `writeBatch` (máximo
   500 documentos por lote).

---

## 3. Security Rules

Sin esto, cualquiera con la clave pública borra tus productos. La clave pública
de Firebase va dentro del bundle del navegador, o sea que está a la vista de
todos. Lo que realmente protege los datos son estas reglas.

### Firestore

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function esAdmin() {
      return request.auth != null && request.auth.token.rol == 'admin';
    }

    // Catálogo: lectura pública, escritura solo admin
    match /productos/{id} {
      allow read: if true;
      allow write: if esAdmin();
    }

    match /categorias/{id} {
      allow read: if true;
      allow write: if esAdmin();
    }

    match /config/{id} {
      allow read: if true;
      allow write: if esAdmin();
    }

    // Pedidos: NADIE los toca desde el cliente.
    // Se crean y modifican solo con el Admin SDK desde el servidor.
    match /pedidos/{id} {
      allow read, write: if esAdmin();
    }
  }
}
```

Nota: `allow read: if true` en productos deja ver también los inactivos a quien
consulte directo. Si eso molesta, la alternativa es leer todo el catálogo desde
el servidor con el Admin SDK y cerrar la lectura del cliente
(`allow read: if esAdmin()`). Es más seguro y encaja con el enfoque de ISR de la
sección 4.

### Storage

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /productos/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
                   && request.auth.token.rol == 'admin'
                   && request.resource.size < 2 * 1024 * 1024
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```

### 3.1 Marcar al admin

El rol se pone como *custom claim*. Se corre una sola vez con un script local:

```ts
// scripts/hacer-admin.ts
import admin from 'firebase-admin';
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });

const uid = 'UID_DEL_USUARIO';
await admin.auth().setCustomUserClaims(uid, { rol: 'admin' });
```

El claim aparece en el token cuando el usuario vuelve a iniciar sesión, o
llamando `getIdToken(true)` para forzar la actualización.

---

## 4. Control de costos

Esta es la parte donde Firebase se pone caro si se usa mal. El plan gratis
(Spark) da 50,000 lecturas de documento al día.

**El error a evitar:** consultar Firestore desde el navegador en cada visita.
Una página de categoría con 40 productos gasta 40 lecturas *por visitante*. Con
1,000 visitas al día son 40,000 lecturas solo en esa pantalla.

**Lo correcto:** leer con el Admin SDK en Server Components y cachear con ISR.

```ts
// app/(tienda)/categoria/[slug]/page.tsx
export const revalidate = 60;   // se regenera cada 60 segundos

export default async function Pagina({ params }) {
  const productos = await obtenerProductosPorCategoria(params.slug);
  // ...
}
```

Con esto, 1,000 visitantes en un minuto consumen las mismas 40 lecturas que uno
solo. La diferencia es de dos órdenes de magnitud.

Reglas prácticas:

- Catálogo, categorías y config: siempre en el servidor con ISR.
- Panel de admin: consultas en vivo, sin caché. Es un solo usuario, no importa.
- Después de crear o editar un producto, llamar `revalidatePath()` para que el
  cambio salga de inmediato sin esperar los 60 segundos.
- **Nunca** usar `onSnapshot` (tiempo real) en el catálogo público. Un catálogo
  no necesita actualizarse solo, y cada oyente conectado cuesta.

---

## 5. Búsqueda y filtros

Firestore no tiene búsqueda de texto completo. Dos enfoques según el tamaño:

**Catálogo pequeño (menos de 500 productos) — recomendado para empezar.**
Traer todos los productos activos una vez en el servidor con ISR y filtrar en
memoria por categoría, talla, color, rango de precio y texto. Es instantáneo
para el usuario, no gasta lecturas adicionales por filtro y no necesita índices
compuestos.

**Búsqueda desde el cliente sin cargar todo.** Usar el arreglo `keywords`:

```ts
query(
  collection(db, 'productos'),
  where('activo', '==', true),
  where('keywords', 'array-contains', termino.toLowerCase()),
  limit(20)
);
```

Limitación real: solo encuentra prefijos de palabras completas. Buscar "shirt"
no encuentra "t-shirt" si el token no se generó así. Al construir `keywords`,
normalizar quitando acentos y guiones, y generar prefijos desde 2 caracteres.

**Si el catálogo pasa de 1,000 productos:** ahí sí conviene Algolia o Typesense
sincronizados con Cloud Functions. No antes; es complejidad que no hace falta.

---

## 6. Imágenes

Es lo que define si la tienda se siente rápida o lenta.

**1. Comprimir en el navegador antes de subir.** Una foto de celular pesa
4–8 MB. Con `browser-image-compression`, máximo 1600px de lado y 1 MB. Es
obligatorio: las Security Rules de arriba rechazan cualquier archivo mayor a
2 MB.

```ts
import imageCompression from 'browser-image-compression';

const comprimida = await imageCompression(archivo, {
  maxSizeMB: 1,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  fileType: 'image/webp'
});
```

**2. Servir con `next/image`.** Aquí se resuelve que Firebase Storage no
transforme imágenes: Vercel redimensiona y convierte a WebP las URLs remotas.

```js
// next.config.js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'firebasestorage.googleapis.com' }
  ]
}
```

**3. Guardar `path` y `url`.** El `path` (`productos/abc/1.webp`) es lo que se
necesita para borrar el archivo del Storage cuando se elimina el producto. Si
solo se guarda la URL, quedan archivos huérfanos ocupando cuota para siempre.

**4. Borrado en cascada manual.** Firestore no borra el Storage. Al eliminar un
producto hay que recorrer su arreglo `imagenes` y borrar cada archivo.

**5. Primera imagen del listado con `priority`**, el resto con carga diferida.

---

## 7. Flujo de pedido por WhatsApp

1. El cliente arma el carrito (`localStorage`, sin tocar Firestore).
2. Toca **Pedir por WhatsApp**. Se le piden nombre y teléfono, nada más.
3. Una **Server Action** con el Admin SDK relee los productos desde Firestore,
   valida stock, **recalcula el total en el servidor** (nunca confiar en el
   precio que manda el cliente), crea el pedido y devuelve el código.
4. Se abre el enlace de WhatsApp con el mensaje precargado.
5. El dueño ve el pedido completo en su panel y lo confirma o cancela.

Guardar el pedido antes de abrir el chat es lo que evita que el único registro
de ventas sea la conversación de WhatsApp.

### Construcción del enlace

```ts
const mensaje = [
  `Hola! Pedido *${codigo}*`,
  ``,
  ...items.map(i => `• ${i.cantidad}x ${i.productoNombre}` +
                    (i.varianteDesc ? ` (${i.varianteDesc})` : '') +
                    ` — RD$${(i.precioUnitario * i.cantidad).toFixed(2)}`),
  ``,
  `Total: *RD$${total.toFixed(2)}*`,
  `Nombre: ${nombre}`,
].join('\n');

const url = `https://wa.me/${whatsapp}?text=${encodeURIComponent(mensaje)}`;
```

Los enlaces `wa.me` fallan si el texto pasa de unos 2,000 caracteres. Si el
carrito trae muchos artículos, mandar solo el código y el total.

En iOS, `window.location.href = url` funciona mejor que `window.open()`, que a
veces lo bloquea el navegador.

### Descuento de stock

El stock se descuenta **cuando el admin confirma**, no cuando el cliente pide.
Por WhatsApp mucha gente pregunta y no compra; descontar al momento del pedido
deja productos marcados agotados que sí hay en existencia.

Se hace en una transacción para que dos confirmaciones simultáneas no dejen
stock negativo:

```ts
// actions/pedidos.ts  (Admin SDK, servidor)
await db.runTransaction(async (tx) => {
  const pedidoRef = db.collection('pedidos').doc(pedidoId);
  const pedidoSnap = await tx.get(pedidoRef);
  const pedido = pedidoSnap.data();

  if (pedido.stockDescontado) return;          // idempotente

  // 1. Leer TODOS los productos primero. Firestore exige que las lecturas
  //    de una transacción ocurran antes que cualquier escritura.
  const productosSnap = await Promise.all(
    pedido.items.map(i => tx.get(db.collection('productos').doc(i.productoId)))
  );

  // 2. Validar y escribir
  productosSnap.forEach((snap, idx) => {
    const item = pedido.items[idx];
    const producto = snap.data();
    const variantes = producto.variantes.map(v =>
      v.id === item.varianteId ? { ...v, stock: v.stock - item.cantidad } : v
    );

    const nueva = variantes.find(v => v.id === item.varianteId);
    if (nueva.stock < 0) {
      throw new Error(`Sin stock suficiente: ${item.productoNombre}`);
    }

    tx.update(snap.ref, {
      variantes,
      stockTotal: variantes.reduce((s, v) => s + v.stock, 0)
    });
  });

  tx.update(pedidoRef, {
    estado: 'confirmado',
    stockDescontado: true,
    actualizadoEn: FieldValue.serverTimestamp()
  });
});
```

---

## 8. Panel administrativo

Ruta `/admin`, protegida por middleware que verifica la sesión y el claim `rol`.

**Pantallas:**

- **Pedidos** — pantalla de inicio. Lista por estado con badge de pendientes.
  Botones Confirmar / Entregado / Cancelar. Confirmar corre la transacción de
  arriba.
- **Productos** — tabla con búsqueda, filtro por categoría, columna de stock
  total, interruptor rápido de activo/inactivo.
- **Editor de producto** — datos básicos, subida de imágenes con arrastrar y
  ordenar, tabla de variantes editable en línea.
- **Ofertas** — vista filtrada que permite fijar `precioOferta` y `ofertaHasta`
  a varios productos a la vez.
- **Categorías** — CRUD con orden. Al renombrar, actualizar en lote los
  productos afectados.
- **Configuración** — número de WhatsApp, nombre, logo, costo de envío.

**Alertas útiles en el inicio:** productos con `stockTotal` ≤ 3, productos
activos sin imagen, pedidos pendientes de más de 24 horas.

**Sesión:** usar cookie de sesión de Firebase Auth (`createSessionCookie` del
Admin SDK) en lugar de solo el token del cliente, para que el middleware de
Next.js pueda verificar sin ejecutar el SDK de cliente.

---

## 9. Estructura del proyecto

```
app/
  (tienda)/
    page.tsx                    # inicio: destacados y ofertas
    categoria/[slug]/page.tsx   # listado con filtros
    producto/[slug]/page.tsx    # detalle, selector de variante
    carrito/page.tsx
    buscar/page.tsx
  admin/
    layout.tsx                  # verifica claim rol=admin
    page.tsx                    # pedidos
    productos/
    productos/[id]/
    categorias/
    ofertas/
    config/
  api/
    session/route.ts            # intercambia token por cookie de sesión
components/
  tienda/                       # TarjetaProducto, SelectorVariante, BotonCarrito
  admin/
  ui/
lib/
  firebase/
    cliente.ts                  # SDK de cliente (browser)
    admin.ts                    # Admin SDK (solo servidor)
    productos.ts                # consultas del catálogo
    tipos.ts
  carrito.ts                    # store de Zustand
  whatsapp.ts
  precios.ts                    # precio efectivo, formato RD$
  texto.ts                      # slug, keywords, quitar acentos
actions/
  pedidos.ts                    # Server Actions
  productos.ts
scripts/
  hacer-admin.ts
public/
  manifest.json
```

### Variables de entorno

```bash
# .env.local

# Cliente — públicas por diseño
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Servidor — NUNCA con prefijo NEXT_PUBLIC_
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

La `FIREBASE_PRIVATE_KEY` trae saltos de línea. Al leerla:
`process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')`.

---

## 10. Plan por fases

Ir una fase a la vez con Claude Code. No pedir todo de una.

**Fase 1 — Base**
Proyecto Next.js con TypeScript y Tailwind. Los dos clientes de Firebase.
Variables de entorno. Tipos TypeScript del modelo. Security Rules desplegadas.
Script `hacer-admin.ts`.

**Fase 2 — Catálogo público**
Inicio, categoría y detalle de producto, leyendo con el Admin SDK e ISR. Datos
de prueba cargados a mano en la consola de Firebase. Sin carrito todavía.

**Fase 3 — Admin: productos**
Login con Firebase Auth, cookie de sesión, middleware. CRUD de productos y
categorías. Subida de imágenes con compresión. Gestión de variantes.

**Fase 4 — Carrito y WhatsApp**
Store de Zustand, página de carrito, Server Action de creación de pedido con
validación de precios en el servidor, enlace de WhatsApp.

**Fase 5 — Admin: pedidos**
Lista por estado, cambio de estado, transacción de descuento de stock.

**Fase 6 — Ofertas, búsqueda y detalles**
`precioOferta` con vigencia, badges de descuento, sección de ofertas, búsqueda
por `keywords`, alertas de stock bajo.

**Fase 7 — PWA y rendimiento**
Manifest, service worker, metadatos Open Graph para que los enlaces se vean
bien al compartirlos por WhatsApp.

**Fase 8 (opcional, más adelante) — Tiendas de apps**
Empaquetado con Capacitor. Solo cuando la tienda ya esté vendiendo.

> El diseño responsive **no es una fase**. Cada pantalla se construye primero
> para 375px de ancho desde la Fase 2. Adaptar después una interfaz pensada
> para escritorio cuesta más que hacerla al revés.

---

## 11. Estrategia móvil

Un solo proyecto cubre los tres escenarios. No se escribe React Native aparte.

### 11.1 Responsive (desde la Fase 2)

El tráfico esperado es mayoritariamente celular, llegando por enlaces
compartidos en WhatsApp. Se diseña **mobile-first**: las clases base de Tailwind
son las del celular y los prefijos `md:` / `lg:` ensanchan hacia escritorio.

- Rejilla de productos: 2 columnas en celular, 3 en tablet, 4 en escritorio.
  Dos columnas, no una: el usuario quiere comparar mientras baja.
- Barra de navegación inferior fija con Inicio, Categorías, Buscar y Carrito,
  con contador de artículos. En escritorio se reemplaza por menú superior.
- Área táctil mínima de 44px en cualquier botón.
- Filtros dentro de una hoja deslizable desde abajo, nunca en barra lateral.
- Botón de "Pedir por WhatsApp" fijo al fondo en la pantalla de carrito.
- Galería del producto en carrusel deslizable horizontal con puntos.
- El panel `/admin` también responsive: el dueño va a confirmar pedidos desde su
  teléfono mientras atiende, no sentado frente a una computadora. Priorizar eso
  en la vista de pedidos, aunque el editor de productos sea más cómodo en
  pantalla grande.

### 11.2 PWA instalable (Fase 7)

```json
// public/manifest.json
{
  "name": "Mi Tienda",
  "short_name": "Mi Tienda",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icon-512-maskable.png", "sizes": "512x512",
      "type": "image/png", "purpose": "maskable" }
  ]
}
```

- Usar `next-pwa` o `@serwist/next` para el service worker.
- Caché de imágenes de productos con estrategia *stale-while-revalidate*.
- **Nunca cachear** las rutas de `/admin` ni las respuestas de pedidos.
- Mostrar un aviso propio de "Instalar app" capturando `beforeinstallprompt`.
  En iOS ese evento no existe: hay que enseñar al usuario a usar Compartir →
  Agregar a inicio, con una tarjeta explicativa.

### 11.3 Play Store y App Store (opcional, después)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
npx cap add ios
```

La app carga el sitio ya desplegado en Vercel, así que al actualizar el sitio se
actualiza la app sin pasar por revisión de la tienda.

- **Google Play** acepta este enfoque sin problema.
- **App Store** rechaza apps que sean únicamente un sitio web envuelto
  (directriz 4.2). Hay que agregar algo nativo real: notificaciones push de
  ofertas (aquí Firebase Cloud Messaging encaja bien, ya que el proyecto ya está
  en Firebase), cámara para escanear códigos, o compartir nativo.
- Cuenta de desarrollador: Apple USD 99 al año, Google USD 25 una sola vez. Con
  presupuesto limitado, empezar por Android.
- Alternativa para Android sin código nativo: **TWA** con Bubblewrap, que
  publica la PWA directamente en Play Store.

---

## 12. Detalles del contexto dominicano

- Moneda **DOP**, formato `RD$1,250.00`.
- Teléfonos en formato internacional sin `+`: `1809XXXXXXX`.
- Muchas visitas llegan desde enlaces compartidos en WhatsApp, así que las
  etiquetas Open Graph del detalle de producto importan: imagen, nombre y precio
  deben salir en la vista previa del chat.
- Si más adelante entra pago en línea, el proveedor local es **Azul** (Banco
  Popular). La colección `pedidos` ya existe, así que solo se agregarían campos
  de transacción.
- Considerar ITBIS solo si el negocio factura formalmente. Si no, el precio
  mostrado es el precio final.

---

## 13. Prompt inicial para Claude Code

```
Voy a construir una tienda catálogo con Next.js 15 (App Router), TypeScript,
Tailwind y Firebase (Firestore + Storage + Auth), desplegada en Vercel.
Cierre de pedido por WhatsApp, sin pago en línea por ahora.

Lee ESPECIFICACION.md en la raíz antes de escribir código. Presta atención
especial a la sección 1.1 (separación entre SDK de cliente y Admin SDK) y a
la sección 4 (control de costos con ISR).

Empecemos SOLO por la Fase 1:
- Inicializar el proyecto con TypeScript, Tailwind y App Router
- lib/firebase/cliente.ts con el SDK de cliente (solo lectura y auth)
- lib/firebase/admin.ts con el Admin SDK, con guarda para que nunca se
  importe desde un componente cliente
- .env.local y .env.example con las variables de la sección 9
- Tipos TypeScript de Producto, Variante, Categoria, Pedido y Config
- Archivos firestore.rules y storage.rules con las reglas de la sección 3
- scripts/hacer-admin.ts para asignar el custom claim
- Layout base en español, mobile-first, sin contenido todavía

No implementes catálogo, admin ni carrito aún. Cuando termines, dime paso a
paso qué debo configurar de mi lado en la consola de Firebase.
```

---

## 14. Precios al detalle y al por mayor

Se aplica **por cantidad**, no por tipo de cliente. Así no hacen falta cuentas
de clientes ni aprobación manual de mayoristas.

### Campos

En `productos`:

- `precioMayor` — precio unitario al por mayor. `null` si no aplica.
- `cantidadMayor` — unidades mínimas para activarlo (ej. 6).

En cada item de `pedidos`:

- `tipoPrecio` — `detalle` | `oferta` | `mayor`. Deja constancia de por qué se
  cobró ese monto.

### Regla de precio

La cantidad se cuenta **por producto, sumando sus variantes**. Alguien que lleva
2 talla M, 2 talla L y 2 talla XL del mismo t-shirt llega a 6 y paga al por
mayor. Contarlo por variante sería injusto y es el caso más común del negocio.

```ts
function precioEfectivo(producto, cantidadDelProducto) {
  const ofertaVigente =
    producto.precioOferta != null &&
    (!producto.ofertaHasta || producto.ofertaHasta.toDate() > new Date());

  if (producto.precioMayor != null &&
      producto.cantidadMayor != null &&
      cantidadDelProducto >= producto.cantidadMayor) {
    return { valor: producto.precioMayor, tipo: 'mayor' };
  }

  if (ofertaVigente) {
    return { valor: producto.precioOferta, tipo: 'oferta' };
  }

  return { valor: producto.precio, tipo: 'detalle' };
}
```

**Validación al guardar en el admin:** exigir
`precioMayor < precioOferta < precio`. Si `precioMayor` quedara por encima de la
oferta, un cliente pagaría más por llevar más. Bloquearlo en el formulario evita
esa incoherencia sin tener que complicar la regla.

### En la interfaz

- **Detalle de producto:** debajo del precio, una línea del tipo
  "Desde 6 unidades: RD$800 c/u". Es lo que hace que el cliente suba la cantidad.
- **Carrito:** cuando faltan pocas unidades, mostrar
  "Agrega 2 más y pagas RD$800 c/u". Sube el ticket promedio más que cualquier
  otra cosa en la pantalla.
- **Al aplicarse:** badge "Precio por mayor" en la línea del carrito.
- El precio cambia solo al modificar la cantidad, así que recalcular el carrito
  completo en cada cambio, no solo la línea tocada.

### En el servidor

La Server Action que crea el pedido **vuelve a correr `precioEfectivo`** con los
datos leídos de Firestore. El precio que manda el navegador se ignora por
completo. Sin esto, cualquiera edita el localStorage y compra al por mayor
llevando una sola unidad.

El mensaje de WhatsApp indica el tipo de precio aplicado para que el dueño lo
vea sin abrir el panel:

```
• 6x T-Shirt Oversize (Talla M/L) — RD$800 c/u (por mayor) — RD$4,800.00
```
