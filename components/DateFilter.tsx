'use client';

import { useState } from 'react';
import { DateRange } from '@/types/report';

interface DateFilterProps {
  onFilterChange: (dateRange: DateRange) => void;
}

export default function DateFilter({ onFilterChange }: DateFilterProps) {
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setStartDate(value);
    onFilterChange({
      startDate: value ? new Date(value) : null,
      endDate: endDate ? new Date(endDate) : null,
    });
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEndDate(value);
    onFilterChange({
      startDate: startDate ? new Date(startDate) : null,
      endDate: value ? new Date(value) : null,
    });
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    onFilterChange({ startDate: null, endDate: null });
  };

  const setToday = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    onFilterChange({
      startDate: new Date(today),
      endDate: new Date(today),
    });
  };

  const setThisWeek = () => {
    const now = new Date();
    const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const start = weekStart.toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      startDate: new Date(start),
      endDate: new Date(end),
    });
  };

  const setThisMonth = () => {
    const now = new Date();
    const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const start = monthStart.toISOString().split('T')[0];
    const end = now.toISOString().split('T')[0];
    setStartDate(start);
    setEndDate(end);
    onFilterChange({
      startDate: new Date(start),
      endDate: new Date(end),
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">Filter Tanggal</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Mulai
          </label>
          <input
            type="date"
            value={startDate}
            onChange={handleStartDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tanggal Akhir
          </label>
          <input
            type="date"
            value={endDate}
            onChange={handleEndDateChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={setToday}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Hari Ini
        </button>
        <button
          onClick={setThisWeek}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          7 Hari Terakhir
        </button>
        <button
          onClick={setThisMonth}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
        >
          30 Hari Terakhir
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
