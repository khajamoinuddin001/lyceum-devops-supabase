
import React from 'react';
import { SunIcon } from './icons/SunIcon';
import { MoonIcon } from './icons/MoonIcon';
import { UserRole } from '../types';

type HeaderProps = {
  toggleSidebar: () => void;
  currentViewLabel: string;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userRole: UserRole;
};

export const Header: React.FC<HeaderProps> = ({ toggleSidebar, currentViewLabel, theme, toggleTheme, userRole }) => {
  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex justify-start items-center">
          <button
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
            className="p-2 mr-2 text-gray-600 rounded-lg cursor-pointer md:hidden hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
             <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h6a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"></path></svg>
          </button>
          <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white md:hidden">Lyceum Academy</span>
          <h1 className="text-xl font-semibold text-gray-700 dark:text-white hidden md:block">{currentViewLabel}</h1>
        </div>
        <div className="flex items-center">
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark mode"
              className="p-2 mr-3 text-gray-600 rounded-lg cursor-pointer hover:text-gray-900 hover:bg-gray-100 focus:bg-gray-100 dark:focus:bg-gray-700 focus:ring-2 focus:ring-gray-100 dark:focus:ring-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
            >
              {theme === 'light' ? <MoonIcon /> : <SunIcon />}
            </button>
            <div className="flex items-center ml-3">
                <div className="text-right mr-3 hidden md:block">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">Admin User</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
                </div>
                <img className="w-8 h-8 rounded-full" src="https://picsum.photos/seed/avatar/200" alt="user photo" />
            </div>
        </div>
      </div>
    </nav>
  );
};
