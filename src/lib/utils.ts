import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function downloadXLSX(data: any[], filename: string) {
  if (!data || data.length === 0) return;

  // Create worksheet from JSON
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook and add the worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  // Write the workbook to a buffer
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

  // Create a blob from the buffer
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

  // Trigger the download using file-saver
  saveAs(blob, filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`);
}
