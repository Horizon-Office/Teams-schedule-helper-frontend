"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FileUploader from './components/FileUploader';
import OrdersList from './components/OrdersList';
import { OrderFile, OrderData } from './components/types';

export default function OrderPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [showUploader, setShowUploader] = useState(false);

  // Завантаження нарядів при старті
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Помилка завантаження нарядів:', error);
    }
  };

  const handleFileUploaded = async (file: OrderFile) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(file),
      });

      if (response.ok) {
        const newOrder = await response.json();
        setOrders([...orders, newOrder]);
        setShowUploader(false);
        
        // Перенаправлення на сторінку редагування
        router.push(`/order/${newOrder.id}`);
      }
    } catch (error) {
      console.error('Помилка збереження файлу:', error);
    }
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/order/${orderId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Сторінка нарядів</h1>
        <p className="text-gray-600">Керування нарядами розкладу</p>
      </div>

      {/* Меню нарядів */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-4 items-center mb-6">
          <button
            onClick={() => setShowUploader(!showUploader)}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            {showUploader ? 'Скасувати' : '+ Додати наряд'}
          </button>
          
          {orders.length > 0 && (
            <div className="text-gray-600">
              <span className="font-medium">{orders.length}</span> нарядів завантажено
            </div>
          )}
        </div>

        {showUploader && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Завантаження нового наряду</h2>
            <FileUploader onFileUploaded={handleFileUploaded} />
          </div>
        )}
      </div>

      {/* Список нарядів */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Завантажені наряди</h2>
        {orders.length > 0 ? (
          <OrdersList orders={orders} onOrderClick={handleOrderClick} />
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 48 48"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l3-3m0 0l3 3m-3-3v15m3-3l3 3m0 0l3-3m-3 3v-6"
              />
            </svg>
            <p className="text-gray-500">Немає завантажених нарядів</p>
            <p className="text-gray-400 text-sm mt-1">
              Натисніть "Додати наряд", щоб почати
            </p>
          </div>
        )}
      </div>
    </div>
  );
}