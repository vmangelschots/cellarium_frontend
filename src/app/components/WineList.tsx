// src/components/WineList.tsx
'use client';

import useSWR from 'swr';
import type { FC } from 'react';

type Wine = {
  id: number;
  name: string;
  region: string;
  year: number;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export const WineList: FC = () => {
  const { data, error } = useSWR<Wine[]>('http://localhost:8000/api/wines/', fetcher, {
    refreshInterval: 30000, // refetch every 30s
  });

  if (error) return <p className="text-red-500">Failed to load wines.</p>;
  if (!data) return <p className="text-gray-500">Loading…</p>;

  return (
    <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((wine) => (
        <div key={wine.id} className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-2 text-gray-900">{wine.name} - {wine.vintage}
        </h3>
        <p className="text-gray-700 mb-4">{wine.notes}</p>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
          View
        </button>
        </div>
      ))}
    </ul>
  );
};
