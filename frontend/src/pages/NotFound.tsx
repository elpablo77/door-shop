import { Link } from "react-router-dom";

export default function NotFound() {
  return <div className="rounded-card border border-border bg-surface p-8"><h1 className="text-3xl font-semibold">404</h1><p className="mt-2">Страница не найдена.</p><Link className="text-accent" to="/">На главную</Link></div>;
}
