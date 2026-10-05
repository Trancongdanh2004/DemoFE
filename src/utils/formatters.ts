import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { FileType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateTimeParts(dateString: string): { date: string; time: string } {
  if (!dateString) return { date: '—', time: '—' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { date: dateString, time: '' };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const day = pad(date.getDate());
  const month = pad(date.getMonth() + 1);
  const year = date.getFullYear();
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());

  return {
    date: `${day}/${month}/${year}`,
    time: `${hours}:${minutes}`,
  };
}

export function getFileTypeConfig(type: FileType) {
  switch (type) {
    case 'pdf':
      return {
        label: 'PDF',
        bgColor: 'bg-rose-50 text-rose-700 border-rose-200',
        badgeColor: 'bg-rose-600',
        iconBg: 'bg-rose-100 text-rose-600',
        borderColor: 'hover:border-rose-400',
      };
    case 'word':
      return {
        label: 'Word',
        bgColor: 'bg-blue-50 text-blue-700 border-blue-200',
        badgeColor: 'bg-blue-600',
        iconBg: 'bg-blue-100 text-blue-600',
        borderColor: 'hover:border-blue-400',
      };
    case 'excel':
      return {
        label: 'Excel',
        bgColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        badgeColor: 'bg-emerald-600',
        iconBg: 'bg-emerald-100 text-emerald-600',
        borderColor: 'hover:border-emerald-400',
      };
    default:
      return {
        label: 'File',
        bgColor: 'bg-slate-50 text-slate-700 border-slate-200',
        badgeColor: 'bg-slate-600',
        iconBg: 'bg-slate-100 text-slate-600',
        borderColor: 'hover:border-slate-400',
      };
  }
}
