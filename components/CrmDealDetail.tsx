
import React, { useState, useEffect } from 'react';
import type { CrmDeal, Contact, CrmStage } from '../types';
import { getDeal, getContacts, updateDeal, deleteDeal } from '../services/api';
import { CogIcon } from './icons/CogIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useToast } from './Toast';

type CrmDealDetailProps = {
    dealId: string;
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
    label: string; 
    value: string | number; 
    onSave: (newValue: string) => void;
    type?: 'text' | 'number';
    prefix?: React.ReactNode;
}> = ({ label, value, onSave, type = 'text', prefix }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);

    useEffect(() => {
        setCurrentValue(value);
    }, [value]);

    const handleBlur = () => {
        setIsEditing(false);
        if (String(currentValue) !== String(value)) {
            onSave(String(currentValue));
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleBlur();
        }
    };

    return (
        <div>
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</div>
            <div className="mt-1">
                {isEditing ? (
                    <input
                        type={type}
                        autoFocus
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        className="w-full p-1 text-lg font-semibold border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    />
                ) : (
                    <div 
                        onClick={() => setIsEditing(true)}
                        className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 px-1 -ml-1 rounded border border-transparent hover:border-gray-300 dark:hover:border-gray-600 transition-all flex items-center"
                    >
                        {prefix && <span className="mr-1">{prefix}</span>}
                        {type === 'number' && label.includes('Revenue') 
                            ? formatCurrency(Number(currentValue)) 
                            : currentValue}
                    </div>
                )}
            </div>
        </div>
    );
};

export const CrmDealDetail: React.FC<CrmDealDetailProps> = ({ dealId, setCurrentView }) => {
    const [deal, setDeal] = useState<CrmDeal | null>(null);
    const [contact, setContact] = useState<Contact | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'notes' | 'extra'>('notes');
    const [notes, setNotes] = useState('');
    const [tagInput, setTagInput] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            const fetchedDeal = await getDeal(dealId);
            if (fetchedDeal) {
                setDeal(fetchedDeal);
                setNotes(fetchedDeal.notes || '');
                const allContacts = await getContacts();
                const relatedContact = allContacts.find(c => c.id === fetchedDeal.contactId);
                setContact(relatedContact || null);
            }
            setLoading(false);
        };
        fetchDetails();
    }, [dealId]);

    const handleUpdateField = async (field: keyof CrmDeal, value: any) => {
        if (!deal) return;
        
        // Optimistic update
        setDeal({ ...deal, [field]: value });

        try {
            await updateDeal(deal.id, { [field]: value });
            addToast(`${field} updated`, 'success');
        } catch (error) {
            console.error(error);
            addToast("Failed to update deal", "error");
        }
    };

    const handleStageChange = async (newStage: CrmStage) => {
        if (!deal) return;
        setDeal({ ...deal, stage: newStage });
        try {
            await updateDeal(deal.id, { stage: newStage });
            addToast(`Deal moved to ${newStage}`, 'success');
        } catch (error) {
            addToast("Failed to update stage", "error");
        }
    }

    const handleSaveNotes = async () => {
        if (!deal) return;
        try {
            await updateDeal(deal.id, { notes });
            addToast("Notes saved", 'success');
        } catch (error) {
            addToast("Failed to save notes", "error");
        }
    }

    const handleAddTag = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && tagInput.trim() && deal) {
            const newTags = [...(deal.tags || []), tagInput.trim()];
            setDeal({ ...deal, tags: newTags });
            setTagInput('');
            try {
                await updateDeal(deal.id, { tags: newTags });
            } catch (error) {
                addToast("Failed to add tag", "error");
            }
        }
    }

    const handleRemoveTag = async (tagToRemove: string) => {
        if (!deal) return;
        const newTags = (deal.tags || []).filter(t => t !== tagToRemove);
        setDeal({ ...deal, tags: newTags });
        try {
            await updateDeal(deal.id, { tags: newTags });
        } catch (error) {
            addToast("Failed to remove tag", "error");
        }
    }

    const handleDeleteDeal = async () => {
        if (!deal) return;
        if (window.confirm("Are you sure you want to delete this deal?")) {
            try {
                await deleteDeal(deal.id);
                addToast("Deal deleted", "success");
                setCurrentView('crm');
            } catch (error) {
                addToast("Failed to delete deal", "error");
            }
        }
    }

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading details...</div>;
    }

    if (!deal) {
        return <div className="p-8 text-center text-red-500">Deal not found.</div>;
    }

    return (
        <div className="bg-white dark:bg-gray-800 min-h-screen p-6 font-sans">
            {/* Header / Breadcrumb */}
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <button onClick={() => setCurrentView('crm')} className="hover:text-primary-600">Pipeline</button>
                    <span className="mx-2">/</span>
                    <span className="text-gray-800 dark:text-gray-200">{deal.name}</span>
                </div>
                <button 
                    onClick={handleDeleteDeal}
                    className="text-gray-400 hover:text-red-500 p-1"
                    title="Delete Deal"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border dark:border-gray-700 gap-4 sm:gap-0">
                 <div className="flex space-x-2">
                    <button 
                        onClick={() => handleStageChange('Proposal')}
                        className="bg-primary-700 hover:bg-primary-800 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        New Quotation
                    </button>
                    <button 
                        onClick={() => handleStageChange('Won')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        Won
                    </button>
                    <button 
                        onClick={() => handleStageChange('Lost')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded text-sm font-medium transition-colors"
                    >
                        Lost
                    </button>
                 </div>
                 <div className="flex flex-wrap gap-1">
                     {['New', 'Qualified', 'Proposal', 'Won', 'Lost'].map((stage, idx) => (
                         <div key={stage} className={`px-3 py-1 text-xs font-semibold uppercase rounded-full flex items-center cursor-default ${
                             deal.stage === stage 
                                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 border border-primary-200 dark:border-primary-700' 
                                : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500'
                         }`}>
                             {stage}
                         </div>
                     ))}
                 </div>
            </div>

            {/* Title Block */}
            <div className="mb-6">
                 <EditableField 
                    label="" 
                    value={deal.name} 
                    onSave={(val) => handleUpdateField('name', val)} 
                />
            </div>

            {/* Key Stats */}
            <div className="flex space-x-12 mb-8">
                <EditableField 
                    label="Expected Revenue" 
                    value={deal.value} 
                    type="number"
                    onSave={(val) => handleUpdateField('value', Number(val))}
                />
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 border-t dark:border-gray-700 pt-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Contact <span className="text-primary-500">?</span></span>
                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">
                            <button 
                                onClick={() => contact && setCurrentView(`contacts/${contact.id}`)}
                                className="hover:underline hover:text-primary-600"
                            >
                                {contact?.name}
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Email</span>
                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">{contact?.email}</div>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Phone</span>
                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">{contact?.phone || 'N/A'}</div>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Coaching Interest</span>
                        <div className="col-span-2">
                             <input 
                                type="text"
                                value={deal.coachingInterest || ''}
                                onChange={(e) => setDeal({...deal, coachingInterest: e.target.value})}
                                onBlur={(e) => handleUpdateField('coachingInterest', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none text-sm text-gray-700 dark:text-gray-300 uppercase"
                                placeholder="Click to edit"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Country Interest</span>
                         <div className="col-span-2">
                             <input 
                                type="text"
                                value={deal.countryInterest || ''}
                                onChange={(e) => setDeal({...deal, countryInterest: e.target.value})}
                                onBlur={(e) => handleUpdateField('countryInterest', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none text-sm text-gray-700 dark:text-gray-300 uppercase"
                                placeholder="Click to edit"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-center">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Visa Type</span>
                         <div className="col-span-2">
                             <input 
                                type="text"
                                value={deal.visaType || ''}
                                onChange={(e) => setDeal({...deal, visaType: e.target.value})}
                                onBlur={(e) => handleUpdateField('visaType', e.target.value)}
                                className="w-full bg-transparent border-b border-transparent hover:border-gray-300 focus:border-primary-500 focus:outline-none text-sm text-gray-700 dark:text-gray-300"
                                placeholder="Student Visa"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Salesperson</span>
                        <div className="col-span-2 flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <span className="bg-purple-700 text-white text-xs w-5 h-5 flex items-center justify-center rounded mr-2">A</span>
                            {deal.salesperson || 'Admissions Counsellor'}
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Assigned To:</span>
                        <div className="col-span-2 text-sm text-gray-700 dark:text-gray-300">{deal.assignedTo || 'Samad'}</div>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Expected Closing <span className="text-primary-500">?</span></span>
                        <div className="col-span-2 flex text-yellow-400">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 items-start">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">Tags <span className="text-primary-500">?</span></span>
                        <div className="col-span-2">
                            <div className="flex flex-wrap gap-2 mb-2">
                                {(deal.tags || []).map((tag, index) => (
                                    <span 
                                        key={index} 
                                        onClick={() => handleRemoveTag(tag)}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 cursor-pointer hover:bg-red-100 hover:text-red-800 group transition-colors"
                                        title="Click to remove"
                                    >
                                        {tag}
                                        <span className="ml-1 hidden group-hover:inline">×</span>
                                    </span>
                                ))}
                            </div>
                            <input 
                                type="text" 
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleAddTag}
                                placeholder="+ Add Tag (Enter)"
                                className="text-xs border-none bg-transparent focus:ring-0 p-0 text-gray-500 dark:text-gray-400 w-full"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mt-8">
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    <button 
                        onClick={() => setActiveTab('notes')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'notes' ? 'border-gray-800 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        Internal Notes
                    </button>
                    <button 
                        onClick={() => setActiveTab('extra')}
                        className={`py-2 px-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'extra' ? 'border-gray-800 text-gray-900 dark:border-white dark:text-white' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                    >
                        Extra Information
                    </button>
                </div>
                <div className="pt-4">
                    {activeTab === 'notes' && (
                        <div>
                            <textarea 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Add a description or note about this deal..." 
                                className="w-full p-3 border rounded text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500 mb-2"
                                rows={6}
                            ></textarea>
                            <div className="flex justify-end">
                                <button 
                                    onClick={handleSaveNotes}
                                    className="bg-primary-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-primary-700 transition-colors"
                                >
                                    Save Note
                                </button>
                            </div>
                        </div>
                    )}
                    {activeTab === 'extra' && (
                         <div className="space-y-4 max-w-md">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Source</div>
                                <div className="text-sm text-gray-900 dark:text-white">Website Inquiry</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Campaign</div>
                                <div className="text-sm text-gray-900 dark:text-white">Fall Semester 2024</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-sm font-medium text-gray-600 dark:text-gray-400">Created Date</div>
                                <div className="text-sm text-gray-900 dark:text-white">{new Date().toLocaleDateString()}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
