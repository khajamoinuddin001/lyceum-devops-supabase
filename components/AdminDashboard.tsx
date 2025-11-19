import React from 'react';
import type { Contact, CrmDeal, Invoice, Course } from '../types';
import { UsersIcon } from './icons/UsersIcon';
import { CrmIcon } from './icons/CrmIcon';
import { AccountingIcon } from './icons/AccountingIcon';
import { BookOpenIcon } from './icons/BookOpenIcon';

type AdminDashboardProps = {
  contacts: Contact[];
  deals: CrmDeal[];
  invoices: Invoice[];
  courses: Course[];
};

const StatCard: React.FC<{ title: string; value: string | number; description: string; icon: React.ReactNode }> = React.memo(({ title, value, description, icon }) => (
  <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <div className="flex items-center">
      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md p-3">
        {icon}
      </div>
      <div className="ml-5 w-0 flex-1">
        <dl>
          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
          <dd className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{value}</p>
          </dd>
        </dl>
      </div>
    </div>
     <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 truncate">{description}</p>
  </div>
));


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ contacts, deals, invoices, courses }) => {
    const openDeals = deals.filter(d => d.stage !== 'Won');
    const totalPipelineValue = openDeals.reduce((sum, deal) => sum + deal.value, 0).toLocaleString();
    const overdueInvoices = invoices.filter(i => i.status === 'Overdue');
    const totalCourses = courses.length;

    return (
        <div className="space-y-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                    title="Total Contacts" 
                    value={contacts.length} 
                    description={`${contacts.filter(c => c.enrolledCourses.length > 0).length} have enrolled`}
                    icon={<UsersIcon />} 
                />
                <StatCard 
                    title="Open Deals" 
                    value={openDeals.length}
                    description={`$${totalPipelineValue} in pipeline`}
                    icon={<CrmIcon />} 
                />
                <StatCard 
                    title="Overdue Invoices" 
                    value={overdueInvoices.length}
                    description={`${invoices.filter(i => i.status === 'Paid').length} invoices paid`}
                    icon={<AccountingIcon />} 
                />
                <StatCard 
                    title="Available Courses" 
                    value={totalCourses}
                    description={`${courses.filter(c => c.enrolled).length} are active enrollments`}
                    icon={<BookOpenIcon />} 
                />
            </div>
            
            {/* Additional dashboard widgets can be added here in the future */}
        </div>
    );
};