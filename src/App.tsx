import React, { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatInterface from './components/ChatInterface';
import Dashboard from './components/Dashboard';
import Facilities from './components/Facilities';
import InvoiceManagement from './components/InvoiceManagement';

function App() {
  const [activeTab, setActiveTab] = useState('chat');

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'chat':
        return <ChatInterface />;
      case 'dashboard':
        return <Dashboard />;
      case 'facilities':
        return <Facilities />;
      case 'invoices':
        return <InvoiceManagement />;
      case 'alerts':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900">Alert Management</h2>
            <p className="text-gray-600 mt-1">Monitor and manage energy alerts and notifications</p>
            <div className="mt-8 bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">Alert management interface coming soon...</p>
            </div>
          </div>
        );
      default:
        return <ChatInterface />;
    }
  };

  return (
    <div className="h-screen bg-gray-100 flex flex-col">
      <Header />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        <main className="flex-1 overflow-auto">
          {renderActiveComponent()}
        </main>
      </div>
    </div>
  );
}

export default App;