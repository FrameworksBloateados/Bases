import React, { useState } from 'react';
import { PasswordField } from './PasswordField';
import { UsernameField } from './UsernameField';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState<'info' | 'updatePassword' | 'updateUsername'>('info');

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <button
          className={`py-2 px-4 mb-2 text-left rounded-lg ${
            activeTab === 'info' ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
          onClick={() => setActiveTab('info')}
        >
          User Info
        </button>
        <button
          className={`py-2 px-4 mb-2 text-left rounded-lg ${
            activeTab === 'updatePassword' ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
          onClick={() => setActiveTab('updatePassword')}
        >
          Update Password
        </button>
        <button
          className={`py-2 px-4 text-left rounded-lg ${
            activeTab === 'updateUsername' ? 'bg-slate-700' : 'hover:bg-slate-700'
          }`}
          onClick={() => setActiveTab('updateUsername')}
        >
          Update Username
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        {activeTab === 'info' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">User Information</h3>
            <p className="text-slate-300">Username: JohnDoe</p>
            <p className="text-slate-300">Email: johndoe@example.com</p>
          </div>
        )}

        {activeTab === 'updatePassword' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Update Password</h3>
            <PasswordField
              label="New Password"
              password=""
              onChangeHandler={() => {}}
            />
          </div>
        )}

        {activeTab === 'updateUsername' && (
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Update Username</h3>
            <UsernameField
              label="New Username"
              username=""
              onChangeHandler={() => {}}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;