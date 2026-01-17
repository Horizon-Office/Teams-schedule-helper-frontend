import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { OrderData } from '@/app/order/components/types';

// Використовуємо той самий storage
class OrdersStorage {
  private static instance: OrdersStorage;
  private orders: OrderData[] = [];

  private constructor() {}

  static getInstance(): OrdersStorage {
    if (!OrdersStorage.instance) {
      OrdersStorage.instance = new OrdersStorage();
    }
    return OrdersStorage.instance;
  }

  getAll() {
    return this.orders;
  }

  getById(id: string) {
    return this.orders.find(o => o.id === id);
  }

  add(order: OrderData) {
    this.orders.push(order);
    console.log('Order added:', order.id, order.fileName);
    console.log('Total orders:', this.orders.length);
    return order;
  }

  update(id: string, updatedOrder: any) {
    const index = this.orders.findIndex(o => o.id === id);
    if (index !== -1) {
      this.orders[index] = { ...this.orders[index], ...updatedOrder };
      return this.orders[index];
    }
    return null;
  }
}

const storage = OrdersStorage.getInstance();

export async function GET() {
  const orders = storage.getAll();
  console.log('Returning orders:', orders.length);
  return NextResponse.json(orders);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const newOrder: OrderData = {
      id: uuidv4(),
      fileName: body.name,
      uploadDate: new Date(),
      data: body.content,
      columns: body.columns,
    };

    const savedOrder = storage.add(newOrder);
    
    console.log('Order created successfully:', savedOrder.id);
    
    return NextResponse.json(savedOrder, { status: 201 });
  } catch (error) {
    console.error('Error saving order:', error);
    return NextResponse.json(
      { error: 'Failed to save order' },
      { status: 500 }
    );
  }
}