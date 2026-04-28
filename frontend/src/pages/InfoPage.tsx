import { Link } from "react-router-dom";
import { storeInfo } from "../lib/storeInfo";

type InfoPageVariant = "default" | "privacy" | "delivery" | "contacts";

function privacyPolicyContent() {
  return (
    <>
      <p className="text-sm leading-7 text-text-secondary">
        Настоящая политика обработки персональных данных регулирует порядок работы с персональными данными, которые пользователь
        оставляет на сайте {storeInfo.brand.full} при оформлении заказа, заявки на замер, покупке в 1 клик и при обращении через
        формы обратной связи.
      </p>
      <div className="grid gap-4">
        {[
          {
            title: "Какие данные обрабатываются",
            text: "Имя, телефон, адрес, комментарий к заказу или замеру, выбранный товар, размер, цвет и предпочтительная дата выезда.",
          },
          {
            title: "Для чего используются данные",
            text: "Для связи с клиентом, согласования замера, подтверждения заказа, подготовки доставки и монтажа, а также для исполнения обязательств по договору.",
          },
          {
            title: "Как долго хранятся данные",
            text: "Данные хранятся в течение срока, необходимого для обработки обращения, исполнения заказа и соблюдения требований законодательства.",
          },
          {
            title: "Передача третьим лицам",
            text: "Данные могут передаваться только подрядчикам, участвующим в исполнении заказа, доставке, монтаже или техническом обслуживании сайта.",
          },
        ].map((item) => (
          <div key={item.title} className="rounded-card border border-border bg-bg/75 p-4">
            <div className="font-medium">{item.title}</div>
            <div className="mt-2 text-sm leading-7 text-text-secondary">{item.text}</div>
          </div>
        ))}
      </div>
      <p className="text-sm leading-7 text-text-secondary">
        Пользователь вправе запросить уточнение, актуализацию или удаление своих персональных данных, направив обращение на адрес
        электронной почты, указанный в разделе контактов.
      </p>
    </>
  );
}

function quickLinkClass() {
  return "inline-flex min-h-[44px] items-center justify-center rounded-control border border-border bg-white px-4 py-2 text-sm font-medium text-text-primary transition hover:border-accent/35 hover:bg-muted";
}

function infoRowClass(withBorder = true) {
  return `grid gap-1 px-4 py-3 sm:grid-cols-[180px_1fr] sm:gap-4 ${withBorder ? "border-t border-border" : ""}`;
}

function deliveryContent() {
  return (
    <>
      <p className="max-w-4xl text-sm leading-7 text-text-secondary">
        {storeInfo.brand.full} в Нижнем Новгороде сопровождает заказ от подбора серии до доставки, подъема и согласования монтажа.
        На странице собраны основные условия по замеру, оплате, доставке и монтажу.
      </p>

      <div className="overflow-hidden rounded-promo border border-border bg-bg/75">
        {[
          {
            title: "Замер",
            text: "В салоне можно посмотреть двери вживую и вызвать бесплатный замер. После замера заказ оформляется в магазине.",
          },
          {
            title: "Оплата",
            text: "Доступны наличный и безналичный расчет, банковская карта, QR-код (СБП) и карта рассрочки «Халва».",
          },
          {
            title: "Доставка",
            text: storeInfo.delivery.city,
          },
          {
            title: "Монтаж",
            text: "Комплект монтажных работ согласуется после замера, когда понятны размеры проема, выбранная серия и состав заказа.",
          },
        ].map((item, index) => (
          <div key={item.title} className={infoRowClass(index !== 0)}>
            <div className="text-sm font-semibold text-text-primary">{item.title}</div>
            <div className="text-sm leading-7 text-text-secondary">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-promo border border-border bg-bg/75 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Как проходит заказ</div>
          <div className="mt-4 overflow-hidden rounded-card border border-border bg-white">
            {[
              "1. Подбор модели, серии, цвета и комплектации на сайте или в салоне.",
              "2. Бесплатный замер и уточнение размеров проема.",
              "3. Оформление заказа в магазине с согласованием оплаты, доставки и монтажа.",
              "4. Доставка, подъем и дальнейшие монтажные работы по согласованной дате.",
            ].map((item, index) => (
              <div key={item} className={`px-4 py-3 text-sm text-text-secondary ${index !== 0 ? "border-t border-border" : ""}`}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-promo border border-border bg-bg/75 p-5">
          <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Что важно знать</div>
          <div className="mt-4 overflow-hidden rounded-card border border-border bg-white text-sm leading-7 text-text-secondary">
            {storeInfo.serviceNotes.map((item, index) => (
              <div key={item} className={`px-4 py-3 ${index !== 0 ? "border-t border-border" : ""}`}>
                {item}
              </div>
            ))}
            <div className="border-t border-border px-4 py-3">{storeInfo.delivery.pickup}</div>
            <div className="border-t border-border px-4 py-3">{storeInfo.schedule.showroom}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link to="/catalog" className={quickLinkClass()}>
          Перейти в каталог
        </Link>
        <Link to="/contacts" className={quickLinkClass()}>
          Контакты и схема проезда
        </Link>
      </div>
    </>
  );
}

function contactsContent() {
  return (
    <>
      <p className="max-w-4xl text-sm leading-7 text-text-secondary">
        Фирменный магазин {storeInfo.brand.full} работает в Нижнем Новгороде. На этой странице собраны адрес, телефоны, график,
        почта и условия посещения салона.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="grid gap-4">
          <div className="overflow-hidden rounded-promo border border-border bg-bg/75">
            <div className="border-b border-border px-4 py-3">
              <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Контактная информация</div>
            </div>

            <div className={infoRowClass(false)}>
              <div className="text-sm font-semibold text-text-primary">Адрес салона</div>
              <div className="text-sm leading-7 text-text-secondary">
                <div className="font-medium text-text-primary">{storeInfo.address}</div>
                <div>{storeInfo.addressNote}</div>
              </div>
            </div>

            <div className={infoRowClass()}>
              <div className="text-sm font-semibold text-text-primary">Телефоны</div>
              <div className="grid gap-2 text-sm leading-7 text-text-secondary">
                {storeInfo.phones.map((phone) => (
                  <a key={phone.href} href={phone.href} className="font-medium text-text-primary transition hover:text-accent">
                    {phone.text}
                  </a>
                ))}
              </div>
            </div>

            <div className={infoRowClass()}>
              <div className="text-sm font-semibold text-text-primary">E-mail</div>
              <a href={`mailto:${storeInfo.email}`} className="text-sm font-medium text-text-primary transition hover:text-accent">
                {storeInfo.email}
              </a>
            </div>

            <div className={infoRowClass()}>
              <div className="text-sm font-semibold text-text-primary">График</div>
              <div className="grid gap-1 text-sm leading-7 text-text-secondary">
                {storeInfo.schedule.full.map((item) => (
                  <div key={item}>{item}</div>
                ))}
                <div>{storeInfo.schedule.showroom}</div>
              </div>
            </div>

            <div className={infoRowClass()}>
              <div className="text-sm font-semibold text-text-primary">Оплата и доставка</div>
              <div className="grid gap-1 text-sm leading-7 text-text-secondary">
                <div>{storeInfo.delivery.city}</div>
                <div>{storeInfo.delivery.pickup}</div>
                <div>После замера оформление заказа выполняется в магазине.</div>
              </div>
            </div>
          </div>

          <div className="rounded-promo border border-border bg-bg/75 p-5">
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Способы оплаты</div>
            <div className="mt-4 flex flex-wrap gap-2">
              {storeInfo.payments.map((item) => (
                <div key={item} className="rounded-control border border-border bg-white px-3 py-2 text-sm text-text-secondary">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-promo border border-border bg-bg/75 shadow-soft">
            <iframe
              title="Карта магазина ВФД"
              src={storeInfo.mapUrl}
              className="h-[300px] w-full border-0 sm:h-[340px]"
              loading="lazy"
            />
          </div>

          <div className="rounded-promo border border-border bg-bg/75 p-5 text-sm leading-7 text-text-secondary">
            <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Посещение салона</div>
            <div className="mt-3">{storeInfo.schedule.showroom}</div>
            <div className="mt-2">В салоне можно посмотреть двери вживую, сравнить серии и вызвать бесплатный замер.</div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <a href={storeInfo.phones[0].href} className={quickLinkClass()}>
          Позвонить в магазин
        </a>
        <a href={`mailto:${storeInfo.email}`} className={quickLinkClass()}>
          Написать на почту
        </a>
      </div>
    </>
  );
}

export default function InfoPage({
  title,
  page = "default",
}: {
  title: string;
  page?: InfoPageVariant;
}) {
  const isPrivacyPage = page === "privacy" || title.toLowerCase().includes("политика");

  return (
    <div className="grid gap-6">
      <section className="rounded-promo border border-border bg-surface p-5 shadow-soft md:p-7">
        <div className="text-xs uppercase tracking-[0.18em] text-text-secondary">Информация</div>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{title}</h1>
        <div className="mt-5 grid gap-5">
          {isPrivacyPage ? (
            privacyPolicyContent()
          ) : page === "delivery" ? (
            deliveryContent()
          ) : page === "contacts" ? (
            contactsContent()
          ) : (
            <>
              <p className="max-w-3xl text-sm leading-7 text-text-secondary">
                На этой странице размещается информация о работе магазина: условия обслуживания, порядок оплаты, доставки, монтажа и
                дополнительные сведения для клиентов.
              </p>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "Работаем по Нижнему Новгороду и области с выездом на замер.",
                  "Помогаем с подбором серии, размера, цвета и комплектации.",
                  "Оформляем заказы с доставкой, монтажом и последующим сопровождением.",
                ].map((item) => (
                  <div key={item} className="rounded-card border border-border bg-bg/75 p-4 text-sm text-text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
