
import React from 'react';
import { DashboardIcon } from './icons/DashboardIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CrmIcon } from './icons/CrmIcon';
import { AccountingIcon } from './icons/AccountingIcon';
import { UserRole } from '../types';

type NavItemProps = {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
};

const NavItem: React.FC<NavItemProps> = React.memo(({ icon, label, isActive, onClick }) => (
  <li>
    <button
      onClick={onClick}
      className={`flex items-center p-2 text-base font-normal rounded-lg w-full text-left
        ${isActive
          ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-white'
          : 'text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
    >
      <span className={isActive ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500'}>
        {icon}
      </span>
      <span className="ml-3">{label}</span>
    </button>
  </li>
));

type SidebarProps = {
  currentView: string;
  setCurrentView: (view: string) => void;
  toggleSidebar: () => void;
  userRole: UserRole;
};

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, toggleSidebar, userRole }) => {
  const adminNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'contacts', label: 'Contacts', icon: <UsersIcon /> },
    { id: 'crm', label: 'CRM', icon: <CrmIcon /> },
    { id: 'lms', label: 'LMS', icon: <BookOpenIcon /> },
    { id: 'accounting', label: 'Accounting', icon: <AccountingIcon /> },
    { id: 'study-buddy', label: 'Study Buddy', icon: <SparklesIcon /> },
  ];

  const staffNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { id: 'contacts', label: 'Contacts', icon: <UsersIcon /> },
    { id: 'crm', label: 'CRM', icon: <CrmIcon /> },
    { id: 'lms', label: 'LMS', icon: <BookOpenIcon /> },
    { id: 'study-buddy', label: 'Study Buddy', icon: <SparklesIcon /> },
  ];

  const studentNavItems = [
    { id: 'my-courses', label: 'My Courses', icon: <DashboardIcon /> },
    { id: 'catalog', label: 'Course Catalog', icon: <BookOpenIcon /> },
    { id: 'study-buddy', label: 'Study Buddy', icon: <SparklesIcon /> },
  ];
  
  let navItems = adminNavItems;
  if (userRole === 'student') {
    navItems = studentNavItems;
  } else if (userRole === 'staff') {
    navItems = staffNavItems;
  }

  const handleNavigation = (view: string) => {
    setCurrentView(view);
    if(window.innerWidth < 768) { // md breakpoint
        toggleSidebar();
    }
  }

  return (
    <aside className="w-64" aria-label="Sidebar">
      <div className="overflow-y-auto py-4 px-3 bg-white dark:bg-gray-800 h-full">
        <div className="flex items-center pl-2.5 mb-5">
            <svg className="w-8 h-8 mr-2 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">Lyceum Academy</span>
        </div>
        <ul className="space-y-2">
          {navItems.map(item => (
            <NavItem
              key={item.id}
              label={item.label}
              icon={item.icon}
              isActive={currentView.startsWith(item.id)}
              onClick={() => handleNavigation(item.id)}
            />
          ))}
        </ul>
      </div>
    </aside>
  );
};
