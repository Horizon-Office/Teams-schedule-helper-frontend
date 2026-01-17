"use client";

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import OrderTable from '../components/OrderTable';
import { OrderData } from '../components/types';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any[]>([]);

  // Отримуємо orderId з параметрів
  const orderId = params?.orderId as string;

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    }
  }, [orderId]);

  const fetchOrder = async () => {
    if (!orderId) return;
    
    try {
      const response = await fetch(`/api/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
        setEditedData(data.data);
      } else {
        console.error('Order not found');
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: editedData }),
      });

      if (response.ok) {
        const updatedOrder = await response.json();
        setOrder(updatedOrder);
        setIsEditing(false);
        alert('Зміни збережено успішно!');
      }
    } catch (error) {
      console.error('Error saving order:', error);
      alert('Помилка при збереженні змін');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Наряд не знайдено</h1>
          <p className="text-gray-600 mb-4">ID: {orderId}</p>
          <button
            onClick={() => router.push('/order')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Повернутись до списку
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{order.fileName}</h1>
            <p className="text-gray-600">
              Завантажено: {new Date(order.uploadDate).toLocaleDateString('uk-UA')}
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/order')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Назад
            </button>
            
            {isEditing ? (
              <>
                <button
                  onClick={() => {
                    setEditedData(order.data);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Скасувати
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Зберегти зміни
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Редагувати
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">
                Рядків: {order.data.length} | Стовпців: {order.columns.length}
              </span>
            </div>
            {isEditing && (
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                Режим редагування
              </span>
            )}
          </div>
        </div>
        
        <OrderTable
          data={isEditing ? editedData : order.data}
          columns={order.columns}
          isEditing={isEditing}
          onDataChange={setEditedData}
        />
      </div>
    </div>
  );
}