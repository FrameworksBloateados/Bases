import React, { useState } from 'react';
import { PasswordField } from './PasswordField';
import { UsernameField } from './UsernameField';

type possibleTabs = 'info' | 'updatePassword' | 'updateUsername';

const UserInfoTab = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4">User Information</h3>
    <p className="text-slate-300">Username: JohnDoe</p>
    <p className="text-slate-300">Email: johndoe@example.com</p>
  </div>
);

const UpdatePasswordTab = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4">Update Password</h3>
    <PasswordField
      label="New Password"
      password=""
      onChangeHandler={() => {}}
    />
  </div>
);

const UpdateUsernameTab = () => (
  <div>
    <h3 className="text-xl font-semibold text-white mb-4">Update Username</h3>
    <UsernameField
      label="New Username"
      username=""
      onChangeHandler={() => {}}
    />
  </div>
);

const Dashboard = () => {
  const tabs = {
    info: {
      label: 'User Info',
      content: <UserInfoTab />,
    },
    updatePassword: {
      label: 'Update Password',
      content: <UpdatePasswordTab />,
    },
    updateUsername: {
      label: 'Update Username',
      content: <UpdateUsernameTab />,
    },
  };

  const [activeTab, setActiveTab] = useState<possibleTabs>('info');

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        {Object.entries(tabs).map(([key, tab]) => (
          <button
            key={key}
            className={`py-2 px-4 mb-2 text-left rounded-lg ${
              activeTab === key ? 'bg-slate-700' : 'hover:bg-slate-700'
            }`}
            onClick={() => setActiveTab(key as 'info' | 'updatePassword' | 'updateUsername')}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Dashboard;