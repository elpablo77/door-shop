export const ORDER_STATUS_RU: Record<string, string> = {
  PROCESSING: "Заказ в обработке",
  ACCEPTED: "Заказ принят",
  AWAITING_STOCK: "Ожидается поступление на склад",
  PICKING: "Собираем заказ",
  DELIVERY: "Доставка",
  COMPLETED: "Заказ выполнен",
};

export const ORDER_STATUS_STEPS = [
  "PROCESSING",
  "ACCEPTED",
  "AWAITING_STOCK",
  "PICKING",
  "DELIVERY",
  "COMPLETED",
] as const;

export function mapOrderStatus(status: string): string {
  return ORDER_STATUS_RU[status] || status;
}
