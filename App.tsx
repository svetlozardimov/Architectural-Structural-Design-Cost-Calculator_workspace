
import React, { useState } from 'react';
import { useTheme } from './hooks/useTheme';
import Header from './components/Header';
import StructuralApp from './components/StructuralApp';
import ArchitecturalApp from './components/ArchitecturalApp';
import Card from './components/common/Card';
import { TableIcon } from './components/icons';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [view, setView] = useState<'home' | 'structural' | 'architectural'>('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="min-h-screen bg-bunker-50 dark:bg-bunker-950 text-bunker-800 dark:text-bunker-200 font-sans transition-colors duration-300">
      <Header 
        theme={theme} 
        toggleTheme={toggleTheme} 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
        showSidebarToggle={view !== 'home'}
      />

      <main className="container mx-auto px-4 py-8">
        {view === 'home' && (
          <div className="max-w-4xl mx-auto animate-fade-in">
             <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-bunker-800 dark:text-bunker-100 mb-4">Изберете калкулатор</h2>
                <p className="text-bunker-500 dark:text-bunker-400">Изберете специалността, за която искате да изчислите минималната себестойност.</p>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div 
                    onClick={() => setView('architectural')}
                    className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
                >
                    <Card className="h-full border-2 border-transparent hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-bunker-900">
                        <div className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-bunker-800 dark:text-bunker-100 mb-3">Част Архитектура</h3>
                            <p className="text-bunker-500 dark:text-bunker-400 text-sm mb-6 flex-grow">
                                Калкулатор за архитектурно проектиране на нови сгради, ПУП и работа на часова ставка.
                            </p>
                            <span className="text-blue-600 dark:text-blue-400 font-semibold group-hover:underline">Отвори калкулатор →</span>
                        </div>
                    </Card>
                </div>

                <div 
                    onClick={() => setView('structural')}
                    className="group cursor-pointer transform transition-all duration-300 hover:-translate-y-2"
                >
                    <Card className="h-full border-2 border-transparent hover:border-amber-500 dark:hover:border-amber-400 bg-white dark:bg-bunker-900">
                        <div className="p-8 flex flex-col items-center text-center h-full">
                            <div className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-bunker-800 dark:text-bunker-100 mb-3">Част Конструкции</h3>
                            <p className="text-bunker-500 dark:text-bunker-400 text-sm mb-6 flex-grow">
                                Калкулатор за конструктивно проектиране, халета, подпорни стени и специализирани конструкции.
                            </p>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold group-hover:underline">Отвори калкулатор →</span>
                        </div>
                    </Card>
                </div>
             </div>
          </div>
        )}

        {view === 'structural' && <StructuralApp isSidebarOpen={isSidebarOpen} onBack={() => setView('home')} />}
        {view === 'architectural' && <ArchitecturalApp isSidebarOpen={isSidebarOpen} onBack={() => setView('home')} />}
      </main>

      <footer className="text-center py-6 text-sm text-bunker-500 dark:text-bunker-400">
        <p>© {new Date().getFullYear()} Калкулатор Проектиране. Всички права запазени.</p>
      </footer>
    </div>
  );
}
