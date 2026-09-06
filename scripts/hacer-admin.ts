/**
 * Asigna el custom claim { rol: 'admin' } a un usuario de Firebase Auth.
 * Ver sección 3.1 de ESPECIFICACION.md. Se corre una sola vez por cada admin,
 * desde la máquina local.
 *
 *   npm run hacer-admin -- <UID>
 *   npm run hacer-admin -- --email correo@ejemplo.com
 *
 * Lee las credenciales del Admin SDK desde .env.local
 * (FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY).
 *
 * El claim aparece en el token cuando el usuario vuelve a iniciar sesión, o
 * llamando getIdToken(true) para forzar la actualización.
 */
import { config } from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

config({ path: ".env.local" });

function abortar(mensaje: string): never {
  console.error(`\n  ✗ ${mensaje}\n`);
  process.exit(1);
}

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  abortar(
    "Faltan FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL o FIREBASE_PRIVATE_KEY en .env.local",
  );
}

const args = process.argv.slice(2);
const emailFlag = args.indexOf("--email");
const email = emailFlag !== -1 ? args[emailFlag + 1] : undefined;
const uidArg = args.find((a) => !a.startsWith("--") && a !== email);

if (!email && !uidArg) {
  abortar("Uso: npm run hacer-admin -- <UID>   |   npm run hacer-admin -- --email correo@ejemplo.com");
}

const app = getApps().length
  ? getApps()[0]!
  : initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });

const auth = getAuth(app);

async function main() {
  const usuario = email
    ? await auth.getUserByEmail(email)
    : await auth.getUser(uidArg!);

  await auth.setCustomUserClaims(usuario.uid, { rol: "admin" });

  console.log(
    `\n  ✓ ${usuario.email ?? usuario.uid} ahora tiene rol=admin.` +
      `\n    Debe cerrar y volver a iniciar sesión para que el claim tome efecto.\n`,
  );
}

main().catch((error) => abortar(error instanceof Error ? error.message : String(error)));
