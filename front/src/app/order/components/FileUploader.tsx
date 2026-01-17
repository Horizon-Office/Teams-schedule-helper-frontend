"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { OrderFile } from './types';

interface FileUploaderProps {
  onFileUploaded: (file: OrderFile) => void;
}

export default function FileUploader({ onFileUploaded }: FileUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = async (file: File) => {
    setIsLoading(true);
    setError(null);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Перший рядок - заголовки стовпців
      const columns = jsonData[0] as string[];
      const data = jsonData.slice(1);

      const orderFile: OrderFile = {
        name: file.name.replace('.xlsx', ''),
        content: data,
        columns: columns,
      };

      onFileUploaded(orderFile);
    } catch (err) {
      console.error('Error parsing file:', err);
      setError('Помилка при читанні файлу. Перевірте формат файлу.');
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
          file.name.endsWith('.xlsx')) {
        processFile(file);
      } else {
        setError('Будь ласка, завантажте файл у форматі .xlsx');
      }
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxFiles: 1,
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-colors duration-200
          ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
          ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isLoading} />
        
        {isLoading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Обробка файлу...</p>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <svg
                className="w-12 h-12 mx-auto text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 48 48"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                />
              </svg>
            </div>
            
            {isDragActive ? (
              <p className="text-blue-500 font-medium">Відпустіть файл для завантаження...</p>
            ) : (
              <>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium text-blue-600">Натисніть для вибору</span> або перетягніть файл сюди
                </p>
                <p className="text-gray-500 text-sm">Підтримуються лише файли .xlsx</p>
                <p className="text-gray-500 text-sm mt-1">(наприклад: 121-24.xlsx)</p>
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}