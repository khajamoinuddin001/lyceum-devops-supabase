import React from 'react';
import type { CrmDeal, Contact, CrmStage } from '../types';

type DealCardProps = {
  deal: CrmDeal;
  contactName: string;
};

const DealCard: React.FC<DealCardProps> = React.memo(({ deal, contactName }) => (
  <div className="bg-white dark:bg-gray-700 rounded-md shadow-sm p-4 mb-4 cursor-pointer hover:shadow-lg transition-shadow">
    <h4 className="font-bold text-gray-800 dark:text-gray-100">{deal.name}</h4>
    <p className="text-sm text-gray-600 dark:text-gray-300">{contactName}</p>
    <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mt-2">
      ${deal.value.toLocaleString()}
    </p>
  </div>
));

type CrmColumnProps = {
  stage: CrmStage;
  deals: CrmDeal[];
  contacts: Contact[];
};

const CrmColumn: React.FC<CrmColumnProps> = ({ stage, deals, contacts }) => {
    const stageColors: { [key in CrmStage]: string } = {
        'New': 'border-t-blue-500',
        'Qualified': 'border-t-yellow-500',
        'Proposal': 'border-t-purple-500',
        'Won': 'border-t-green-500',
    }
  return (
    <div className={`flex-1 min-w-[280px] bg-gray-100 dark:bg-gray-800 rounded-lg p-4 border-t-4 ${stageColors[stage]}`}>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{stage} ({deals.length})</h3>
      <div>
        {deals.map(deal => {
          const contact = contacts.find(c => c.id === deal.contactId);
          return <DealCard key={deal.id} deal={deal} contactName={contact?.name || 'Unknown Contact'} />;
        })}
      </div>
    </div>
  );
};

type CrmBoardProps = {
  deals: CrmDeal[];
  contacts: Contact[];
};

export const CrmBoard: React.FC<CrmBoardProps> = ({ deals, contacts }) => {
  const stages: CrmStage[] = ['New', 'Qualified', 'Proposal', 'Won'];

  const dealsByStage = (stage: CrmStage) => {
    return deals.filter(deal => deal.stage === stage);
  };

  return (
    <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">CRM Pipeline</h2>
        <div className="flex space-x-4 overflow-x-auto pb-4">
        {stages.map(stage => (
            <CrmColumn
            key={stage}
            stage={stage}
            deals={dealsByStage(stage)}
            contacts={contacts}
            />
        ))}
        </div>
    </div>
  );
};