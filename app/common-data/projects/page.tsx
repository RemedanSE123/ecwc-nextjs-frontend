'use client';

import Layout from '@/components/Layout';
import ProjectManager from '@/components/common-data/ProjectManager';

export default function CommonDataProjectsPage() {
  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6 py-2">
        <div className="border-b border-zinc-200 dark:border-zinc-700 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            Projects (Location + Status)
          </h1>
        </div>
        <ProjectManager />
      </div>
    </Layout>
  );
}
