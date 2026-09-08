export default function EnConstruccion({
  titulo,
  descripcion,
  fase,
}: {
  titulo: string;
  descripcion: string;
  fase: string;
}) {
  return (
    <div>
      <h1 className="font-display text-2xl font-extrabold tracking-tight md:text-3xl">
        {titulo}
      </h1>
      <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-white/[0.03] p-10 text-center">
        <p className="text-sm text-white/60">{descripcion}</p>
        <span className="mt-3 inline-block rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/50">
          Se construye en la {fase}
        </span>
      </div>
    </div>
  );
}
