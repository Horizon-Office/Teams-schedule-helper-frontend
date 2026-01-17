// types/order.ts
export interface OrderMeta {
  slug: string;      // 121-24
  title: string;     // 121-24
  createdAt: string;
}

export interface OrderData {
  meta: OrderMeta;
  rows: any[];
}