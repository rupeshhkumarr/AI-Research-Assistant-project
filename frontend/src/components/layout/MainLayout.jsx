import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ToastContainer } from '../common/ToastContainer';

export const MainLayout = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-main text-text-main transition-colors duration-300">
      <Sidebar />
      <div className="flex-1 flex flex-col pl-64 w-full">
        <Navbar />
        <main className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
};
