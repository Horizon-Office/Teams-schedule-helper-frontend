"use client";

import { useState } from 'react';

interface OrderTableProps {
  data: any[][];
  columns: string[];
  isEditing: boolean;
  onDataChange: (data: any[][]) => void;
}

export default function OrderTable({
  data,
  columns,
  isEditing,
  onDataChange,
}: OrderTableProps) {
  const handleCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    if (!newData[rowIndex]) newData[rowIndex] = [];
    newData[rowIndex][colIndex] = value;
    onDataChange(newData);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              №
            </th>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {rowIndex + 1}
              </td>
              {columns.map((_, colIndex) => (
                <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {isEditing ? (
                    <input
                      type="text"
                      value={row[colIndex] || ''}
                      onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span>{row[colIndex] || '-'}</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}