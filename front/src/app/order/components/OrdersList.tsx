"use client";

import { OrderData } from './types';

interface OrdersListProps {
  orders: OrderData[];
  onOrderClick: (orderId: string) => void;
}

export default function OrdersList({ orders, onOrderClick }: OrdersListProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {orders.map((order) => (
        <div
          key={order.id}
          onClick={() => onOrderClick(order.id)}
          className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600">
              {order.fileName}
            </h3>
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {order.data.length} рядків
            </span>
          </div>
          
          <div className="text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Завантажено: {formatDate(order.uploadDate)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-3">
            {order.columns.slice(0, 3).map((column, index) => (
              <span
                key={index}
                className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded"
              >
                {column}
              </span>
            ))}
            {order.columns.length > 3 && (
              <span className="text-xs text-gray-500">
                +{order.columns.length - 3} ще
              </span>
            )}
          </div>
          
          <div className="flex justify-end">
            <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Відкрити →
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}