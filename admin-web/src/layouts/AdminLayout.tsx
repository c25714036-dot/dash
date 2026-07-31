import React from 'react';
import { Sidebar } from '../components/common/Sidebar';
import { Header } from '../components/common/Header';
import { Breadcrumbs } from '../components/common/Breadcrumbs';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex text-[#F5F5F5] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 bg-[#0A0A0A]">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto bg-[#0A0A0A]">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
};
