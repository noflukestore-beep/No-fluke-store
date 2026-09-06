/**
 * Utilidades de texto: slugs y tokens de búsqueda.
 * Ver secciones 2 y 5 de ESPECIFICACION.md.
 */

/** "Camión" -> "Camion". Descompone y elimina los diacríticos. */
export function quitarAcentos(texto: string): string {
  return texto.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

/**
 * "T-Shirt Oversize Negro" -> "t-shirt-oversize-negro".
 * Sin acentos, minúsculas, solo `a-z0-9` y guiones simples.
 */
export function generarSlug(texto: string): string {
  return quitarAcentos(texto)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Tokens para el arreglo `keywords` del producto (búsqueda con
 * `array-contains`). Se regenera desde `nombre` y `marca` al guardar.
 *
 * Normaliza quitando acentos y guiones, y genera prefijos desde 2 caracteres.
 * "T-Shirt Oversize Negro" + "Nike" ->
 *   ["ts","tsh","tshi","tshir","tshirt","ov","ove",...,"oversize",
 *    "ne","neg","negr","negro","ni","nik","nike"]
 *
 * Limitación conocida: solo encuentra prefijos de palabras completas.
 * Buscar "shirt" no encuentra "t-shirt".
 */
export function generarKeywords(
  ...campos: Array<string | null | undefined>
): string[] {
  const palabras = quitarAcentos(campos.filter(Boolean).join(" ").toLowerCase())
    .replace(/-/g, "") // "t-shirt" -> "tshirt"
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((p) => p.length >= 2);

  const tokens = new Set<string>();
  for (const palabra of palabras) {
    for (let i = 2; i <= palabra.length; i++) {
      tokens.add(palabra.slice(0, i));
    }
  }
  return [...tokens];
}
