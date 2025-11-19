
import React, { useState, useRef, useEffect } from 'react';
import type { Contact, Course, CrmDeal, Invoice, Note, Document, ContactStatus } from '../types';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { DollarSignIcon } from './icons/DollarSignIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useAdminData } from '../hooks/useLmsData';

type ContactDetailProps = {
    contact: Contact;
    courses: Course[];
    deals: CrmDeal[];
    invoices: Invoice[];
    addNote: (contactId: string, noteText: string) => void;
    addDocument: (contactId: string, document: Document) => void;
    setCurrentView: (view: string) => void;
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });
};

const EditableField: React.FC<{ 
    value: string; 
    onSave: (newValue: string) => void;
    className?: string;
    placeholder?: string;
}> = ({ value, onSave, className, placeholder }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (currentValue !== value) {
            onSave(currentValue);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return isEditing ? (
        <input
            autoFocus
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white dark:bg-gray-700 border border-blue-500 rounded px-2 py-1 text-gray-900 dark:text-white focus:outline-none ${className}`}
            placeholder={placeholder}
        />
    ) : (
        <span 
            onClick={() => setIsEditing(true)} 
            className={`cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 px-1 rounded border border-transparent hover:border-gray-300 transition-all ${className}`}
            title="Click to edit"
        >
            {value || <span className="text-gray-400 italic">{placeholder || 'Click to add'}</span>}
        </span>
    );
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = React.memo(({ title, value, icon }) => (
    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 flex items-center border dark:border-gray-700">
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
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            isActive 
            ? 'bg-primary-600 text-white shadow-sm' 
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
    const { handleDeleteContact, handleUpdateContact } = useAdminData();

    const totalSpent = invoices.filter(inv => inv.status === 'Paid').reduce((sum, inv) => sum + inv.amount, 0);

    const handleAddNote = () => {
        if(noteText.trim()) {
            addNote(contact.id, noteText);
            setNoteText('');
        }
    }

    const onDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${contact.name}? This cannot be undone.`)) {
            const success = await handleDeleteContact(contact.id);
            if (success) {
                setCurrentView('contacts');
            }
        }
    }

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        handleUpdateContact(contact.id, { status: e.target.value as ContactStatus });
    };

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
            {/* Header */}
            <div className="flex justify-between items-center">
                <button onClick={() => setCurrentView('contacts')} className="text-primary-600 dark:text-primary-400 hover:underline flex items-center">
                    &larr; Back to Contacts
                </button>
                <div className="flex space-x-3">
                     <select 
                        value={contact.status} 
                        onChange={handleStatusChange}
                        className="text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md px-3 py-1 focus:outline-none focus:ring-primary-500"
                    >
                        <option value="Prospect">Prospect</option>
                        <option value="Active Student">Active Student</option>
                        <option value="Past Student">Past Student</option>
                    </select>
                    <button 
                        onClick={onDelete}
                        className="flex items-center text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title="Delete Contact"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            
            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-primary-600 to-primary-800"></div>
                <div className="px-6 pb-6">
                    <div className="flex flex-col sm:flex-row items-end -mt-12 mb-4">
                        <img className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-white" src={contact.avatar} alt={`${contact.name} avatar`} />
                        <div className="mt-4 sm:mt-0 sm:ml-4 flex-grow">
                             <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                                <EditableField 
                                    value={contact.name} 
                                    onSave={(val) => handleUpdateContact(contact.id, { name: val })} 
                                />
                             </h1>
                             <div className="text-gray-600 dark:text-gray-400 mt-1">
                                <EditableField 
                                    value={contact.email} 
                                    onSave={(val) => handleUpdateContact(contact.id, { email: val })} 
                                    placeholder="Add email"
                                />
                             </div>
                        </div>
                        <div className="mt-4 sm:mt-0 flex space-x-3">
                             <button onClick={() => setActiveTab('notes')} className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors">
                                 Add Note
                             </button>
                             <button onClick={() => setCurrentView(`crm`)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                 Create Deal
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t dark:border-gray-700">
                        <div className="space-y-3">
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <BuildingOfficeIcon className="w-5 h-5 mr-3 text-gray-400" />
                                <span className="font-medium mr-2">Company:</span>
                                <EditableField 
                                    value={contact.company} 
                                    onSave={(val) => handleUpdateContact(contact.id, { company: val })} 
                                    placeholder="Add Company"
                                />
                            </div>
                            <div className="flex items-center text-gray-700 dark:text-gray-300">
                                <PhoneIcon className="w-5 h-5 mr-3 text-gray-400" />
                                <span className="font-medium mr-2">Phone:</span>
                                <EditableField 
                                    value={contact.phone} 
                                    onSave={(val) => handleUpdateContact(contact.id, { phone: val })} 
                                    placeholder="Add Phone"
                                />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <StatCard title="Courses" value={contact.enrolledCourses.length} icon={<BookOpenIcon className="w-5 h-5" />} />
                            <StatCard title="Spent" value={formatCurrency(totalSpent)} icon={<DollarSignIcon className="w-5 h-5"/>} />
                            <StatCard title="Deals" value={deals.filter(d => d.stage !== 'Won').length} icon={<BriefcaseIcon className="w-5 h-5"/>} />
                         </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex space-x-2 overflow-x-auto">
                        <TabButton label="Notes" isActive={activeTab === 'notes'} onClick={() => setActiveTab('notes')} />
                        <TabButton label="Documents" isActive={activeTab === 'documents'} onClick={() => setActiveTab('documents')} />
                        <TabButton label="Courses" isActive={activeTab === 'courses'} onClick={() => setActiveTab('courses')} />
                        <TabButton label="Deals" isActive={activeTab === 'deals'} onClick={() => setActiveTab('deals')} />
                        <TabButton label="Invoices" isActive={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} />
                    </div>
                </div>
                <div className="p-6">
                    {activeTab === 'notes' && (
                        <div className="animate-fade-in-right">
                             <div className="flex space-x-3">
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    placeholder="Add a new note..."
                                    className="w-full p-3 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 shadow-sm"
                                    rows={3}
                                />
                            </div>
                             <div className="flex justify-end mt-2 mb-6">
                                <button onClick={handleAddNote} className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 shadow-sm">Add Note</button>
                            </div>
                            
                            <div className="space-y-4">
                                {contact.notes.length === 0 ? (
                                    <p className="text-center text-gray-500 dark:text-gray-400 italic">No notes yet.</p>
                                ) : (
                                    contact.notes.map(note => (
                                        <div key={note.id} className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700">
                                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{note.text}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{new Date(note.date).toLocaleString()}</p>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                    {activeTab === 'documents' && (
                        <div className="animate-fade-in-right">
                             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" />
                             <button
                                onClick={() => fileInputRef.current?.click()} 
                                className="mb-6 inline-flex items-center bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                             >
                               <UploadIcon className="w-5 h-5 mr-2" /> Upload Document
                            </button>
                             <ul className="space-y-3">
                                {contact.documents.length === 0 ? <p className="text-gray-500 italic">No documents uploaded.</p> : contact.documents.map(doc => (
                                    <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-center">
                                            <DocumentIcon className="w-8 h-8 mr-3 text-primary-500" />
                                            <div>
                                                <a href={doc.url} className="text-gray-800 dark:text-gray-200 font-medium hover:underline block">{doc.name}</a>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">{doc.size} • {doc.uploadDate}</p>
                                            </div>
                                        </div>
                                        <a href={doc.url} download className="text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium px-3 py-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20">Download</a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {activeTab === 'courses' && (
                        <ul className="space-y-2 animate-fade-in-right">
                            {courses.length === 0 ? <p className="text-gray-500 italic">Not enrolled in any courses.</p> : courses.map(c => (
                                <li key={c.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                    <span className="font-medium text-gray-800 dark:text-white">{c.title}</span>
                                    <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded-full">Enrolled</span>
                                </li>
                            ))}
                        </ul>
                    )}
                    {activeTab === 'deals' && (
                        <ul className="space-y-2 animate-fade-in-right">
                            {deals.length === 0 ? <p className="text-gray-500 italic">No associated deals.</p> : deals.map(d => (
                                <li key={d.id} onClick={() => setCurrentView(`crm/${d.id}`)} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700">
                                    <span className="font-medium text-gray-800 dark:text-white">{d.name}</span>
                                    <div className="flex items-center space-x-3">
                                        <span className="text-gray-600 dark:text-gray-300">{formatCurrency(d.value)}</span>
                                        <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded-full">{d.stage}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {activeTab === 'invoices' && (
                        <ul className="space-y-2 animate-fade-in-right">
                            {invoices.length === 0 ? <p className="text-gray-500 italic">No invoices found.</p> : invoices.map(i => (
                                <li key={i.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg flex justify-between items-center">
                                    <span className="font-medium text-gray-800 dark:text-white">{i.invoiceNumber}</span>
                                    <div className="flex items-center space-x-3">
                                         <span className="text-gray-600 dark:text-gray-300">{formatCurrency(i.amount)}</span>
                                         <span className={`text-xs px-2 py-1 rounded-full ${i.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{i.status}</span>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};
