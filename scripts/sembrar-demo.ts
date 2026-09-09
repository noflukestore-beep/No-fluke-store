/**
 * Siembra Firestore con datos de ejemplo para la Fase 2.
 *
 *   npm run sembrar
 *
 * ⚠️ BORRA todo lo que haya en las colecciones `productos` y `categorias`
 * y reescribe `config/tienda`. Es un script de demo, no de producción.
 *
 * Lee las credenciales del Admin SDK desde .env.local.
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { generarKeywords, generarSlug } from "../lib/texto";
import {
  CATEGORIAS_SEMILLA,
  CONFIG_SEMILLA,
  PRODUCTOS_SEMILLA,
  type ProductoSemilla,
} from "./datos-semilla";

config({ path: ".env.local" });

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error(
    "\n  ✗ Faltan FIREBASE_PROJECT_ID / FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY en .env.local\n",
  );
  process.exit(1);
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

async function vaciarColeccion(nombre: string) {
  const snap = await db.collection(nombre).get();
  if (snap.empty) return 0;
  const lote = db.batch();
  snap.docs.forEach((d) => lote.delete(d.ref));
  await lote.commit();
  return snap.size;
}

function stockDeVariantes(
  p: ProductoSemilla,
  totalVariantes: number,
): number[] {
  if (p.stockObjetivo === 0) return Array(totalVariantes).fill(0);
  if (typeof p.stockObjetivo === "number") {
    const base = Math.floor(p.stockObjetivo / totalVariantes);
    const resto = p.stockObjetivo - base * totalVariantes;
    return Array.from({ length: totalVariantes }, (_, i) =>
      i < resto ? base + 1 : base,
    );
  }
  return Array.from(
    { length: totalVariantes },
    (_, i) => 6 + ((i * 7) % 14),
  );
}

async function main() {
  console.log("\n  Sembrando No Fluke Store…\n");

  const borradosProd = await vaciarColeccion("productos");
  const borradasCat = await vaciarColeccion("categorias");
  console.log(
    `  Limpieza: ${borradosProd} productos y ${borradasCat} categorías borrados.`,
  );

  // --- Categorías ---
  const mapaCat = new Map<
    string,
    { id: string; nombre: string; slug: string }
  >();
  let orden = 1;
  for (const c of CATEGORIAS_SEMILLA) {
    const ref = db.collection("categorias").doc();
    await ref.set({
      nombre: c.nombre,
      slug: c.slug,
      descripcion: c.descripcion,
      imagenUrl: null,
      icono: c.icono,
      orden: orden++,
      activa: true,
      creadoEn: Timestamp.now(),
    });
    mapaCat.set(c.slug, { id: ref.id, nombre: c.nombre, slug: c.slug });
  }
  console.log(`  ${mapaCat.size} categorías creadas.`);

  // --- Productos ---
  let n = 1;
  for (const p of PRODUCTOS_SEMILLA) {
    const cat = mapaCat.get(p.categoriaSlug);
    if (!cat) throw new Error(`Categoría desconocida: ${p.categoriaSlug}`);

    const skuBase = `NF-${String(n).padStart(4, "0")}`;
    const pares: Array<{ color: string; talla: string }> = [];
    for (const color of p.colores) {
      for (const talla of p.tallas) pares.push({ color, talla });
    }
    const stocks = stockDeVariantes(p, pares.length);

    const variantes = pares.map((par, i) => ({
      id: `v${i + 1}`,
      talla: par.talla,
      color: par.color,
      sku: `${skuBase}-${generarSlug(`${par.talla}-${par.color}`).toUpperCase()}`,
      stock: stocks[i],
      precioExtra: 0,
      activo: true,
    }));
    const stockTotal = variantes.reduce((s, v) => s + v.stock, 0);

    await db.collection("productos").add({
      nombre: p.nombre,
      slug: p.slug,
      descripcion: p.descripcion,
      marca: p.marca,
      sku: skuBase,
      codigoBarra: null,
      genero: p.genero,

      categoriaId: cat.id,
      categoriaNombre: cat.nombre,
      categoriaSlug: cat.slug,

      precioCompra: Math.round(p.precio * 0.58),
      precio: p.precio,
      precioOferta: p.precioOferta ?? null,
      tieneOferta: p.precioOferta != null,
      ofertaHasta: null,
      precioMayor: p.precioMayor ?? null,
      cantidadMayor: p.cantidadMayor ?? null,

      activo: true,
      destacado: p.destacado ?? false,
      nuevoIngreso: p.nuevoIngreso ?? false,

      variantes,
      imagenes: [],
      keywords: generarKeywords(p.nombre, p.marca, cat.nombre),

      stockTotal,
      stockMinimo: 3,

      // Escalonadas para que `orderBy("creadoEn","desc")` sea estable.
      creadoEn: Timestamp.fromMillis(Date.now() - n * 60_000),
      actualizadoEn: Timestamp.now(),
    });
    n++;
  }
  console.log(`  ${PRODUCTOS_SEMILLA.length} productos creados.`);

  // --- Config ---
  await db.doc("config/tienda").set({
    ...CONFIG_SEMILLA,
    fechaActualizacion: Timestamp.now(),
  });
  console.log("  config/tienda escrito.");

  console.log("\n  ✓ Listo. Abre /tienda para verlo.\n");
}

main().catch((e) => {
  console.error("\n  ✗", e instanceof Error ? e.message : e, "\n");
  process.exit(1);
});
