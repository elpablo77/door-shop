import Button from "./Button";

export default function Pagination({
  page,
  totalPages,
  onPage,
}: {
  page: number;
  totalPages: number;
  onPage: (p: number) => void;
}) {
  const prev = () => onPage(Math.max(0, page - 1));
  const next = () => onPage(Math.min(totalPages - 1, page + 1));

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      <Button variant="ghost" onClick={prev} disabled={page <= 0}>
        ←
      </Button>
      <div className="rounded-xl border border-zinc-800 px-3 py-2 text-sm text-zinc-300">
        {page + 1} / {Math.max(1, totalPages)}
      </div>
      <Button variant="ghost" onClick={next} disabled={page >= totalPages - 1}>
        →
      </Button>
    </div>
  );
}
