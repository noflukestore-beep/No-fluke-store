"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { guardarConfig } from "@/actions/config";
import { formatearRD } from "@/lib/precios";
import type { Config } from "@/lib/firebase/tipos";

const entrada =
  "w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-verde/60 focus:outline-none";

export default function FormularioConfig({ config }: { config: Config }) {
  const router = useRouter();
  const [pendiente, iniciar] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);

  const [nombreTienda, setNombreTienda] = useState(config.nombreTienda);
  const [whatsapp, setWhatsapp] = useState(config.whatsapp);
  const [costoEnvio, setCostoEnvio] = useState(String(config.costoEnvio ?? 0));
  const [mensajeBienvenida, setMensajeBienvenida] = useState(
    config.mensajeBienvenida ?? "",
  );
  const [correo, setCorreo] = useState(config.correo ?? "");
  const [direccion, setDireccion] = useState(config.direccion ?? "");
  const [instagram, setInstagram] = useState(config.instagram ?? "");
  const [facebook, setFacebook] = useState(config.facebook ?? "");
  const [tiktok, setTiktok] = useState(config.tiktok ?? "");
  const [rnc, setRnc] = useState(config.rnc ?? "");
  const [impuesto, setImpuesto] = useState(
    String(config.impuestoPorcentaje ?? 0),
  );

  function enviar(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setGuardado(false);
    iniciar(async () => {
      const r = await guardarConfig({
        nombreTienda,
        whatsapp,
        costoEnvio: Number(costoEnvio) || 0,
        mensajeBienvenida,
        correo,
        direccion,
        instagram,
        facebook,
        tiktok,
        rnc,
        impuestoPorcentaje: Number(impuesto) || 0,
      });
      if (r.ok) {
        if (r.guardado) {
          setWhatsapp(r.guardado.whatsapp);
          setCostoEnvio(String(r.guardado.costoEnvio));
          setMensajeBienvenida(r.guardado.mensajeBienvenida ?? "");
          setCorreo(r.guardado.correo ?? "");
          setDireccion(r.guardado.direccion ?? "");
          setInstagram(r.guardado.instagram ?? "");
          setFacebook(r.guardado.facebook ?? "");
          setTiktok(r.guardado.tiktok ?? "");
          setRnc(r.guardado.rnc ?? "");
          setImpuesto(String(r.guardado.impuestoPorcentaje ?? 0));
        }
        setGuardado(true);
        router.refresh();
      } else {
        setError(r.error ?? "No se pudo guardar.");
      }
    });
  }

  const envio = Number(costoEnvio) || 0;

  return (
    <form onSubmit={enviar} className="max-w-2xl space-y-4">
      <Seccion titulo="Tienda">
        <Campo etiqueta="Nombre de la tienda" requerido>
          <input
            value={nombreTienda}
            onChange={(e) => setNombreTienda(e.target.value)}
            required
            className={entrada}
          />
        </Campo>
        <Campo etiqueta="Mensaje de bienvenida">
          <input
            value={mensajeBienvenida}
            onChange={(e) => setMensajeBienvenida(e.target.value)}
            placeholder="El estilo no es suerte."
            className={entrada}
          />
        </Campo>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Campo etiqueta="Correo">
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              placeholder="hola@noflukestore.com"
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="Dirección">
            <input
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Santo Domingo, RD"
              className={entrada}
            />
          </Campo>
        </div>
      </Seccion>

      <Seccion titulo="WhatsApp y envío">
        <Campo etiqueta="Número de WhatsApp" requerido>
          <input
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            inputMode="tel"
            placeholder="809 555 1234"
            className={entrada}
          />
          <span className="mt-1 block text-xs text-white/40">
            A este número llegan los pedidos del catálogo. Número dominicano
            (809, 829 u 849).
          </span>
        </Campo>
        <Campo etiqueta="Costo de envío">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
              RD$
            </span>
            <input
              type="number"
              min={0}
              step={50}
              value={costoEnvio}
              onChange={(e) => setCostoEnvio(e.target.value)}
              className={`${entrada} pl-11`}
            />
          </div>
          <span className="mt-1 block text-xs text-white/40">
            {envio <= 0
              ? "En 0 se muestra como envío gratis."
              : `Se sumará ${formatearRD(envio)} a cada pedido.`}
          </span>
        </Campo>
      </Seccion>

      <Seccion titulo="Facturación">
        <div className="flex flex-col gap-4 sm:flex-row">
          <Campo etiqueta="RNC / Cédula del negocio">
            <input
              value={rnc}
              onChange={(e) => setRnc(e.target.value)}
              placeholder="1-31-12345-6"
              className={entrada}
            />
          </Campo>
          <Campo etiqueta="ITBIS (%)">
            <input
              type="number"
              min={0}
              max={100}
              step={1}
              value={impuesto}
              onChange={(e) => setImpuesto(e.target.value)}
              className={entrada}
            />
          </Campo>
        </div>
        <span className="block text-xs text-white/40">
          Datos para las facturas. Deja el ITBIS en 0 si no facturas
          formalmente; puedes cambiarlo en cada factura.
        </span>
      </Seccion>

      <Seccion titulo="Redes sociales">
        <div className="flex flex-col gap-4 sm:flex-row">
          <RedSocial etiqueta="Instagram" valor={instagram} set={setInstagram} />
          <RedSocial etiqueta="Facebook" valor={facebook} set={setFacebook} />
          <RedSocial etiqueta="TikTok" valor={tiktok} set={setTiktok} />
        </div>
        <span className="block text-xs text-white/40">
          Solo el usuario, sin @ ni enlace completo.
        </span>
      </Seccion>

      {error && (
        <p className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-300">
          {error}
        </p>
      )}
      {guardado && !error && (
        <p className="rounded-lg border border-verde/30 bg-verde/10 px-3 py-2 text-sm font-medium text-verde">
          Cambios guardados.
        </p>
      )}

      <div className="sticky bottom-4 flex justify-end">
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-verde px-6 py-2.5 text-sm font-bold text-[#04140c] shadow-lg shadow-black/30 hover:brightness-105 disabled:opacity-60"
        >
          {pendiente ? "Guardando…" : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}

function Seccion({
  titulo,
  children,
}: {
  titulo: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/10 bg-white/[0.03] p-4 md:p-5">
      <h2 className="mb-4 font-display text-lg font-extrabold uppercase tracking-tight">
        {titulo}
      </h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Campo({
  etiqueta,
  requerido,
  children,
}: {
  etiqueta: string;
  requerido?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block flex-1">
      <span className="mb-1 block text-xs font-medium text-white/50">
        {etiqueta}
        {requerido && <span className="text-verde"> *</span>}
      </span>
      {children}
    </label>
  );
}

function RedSocial({
  etiqueta,
  valor,
  set,
}: {
  etiqueta: string;
  valor: string;
  set: (v: string) => void;
}) {
  return (
    <Campo etiqueta={etiqueta}>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-white/40">
          @
        </span>
        <input
          value={valor}
          onChange={(e) => set(e.target.value)}
          placeholder="noflukestore"
          className={`${entrada} pl-7`}
        />
      </div>
    </Campo>
  );
}
