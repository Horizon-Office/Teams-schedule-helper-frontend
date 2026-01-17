export interface OrderData {
  id: string;
  fileName: string;
  uploadDate: Date;
  data: any[]; // Дані з Excel файлу
  columns: string[];
}

export interface OrderFile {
  name: string;
  content: any[];
  columns: string[];
}