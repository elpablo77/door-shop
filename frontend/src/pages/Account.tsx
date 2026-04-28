import { FormEvent, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Badge from "../components/Badge";
import Button from "../components/Button";
import Input from "../components/Input";
import { ApiError } from "../lib/api";
import { storeInfo } from "../lib/storeInfo";
import { useAuth } from "../state/auth";

export default function Account() {
  const location = useLocation();
  const mode = location.pathname.includes("register") ? "register" : "login";
  const nav = useNavigate();
  const { user, loading, login, logout, register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  const title = useMemo(() => (mode === "login" ? "Вход в личный кабинет" : "Создание аккаунта"), [mode]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr("");

    if (!email.includes("@")) {
      setErr("Укажите корректный e-mail.");
      return;
    }

    if (password.length < 6) {
      setErr("Пароль должен содержать не меньше 6 символов.");
      return;
    }

    if (mode === "register" && password !== confirmPassword) {
      setErr("Пароли не совпадают.");
      return;
    }

    setSubmitting(true);
    try {
      if (mode === "login") await login(email, password);
      else await register(email, password);
      nav("/account");
    } catch (e) {
      const ae = e as ApiError;
      setErr(ae.error || "Не удалось выполнить авторизацию.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-64 animate-pulse rounded-promo border border-border bg-muted" />;
  }

  if (user) {
    return (
      <div className="grid gap-6">
        <section className="grid gap-5 rounded-promo border border-border bg-surface p-6 shadow-soft md:grid-cols-[1.15fr_0.85fr] md:p-8">
          <div className="space-y-4">
            <Badge>{user.role === "ADMIN" ? "Администратор" : "Клиент"}</Badge>
            <div>
              <h1 className="text-3xl font-semibold">Личный кабинет</h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-text-secondary">
                Здесь можно перейти к заказам, вернуться в каталог, открыть корзину и быстро перейти в нужный раздел сайта.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Link to="/catalog" className="rounded-card border border-border bg-bg/80 p-4 transition hover:shadow-soft">
                <div className="font-medium">Каталог</div>
                <div className="mt-1 text-sm text-text-secondary">Выбрать двери и серии</div>
              </Link>
              <Link to="/account/orders" className="rounded-card border border-border bg-bg/80 p-4 transition hover:shadow-soft">
                <div className="font-medium">Мои заказы</div>
                <div className="mt-1 text-sm text-text-secondary">Статусы и история</div>
              </Link>
              <Link to="/cart" className="rounded-card border border-border bg-bg/80 p-4 transition hover:shadow-soft">
                <div className="font-medium">Корзина</div>
                <div className="mt-1 text-sm text-text-secondary">Проверить выбранные позиции</div>
              </Link>
              <Link to={user.role === "ADMIN" ? "/admin" : "/finder"} className="rounded-card border border-border bg-bg/80 p-4 transition hover:shadow-soft">
                <div className="font-medium">{user.role === "ADMIN" ? "Админ-панель" : "Подбор двери"}</div>
                <div className="mt-1 text-sm text-text-secondary">
                  {user.role === "ADMIN" ? "Управление каталогом и заказами" : "Подобрать дверь по параметрам"}
                </div>
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-card border border-border bg-bg/80 p-5">
              <div className="text-sm text-text-secondary">Аккаунт</div>
              <div className="mt-2 text-lg font-semibold">{user.email}</div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge>{user.role === "ADMIN" ? "Полный доступ" : "Личный кабинет"}</Badge>
              </div>
            </div>

            <div className="rounded-card border border-border bg-bg/80 p-5">
              <div className="font-medium">Быстрые действия</div>
              <div className="mt-3 grid gap-2 text-sm text-text-secondary">
                <div>Открыть историю заказов и статусы</div>
                <div>Вернуться в каталог и продолжить подбор</div>
                <div>Завершить оформление заказа из корзины</div>
              </div>
            </div>

            <Button variant="secondary" onClick={logout}>
              Выйти из аккаунта
            </Button>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_480px]">
      <section className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="inline-flex items-center rounded-full border border-border bg-muted px-3 py-1 text-xs uppercase tracking-[0.18em] text-text-secondary">
          Кабинет {storeInfo.brand.short}
        </div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
          После входа доступны история заказов, корзина и быстрое оформление покупки.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-card border border-border bg-bg/80 p-5">
            <div className="font-medium">После входа доступно</div>
            <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
              <li>История и статусы заказов</li>
              <li>Оформление заказа без повторного входа</li>
              <li>Быстрый переход к каталогу и подбору</li>
            </ul>
          </div>
          <div className="rounded-card border border-border bg-bg/80 p-5">
            <div className="font-medium">Что важно</div>
            <ul className="mt-3 grid gap-2 text-sm text-text-secondary">
              <li>Для заказа нужен аккаунт с корректным e-mail.</li>
              <li>После входа статус заказа доступен в личном кабинете.</li>
              <li>Администратор работает через отдельную учетную запись.</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="rounded-promo border border-border bg-surface p-6 shadow-soft md:p-8">
        <div className="flex gap-2 rounded-full border border-border bg-muted p-1">
          <Link
            to="/account/login"
            className={`flex-1 rounded-full px-4 py-2 text-center text-sm transition ${mode === "login" ? "bg-surface text-text-primary shadow-soft" : "text-text-secondary"}`}
          >
            Вход
          </Link>
          <Link
            to="/account/register"
            className={`flex-1 rounded-full px-4 py-2 text-center text-sm transition ${mode === "register" ? "bg-surface text-text-primary shadow-soft" : "text-text-secondary"}`}
          >
            Регистрация
          </Link>
        </div>

        <form onSubmit={submit} className="mt-6 grid gap-3">
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" autoComplete="email" />
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          {mode === "register" ? (
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Повторите пароль"
              autoComplete="new-password"
            />
          ) : null}

          {err ? <div className="rounded-card border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div> : null}

          <Button type="submit" disabled={submitting}>
            {submitting ? "Обрабатываем..." : mode === "login" ? "Войти в кабинет" : "Создать аккаунт"}
          </Button>
        </form>

        <div className="mt-4 text-sm text-text-secondary">
          {mode === "login" ? "Нет аккаунта?" : "Уже есть аккаунт?"}{" "}
          <Link to={mode === "login" ? "/account/register" : "/account/login"} className="font-medium text-accent">
            {mode === "login" ? "Зарегистрироваться" : "Войти"}
          </Link>
        </div>
      </section>
    </div>
  );
}
