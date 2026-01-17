import { NextRequest, NextResponse } from 'next/server';

// Спільне сховище в пам'яті
let ordersStorage: any[] = [];

// Додаємо функціонал для покращення зберігання
class OrdersStorage {
  private static instance: OrdersStorage;
  private orders: any[] = [];

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

  add(order: any) {
    this.orders.push(order);
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

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    console.log('Fetching order with ID:', params.orderId);
    console.log('All orders:', storage.getAll().map(o => ({ id: o.id, name: o.fileName })));
    
    const order = storage.getById(params.orderId);
    
    if (!order) {
      console.log('Order not found');
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const updatedData = await request.json();
    
    const order = storage.update(params.orderId, updatedData);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}