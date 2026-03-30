'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import FormModal from '@/components/FormModal';
import { FileText, BarChart2, Database, ChevronRight } from 'lucide-react';

type TabId = 'form' | 'report' | 'data';

export interface FormItem {
  name: string;
  component?: React.ReactNode;
  href?: string;
}

interface SectionPageProps {
  title?: string;
  formItems: FormItem[];
  icon?: React.ReactNode;
  reportItems?: FormItem[];
}

export default function SectionPage({ title, formItems, icon, reportItems }: SectionPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabId>('form');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalContent, setModalContent] = useState<React.ReactNode>(null);

  const handleFormClick = (item: FormItem) => {
    if (item.href) {
      router.push(item.href);
      return;
    }
    if (!item.component) return;
    setModalTitle(item.name);
    setModalContent(item.component);
    setModalOpen(true);
  };

  const handleClose = () => {
    setModalOpen(false);
    setModalContent(null);
  };

  const tabs: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'form', label: 'Form', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'report', label: 'Report', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'data', label: 'Data', icon: <Database className="w-3.5 h-3.5" /> },
  ];

  const totalForms = formItems.length;
  const useTwoColumns = totalForms > 6;

  const getDisplayIndex = (i: number): number => {
    if (!useTwoColumns) return i + 1;
    const isEven = i % 2 === 0;
    if (isEven) {
      // Left column: 0,2,4,... → 1,2,3,...
      return i / 2 + 1;
    }
    const rows = Math.ceil(totalForms / 2);
    // Right column: 1,3,5,... → rows+1, rows+2,...
    return rows + (i - 1) / 2 + 1;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8 py-2">

        {/* Page header */}
        {title && (
          <div className="border-b border-zinc-200 dark:border-zinc-700 pb-6">
            <div className="flex items-center gap-3">
              {icon && (
                <span className="text-zinc-500 dark:text-zinc-400">
                  {icon}
                </span>
              )}
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
                {title}
              </h1>
            </div>
          </div>
        )}

        {/* Tabs — underline style */}
        <div className="flex justify-center">
          <div className="flex items-end gap-0 border-b border-zinc-200 dark:border-zinc-700 w-full max-w-xs justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-5 py-2.5 text-sm font-medium transition-colors relative -mb-px ${
                  activeTab === tab.id
                    ? 'text-zinc-900 dark:text-zinc-100 border-b-2 border-zinc-900 dark:border-zinc-100'
                    : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 border-b-2 border-transparent'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form tab */}
        {activeTab === 'form' && (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between px-1 mb-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-500">
                Form List
              </span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {totalForms} total
              </span>
            </div>

            <div className={useTwoColumns ? 'grid grid-cols-1 sm:grid-cols-2 gap-1' : 'flex flex-col gap-1'}>
              {formItems.map((item, i) => (
                <div
                  key={i}
                  onClick={() => handleFormClick(item)}
                  className={`group flex items-center gap-3 px-3.5 py-2.5 rounded-lg border transition-all duration-150 ${
                    (item.component || item.href)
                      ? 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/60 hover:border-zinc-400 dark:hover:border-zinc-500 hover:shadow-sm cursor-pointer'
                      : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/40 cursor-default'
                  }`}
                >
                  <span className={`w-6 text-right text-xs font-mono shrink-0 select-none ${
                    (item.component || item.href) ? 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300' : 'text-zinc-300 dark:text-zinc-700'
                  }`}>
                    {String(getDisplayIndex(i)).padStart(2, '0')}
                  </span>

                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    item.component ? 'bg-zinc-400 dark:bg-zinc-500 group-hover:bg-zinc-700 dark:group-hover:bg-zinc-300' : 'bg-zinc-200 dark:bg-zinc-700'
                  }`} />

                  <span className={`flex-1 text-sm leading-snug ${
                    (item.component || item.href)
                      ? 'text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-900 dark:group-hover:text-white font-medium'
                      : 'text-zinc-400 dark:text-zinc-600'
                  }`}>
                    {item.name}
                  </span>

                  {(item.component || item.href) ? (
                    <ChevronRight className="w-4 h-4 text-zinc-300 dark:text-zinc-600 group-hover:text-zinc-500 dark:group-hover:text-zinc-400 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5" />
                  ) : (
                    <span className="w-4 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report tab */}
        {activeTab === 'report' && (
          <>
            {reportItems && reportItems.length > 0 ? (
              <div className="mt-2">
                {/* When reportItems are provided, render the first report directly without a list container */}
                {reportItems[0]?.component}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <BarChart2 className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
                </div>
                <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Reports coming soon</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">This section will be available in a future update.</p>
              </div>
            )}
          </>
        )}

        {/* Data tab */}
        {activeTab === 'data' && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
              <Database className="w-6 h-6 text-zinc-400 dark:text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Data section coming soon</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">This section will be available in a future update.</p>
          </div>
        )}
      </div>

      <FormModal
        isOpen={modalOpen}
        onClose={handleClose}
        title={modalTitle}
      >
        {modalContent}
      </FormModal>
    </Layout>
  );
}
