
import React, { useState, DragEvent } from 'react';
import type { CrmDeal, Contact, CrmStage } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { useAdminData } from '../hooks/useLmsData';

type DealCardProps = {
  deal: CrmDeal;
  contact: Contact | undefined;
  onMove: (newStage: CrmStage) => void;
  onDelete: () => void;
  setDraggedDealId: (id: string | null) => void;
  isDragging: boolean;
  setCurrentView: (view: string) => void;
};

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    });
};

const DealCard: React.FC<DealCardProps> = ({ deal, contact, onMove, onDelete, setDraggedDealId, isDragging, setCurrentView }) => {
    const stages: CrmStage[] = ['New', 'Qualified', 'Proposal', 'Won', 'Lost'];
    const currentStageIndex = stages.indexOf(deal.stage);

    const handleDragStart = (e: DragEvent<HTMLDivElement>) => {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', deal.id); // Standard data type
        setDraggedDealId(deal.id);
    };

    const handleDragEnd = () => {
        setDraggedDealId(null);
    };

    return (
      <div 
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`bg-white dark:bg-gray-700 rounded-lg shadow-sm p-4 mb-4 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all relative group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-50 ring-2 ring-primary-400' : ''}`}
      >
        <div className="flex justify-between items-start">
            <div>
                <button 
                    onClick={() => setCurrentView(`crm/${deal.id}`)}
                    className="font-bold text-gray-800 dark:text-gray-100 text-lg hover:text-primary-600 dark:hover:text-primary-400 text-left"
                >
                    {deal.name}
                </button>
                <div className="flex items-center mt-2">
                    {contact && (
                        <img src={contact.avatar} alt={contact.name} className="w-6 h-6 rounded-full mr-2" />
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-300">{contact?.name || 'Unknown Contact'}</span>
                </div>
            </div>
            <button 
                onClick={onDelete}
                className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Delete Deal"
            >
                <TrashIcon className="w-4 h-4" />
            </button>
        </div>
        
        <div className="mt-4 flex items-center justify-between">
            <p className="text-md font-bold text-primary-600 dark:text-primary-400">
              {formatCurrency(deal.value)}
            </p>
            
            <div className="flex space-x-1">
                <button 
                    disabled={currentStageIndex === 0}
                    onClick={() => onMove(stages[currentStageIndex - 1])}
                    className="p-1 rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Back"
                >
                    &larr;
                </button>
                <button 
                    disabled={currentStageIndex === stages.length - 1}
                    onClick={() => onMove(stages[currentStageIndex + 1])}
                    className="p-1 rounded bg-gray-100 dark:bg-gray-600 hover:bg-gray-200 dark:hover:bg-gray-500 text-gray-600 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move Forward"
                >
                    &rarr;
                </button>
            </div>
        </div>
      </div>
    );
};

type CrmColumnProps = {
  stage: CrmStage;
  deals: CrmDeal[];
  contacts: Contact[];
  onMoveDeal: (dealId: string, newStage: CrmStage) => void;
  onDeleteDeal: (dealId: string) => void;
  draggedDealId: string | null;
  setDraggedDealId: (id: string | null) => void;
  setCurrentView: (view: string) => void;
};

const CrmColumn: React.FC<CrmColumnProps> = ({ stage, deals, contacts, onMoveDeal, onDeleteDeal, draggedDealId, setDraggedDealId, setCurrentView }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    const stageColors: { [key in CrmStage]: string } = {
        'New': 'border-t-blue-500',
        'Qualified': 'border-t-yellow-500',
        'Proposal': 'border-t-purple-500',
        'Won': 'border-t-green-500',
        'Lost': 'border-t-gray-500 dark:border-t-gray-400',
    };

    const totalValue = deals.reduce((sum, d) => sum + d.value, 0);

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        // Only set active if we are truly dragging something
        if (draggedDealId) {
            setIsDragOver(true);
        }
    };

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (draggedDealId) {
            setIsDragOver(true);
        }
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        // prevent flickering when dragging over children
        if (e.currentTarget.contains(e.relatedTarget as Node)) {
             return;
        }
        setIsDragOver(false);
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        
        // Reliable state-based drop
        if (draggedDealId) {
            onMoveDeal(draggedDealId, stage);
            setDraggedDealId(null);
        }
    };

    return (
        <div 
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`flex-1 min-w-[300px] bg-gray-100 dark:bg-gray-800/50 rounded-lg p-4 border-t-4 ${stageColors[stage]} flex flex-col h-full transition-colors duration-200 ${isDragOver ? 'bg-blue-50 dark:bg-gray-700 ring-2 ring-primary-400' : ''}`}
        >
          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex justify-between items-center">
                  {stage} 
                  <span className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs px-2 py-1 rounded-full">{deals.length}</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Total: {formatCurrency(totalValue)}</p>
          </div>
          
          <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar min-h-[200px]">
            {deals.map(deal => {
              const contact = contacts.find(c => c.id === deal.contactId);
              return (
                <DealCard 
                    key={deal.id} 
                    deal={deal} 
                    contact={contact} 
                    onMove={(newStage) => onMoveDeal(deal.id, newStage)}
                    onDelete={() => onDeleteDeal(deal.id)}
                    setDraggedDealId={setDraggedDealId}
                    isDragging={draggedDealId === deal.id}
                    setCurrentView={setCurrentView}
                />
            );
            })}
            {deals.length === 0 && (
                <div className={`text-center py-8 border-2 border-dashed rounded-lg text-gray-400 text-sm transition-colors ${isDragOver ? 'border-primary-400 bg-white dark:bg-gray-600 text-primary-500' : 'border-gray-300 dark:border-gray-700'}`}>
                    {isDragOver ? 'Drop Deal Here' : 'No deals'}
                </div>
            )}
          </div>
        </div>
    );
};

type CrmBoardProps = {
  deals: CrmDeal[];
  contacts: Contact[];
  setCurrentView: (view: string) => void;
};

export const CrmBoard: React.FC<CrmBoardProps> = ({ deals, contacts, setCurrentView }) => {
  const stages: CrmStage[] = ['New', 'Qualified', 'Proposal', 'Won', 'Lost'];
  const { addCrmDeal, updateCrmStage, deleteCrmDeal } = useAdminData();
  
  const [draggedDealId, setDraggedDealId] = useState<string | null>(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [dealName, setDealName] = useState('');
  const [dealValue, setDealValue] = useState('');
  const [selectedContact, setSelectedContact] = useState('');
  const [selectedStage, setSelectedStage] = useState<CrmStage>('New');

  const totalPipelineValue = deals.filter(d => d.stage !== 'Lost').reduce((sum, d) => sum + d.value, 0);

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!dealName || !selectedContact || dealValue === '') return;

      await addCrmDeal({
          name: dealName,
          contactId: selectedContact,
          value: parseFloat(dealValue),
          stage: selectedStage
      });

      setIsModalOpen(false);
      setDealName('');
      setDealValue('');
      setSelectedContact('');
      setSelectedStage('New');
  };

  return (
    <div className="h-full flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Pipeline</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                    Active Pipeline Value: <span className="font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPipelineValue)}</span>
                </p>
            </div>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-primary-700 flex items-center shadow-lg hover:shadow-xl transition-all"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Add Deal
            </button>
        </div>

        <div className="flex-grow flex space-x-4 overflow-x-auto pb-4 snap-x">
            {stages.map(stage => (
                <CrmColumn
                    key={stage}
                    stage={stage}
                    deals={deals.filter(d => d.stage === stage)}
                    contacts={contacts}
                    onMoveDeal={updateCrmStage}
                    onDeleteDeal={deleteCrmDeal}
                    draggedDealId={draggedDealId}
                    setDraggedDealId={setDraggedDealId}
                    setCurrentView={setCurrentView}
                />
            ))}
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6 animate-fade-in-right">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Create New Deal</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                            ✕
                        </button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deal Name</label>
                            <input 
                                type="text" 
                                required
                                value={dealName}
                                onChange={e => setDealName(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                placeholder="e.g., Enterprise License"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Value (₹)</label>
                            <input 
                                type="number" 
                                required
                                min="0"
                                value={dealValue}
                                onChange={e => setDealValue(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                                placeholder="5000"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contact</label>
                            <select 
                                required
                                value={selectedContact}
                                onChange={e => setSelectedContact(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="">Select a Contact...</option>
                                {contacts.map(contact => (
                                    <option key={contact.id} value={contact.id}>{contact.name}</option>
                                ))}
                            </select>
                        </div>

                         <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stage</label>
                            <select 
                                value={selectedStage}
                                onChange={(e: any) => setSelectedStage(e.target.value)}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-primary-500 focus:border-primary-500"
                            >
                                {stages.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>

                        <div className="flex justify-end space-x-3 mt-6">
                            <button 
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-primary-600 text-white font-bold rounded hover:bg-primary-700"
                            >
                                Create Deal
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};
