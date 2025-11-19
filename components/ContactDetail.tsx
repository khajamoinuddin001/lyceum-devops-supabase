import React, { useState, useRef } from 'react';
import type { Contact, Course, CrmDeal, Invoice, Note, Document } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { UploadIcon } from './icons/UploadIcon';

type ContactDetailProps = {
    contact: Contact;
    courses: Course[];
    deals: CrmDeal[];
    invoices: Invoice[];
    addNote: (contactId: string, noteText: string) => void;
    addDocument: (contactId: string, document: Document) => void;
    setCurrentView: (view: string) => void;
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = React.memo(({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center">
      <div className="flex-shrink-0 bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 rounded-md p-3">
        {icon}
      </div>
      <div className="ml-4">
        <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</dt>
        <dd className="text-xl font-semibold text-gray-900 dark:text-white">{value}</dd>
      </div>
    </div>
));

const TabButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = React.memo(({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-md ${
            isActive 
            ? 'bg-primary-600 text-white' 
            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
    >
        {label}
    </button>
));


export const ContactDetail: React.FC<ContactDetailProps> = ({ contact, courses, deals, invoices, addNote, addDocument, setCurrentView }) => {
    const [activeTab, setActiveTab] = useState('notes');
    const [noteText, setNoteText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalSpent = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);

    const handleAddNote = () => {
        if(noteText.trim()) {
            addNote(contact.id, noteText);
            setNoteText('');
        }
    }

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const newDocument: Document = {
                id: `doc-${Date.now()}`,
                name: file.name,
                size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                uploadDate: new Date().toISOString().split('T')[0],
                url: '#', // In a real app, this would be the URL from the storage service
            };
            addDocument(contact.id, newDocument);
        }
    };
    
    return (
        <div className="space-y-6">
            <button onClick={() => setCurrentView('contacts')} className="text-primary-600 dark:text-primary-400 hover:underline mb-2">&larr; Back to Contacts</button>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <div className="flex flex-col sm:flex-row items-start space-x-0 sm:space-x-6">
                    <img className="w-24 h-24 rounded-full mb-4 sm:mb-0" src={contact.avatar} alt={`${contact.name} avatar`} />
                    <div className="flex-grow">
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{contact.name}</h1>
                        <p className="text-md text-gray-600 dark:text-gray-300 mt-1">{contact.email}</p>
                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-2 text-sm text-gray-500 dark:text-gray-400">
                             <div className="flex items-center"><BuildingOfficeIcon className="w-4 h-4 mr-2" />{contact.company}</div>
                             <div className="flex items-center"><PhoneIcon className="w-4 h-4 mr-2" />{contact.phone}</div>
                        </div>
                    </div>
                </div>
                 <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <StatCard title="Courses Enrolled" value={contact.enrolledCourses.length} icon={<BookOpenIcon className="w-5 h-5" />} />
                    <StatCard title="Total Spent" value={`$${totalSpent.toLocaleString()}`} icon={<DollarSignIcon className="w-5 h-5"/>} />
                    <StatCard title="Open CRM Deals" value={deals.filter(d => d.stage !== 'Won').length} icon={<BriefcaseIcon className="w-5 h-5"/>} />
                 </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2">
                        <TabButton label="Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                        <TabButton label="Documents" isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                        <TabButton label="Courses" isActive={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                        <TabButton label="Deals" isActive={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
                        <TabButton label="Invoices" isActive={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'notes' && (
                        <div>
                             <div className="flex space-x-3">
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add a new note..."
                                    className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                    rows={2}
                                />
                                <button onClick={handleAddNote} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 self-start">Add Note</button>
                            </div>
                            <ul className="mt-4 space-y-4">
                                {contact.notes.map(note => (
                                    <li key={note.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <p className="text-gray-800 dark:text-gray-200">{note.text}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(note.date).toLocaleString()}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'documents' && (
                        <div>
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                             <button
                                onClick={() => fileInputRef.current?.click()} 
                                className="mb-4 inline-flex items-center bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700"
                             >
                               <UploadIcon className="w-5 h-5 mr-2" /> Upload Document
                            </button>
                             <ul className="space-y-2">
                                {contact.documents.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                        <div className="flex items-center">
                                            <DocumentIcon className="w-6 h-6 mr-3 text-primary-500" />
                                            <div>
                                                <a href={doc.url} className="text-gray-800 dark:text-gray-200 font-medium hover:underline">{doc.name}</a>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size} - {doc.uploadDate}</p>
                                            </div>
                                        </div>
                                        <a href={doc.url} download className="text-primary-600 dark:text-primary-400 hover:underline text-sm">Download</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'courses' && (
                        <ul className="space-y-2">{courses.map(c => <li key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">{c.title}</li>)}</ul>
                    )}
                    {activeTab === 'deals' && (
                        <ul className="space-y-2">{deals.map(d => <li key={d.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">{d.name} - ${d.value.toLocaleString()} ({d.stage})</li>)}</ul>
                    )}
                    {activeTab === 'invoices' && (
                        <ul className="space-y-2">{invoices.map(i => <li key={i.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">{i.invoiceNumber} - ${i.amount.toLocaleString()} ({i.status})</li>)}</ul>
                    )}
                </div>
            </div>
        </div>
    );
};