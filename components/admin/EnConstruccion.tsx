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
      <h1 className="text-xl font-bold tracking-tight md:text-2xl">{titulo}</h1>
      <div className="mt-6 rounded-xl border border-dashed border-neutral-300 bg-white p-10 text-center">
        <p className="text-sm text-neutral-600">{descripcion}</p>
        <span className="mt-3 inline-block rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-500">
          Se construye en la {fase}
        </span>
      </div>
    </div>
  );
}
