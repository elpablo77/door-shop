# Door Shop

Door Shop - учебный проект интернет-магазина дверей на микросервисной архитектуре.

Состав проекта:
- `auth-service` - регистрация, вход и JWT
- `catalog-service` - каталог, фильтры, серии, варианты и подбор двери
- `order-service` - оформление заказов, заявки и статусы
- `frontend` - витрина, карточка товара, корзина, оформление и личный кабинет

## Быстрый старт
1. Создайте файл `.env`.
2. Укажите минимум:
   - `AUTH_DB_PASSWORD`
   - `CATALOG_DB_PASSWORD`
   - `ORDERS_DB_PASSWORD`
   - `JWT_SECRET`
3. Запустите проект:
```bash
docker compose up --build
```
4. Витрина будет доступна по адресу `http://localhost:18080`.

Если нужен другой порт для frontend, добавьте в `.env` переменную `FRONTEND_PORT`.

## Проверка
Полная проверка:
```bash
./scripts/verify.sh
```

Быстрая проверка после запуска:
```bash
./scripts/smoke.sh
```

Скрипт проверяет:
- `POST /api/auth/login`
- `GET /api/catalog/doors`
- `GET /api/catalog/suggest?q=at`
- `GET /api/catalog/series`
- `POST /api/catalog/admin/reseed`

## Основные возможности
- регистрация и вход пользователя
- каталог дверей с фильтрацией и поисковыми подсказками
- карточка товара с выбором размера и цвета
- подбор двери по сценарию использования
- корзина и оформление заказа
- история заказов в личном кабинете
- админская часть для управления каталогом, заказами и заявками

## Основные API
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/catalog/doors`
- `GET /api/catalog/doors/{id}`
- `GET /api/catalog/products/{productKey}/variants`
- `GET /api/catalog/series`
- `GET /api/catalog/filters`
- `GET /api/catalog/suggest?q=...`
- `POST /api/catalog/finder/recommendations`
- `POST /api/orders`
- `GET /api/orders/my`
- `GET /api/orders`
- `PATCH /api/orders/{id}/status`
- `POST /api/leads`
- `GET /api/leads`

## Стартовые данные
При пустой базе каталог заполняется автоматически. В проекте есть межкомнатные и входные двери с сериями:
- `ATUM`
- `ATUM_PRO`
- `URBAN`
- `EMALEX`
- `BASIC`
- `ENAMEL`
- `SOLO_AVANT`
- `CLASSIC_ART`
- `VFD_METAL`
- `DIVISION`
- `THERMAL_VFD`
- `ECONOM_VFD`

Для каждой модели создаются варианты размеров `600x2000`, `700x2000`, `800x2000` и `900x2000`.

Для локальной проверки auth-service создает две учетные записи:
- `admin@test.com` / `password`
- `user1@test.com` / `password123`

## Локальный запуск без Docker
Backend:
```bash
cd auth-service
./gradlew bootRun
```

```bash
cd catalog-service
./gradlew bootRun
```

```bash
cd order-service
./gradlew bootRun
```

Frontend:
```bash
cd frontend
npm ci
npm run dev
```
