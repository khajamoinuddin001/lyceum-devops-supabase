
import React from 'react';
import type { Invoice, Contact } from '../types';

type StatusBadgeProps = {
  status: Invoice['status'];
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2
    });
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles: { [key in Invoice['status']]: string } = {
    Paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    Sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    Draft: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    Overdue: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

type AccountingProps = {
  invoices: Invoice[];
  contacts: Contact[];
};

export const Accounting: React.FC<AccountingProps> = ({ invoices, contacts }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Accounting - Invoices</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Invoice #</th>
              <th scope="col" className="px-6 py-3">Contact</th>
              <th scope="col" className="px-6 py-3">Amount</th>
              <th scope="col" className="px-6 py-3">Status</th>
              <th scope="col" className="px-6 py-3">Issue Date</th>
              <th scope="col" className="px-6 py-3">Due Date</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map(invoice => {
              const contact = contacts.find(c => c.id === invoice.contactId);
              return (
                <tr key={invoice.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{invoice.invoiceNumber}</td>
                  <td className="px-6 py-4">{contact?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">{formatCurrency(invoice.amount)}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={invoice.status} />
                  </td>
                  <td className="px-6 py-4">{invoice.issueDate}</td>
                  <td className="px-6 py-4">{invoice.dueDate}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
