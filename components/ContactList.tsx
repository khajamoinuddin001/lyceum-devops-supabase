import React from 'react';
import type { Contact, ContactStatus } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';

type ContactListProps = {
  contacts: Contact[];
  setCurrentView: (view: string) => void;
};

const StatusBadge: React.FC<{ status: ContactStatus }> = ({ status }) => {
  const styles: { [key in ContactStatus]: string } = {
    'Active Student': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Prospect': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Past Student': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
  };
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

export const ContactList: React.FC<ContactListProps> = ({ contacts, setCurrentView }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      <div className="p-4 sm:p-6 border-b dark:border-gray-700 flex justify-between items-center">
        <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Contact Management</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">A list of all contacts in your academy.</p>
        </div>
        <button 
            onClick={() => setCurrentView('contacts/new')}
            className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 flex items-center"
        >
            <PlusIcon className="w-5 h-5 mr-2" />
            New Contact
        </button>
      </div>

      {contacts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">Contact Name</th>
                <th scope="col" className="px-6 py-3 hidden sm:table-cell">Company</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">View</span></th>
              </tr>
            </thead>
            <tbody>
              {contacts.map(contact => (
                <tr 
                  key={contact.id} 
                  className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-200"
                >
                  <td scope="row" className="px-6 py-4">
                    <div className="flex items-center">
                      <img className="w-10 h-10 rounded-full mr-3" src={contact.avatar} alt={`${contact.name} avatar`} />
                      <div>
                        <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(`contacts/${contact.id}`); }} className="font-semibold text-gray-900 dark:text-white hover:underline">{contact.name}</a>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{contact.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 hidden sm:table-cell">{contact.company}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={contact.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView(`contacts/${contact.id}`); }} className="font-medium text-primary-600 dark:text-primary-500 hover:underline">View</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
         <div className="text-center py-16 px-6">
          <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-xl font-semibold text-gray-900 dark:text-white">No contacts found</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by adding your first contact.</p>
          <div className="mt-6">
            <button 
                onClick={() => setCurrentView('contacts/new')}
                className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 flex items-center mx-auto"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                New Contact
            </button>
          </div>
        </div>
      )}
    </div>
  );
};