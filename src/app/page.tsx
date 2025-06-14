import React from 'react';
import { Home, BookOpen, Heart, Settings as SettingsIcon, MoreHorizontal } from 'lucide-react';
import { WineList } from './components/WineList'; // Adjust the import path as necessary
export default function HomePage() {
  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 text-white p-6 flex flex-col">

        <div className="flex items-center mb-8">
          <img src="/logo.png" alt="Cellarium Logo" className="h-12 mr-4" />
          <h1 className="text-2xl font-semibold">Cellarium</h1>
        </div>
        <nav className="flex-1 space-y-4">
          
          <a href="#" className="flex items-center text-lg font-medium bg-indigo-600 px-4 py-2 rounded-lg">
            <Home className="h-5 w-5 mr-2" />
            Home
          </a>
          <a href="#" className="flex items-center text-lg font-medium hover:bg-gray-700 px-4 py-2 rounded-lg">
            <BookOpen className="h-5 w-5 mr-2" />
            My Wines
          </a>
          <a href="#" className="flex items-center text-lg font-medium hover:bg-gray-700 px-4 py-2 rounded-lg">
            <Heart className="h-5 w-5 mr-2" />
            Favorites
          </a>
          <a href="#" className="flex items-center text-lg font-medium hover:bg-gray-700 px-4 py-2 rounded-lg">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Settings
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-8 overflow-y-auto">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-900">Dashboard</h2>
          <div className="flex space-x-2">
            <button className="bg-green-400 text-white px-4 py-2 rounded-lg hover:bg-green-500">
              New Entry
            </button>
            <button className="bg-indigo-600 text-white p-2 rounded-full hover:bg-indigo-700">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Content Grid */}
       
        <div className="grid grid-cols-2 gap-6">
        <WineList />
        </div>
      </main>
    </div>
  );
}
