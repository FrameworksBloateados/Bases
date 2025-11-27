import React, { useState } from 'react';
import { PasswordField } from './PasswordField';
import { UsernameField } from './UsernameField';

type possibleTabs = 'info' | 'updatePassword' | 'updateUsername | ' | 'addBalance' | 'matches';

const examplePlayers = [
    {
      "id": 201,
      "name": "broky",
      "team_id": 1
    },
    {
      "id": 202,
      "name": "m0NESY",
      "team_id": 3
    },
    {
      "id": 203,
      "name": "ZywOo",
      "team_id": 4
    },
    {
      "id": 204,
      "name": "donk",
      "team_id": 5
    },
    {
      "id": 205,
      "name": "electroNic",
      "team_id": 2
    }
  ]
  


const exampleMatches = [
    {
      "id": 101,
      "team_a_id": 1,
      "team_b_id": 3,
      "match_date": "2025-12-04T19:30Z"
    },
    {
      "id": 102,
      "team_a_id": 5,
      "team_b_id": 2,
      "match_date": "2026-01-15T14:45Z"
    },
    {
      "id": 103,
      "team_a_id": 4,
      "team_b_id": 1,
      "match_date": "2025-12-28T20:15Z"
    },
    {
      "id": 104,
      "team_a_id": 3,
      "team_b_id": 6,
      "match_date": "2026-07-01T12:00Z"
    },
    {
      "id": 105,
      "team_a_id": 2,
      "team_b_id": 4,
      "match_date": "2026-03-08T18:05Z"
    }
];

const UserInfoTab = () => (
  <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-black/50">
    <h3 className="text-2xl font-bold text-white mb-6">User Information</h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <div>
          <p className="text-sm text-slate-400">Username</p>
          <p className="text-lg text-white font-semibold">JohnDoe</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12H8m8-4H8m8 8H8m-2-6a2 2 0 012-2h12a2 2 0 012 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
        </svg>
        <div>
          <p className="text-sm text-slate-400">Email</p>
          <p className="text-lg text-white font-semibold">johndoe@example.com</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <p className="text-sm text-slate-400">Balance</p>
          <p className="text-lg text-green-400 font-semibold">$1,234.56</p>
        </div>
      </div>
    </div>
  </div>
);

const UpdatePasswordTab = () => (
  <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-black/50">
    <h3 className="text-2xl font-bold text-white mb-6">Change Password</h3>
    <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <PasswordField
        label="New Password"
        password=""
        onChangeHandler={() => {}}
      />
      <button
        type="submit"
        className="w-full py-3 mt-2 font-bold text-white bg-slate-800 hover:bg-slate-600 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 cursor-pointer"
      >
        Update Password
      </button>
    </form>
  </div>
);

const UpdateUsernameTab = () => (
  <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-black/50">
    <h3 className="text-2xl font-bold text-white mb-6">Change Username</h3>
    <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <UsernameField
        label="New Username"
        username=""
        onChangeHandler={() => {}}
      />
      <button
        type="submit"
        className="w-full py-3 mt-2 font-bold text-white bg-slate-800 hover:bg-slate-600 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 cursor-pointer"
      >
        Update Username
      </button>
    </form>
  </div>
);

const AddBalanceTab = () => (
  <div className="max-w-lg mx-auto bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-black/50">
    <h3 className="text-2xl font-bold text-white mb-6">Add Balance</h3>
    <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
      <label className="text-sm text-slate-400" htmlFor="amount">Amount</label>
      <input
        type="number"
        id="amount"
        placeholder="$0.00"
        className="w-full px-4 py-3 bg-white/20 text-white placeholder-slate-400 border border-white/30 rounded-lg focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/50 transition-all duration-200"
      />
      <button
        type="submit"
        className="w-full py-3 mt-2 font-bold text-white bg-slate-800 hover:bg-slate-600 rounded-lg shadow-lg hover:shadow-xl transition-colors duration-300 active:scale-99 cursor-pointer"
      >
        Agregar ingresos
      </button>
    </form>
  </div>
);

const GenericTableTab = ({ data, title }: { data: any[]; title: string }) => {
  const columns = Object.keys(data[0] || {});

  return (
    <div className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl p-8 transition-all duration-300 hover:shadow-black/50">
      <h3 className="text-2xl font-bold text-white mb-6">{title}</h3>
      <div className="flex justify-end mb-4">
        <button
          className="px-4 py-2 text-sm font-semibold text-green-400 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
        >
          Load Data
        </button>
      </div>
      <table className="w-full text-left text-sm text-white border-collapse border border-slate-600">
        <thead className="bg-slate-700">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-2 border-b border-slate-600">{column}</th>
            ))}
            <th className="px-4 py-2 border-b border-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={`${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-700'} hover:bg-slate-600 transition-colors border-b border-slate-600`}>
              {columns.map((column) => (
                <td key={column} className="px-4 py-2">{row[column]}</td>
              ))}
              <td className="px-4 py-2 flex gap-2">
                <button
                  className="px-3 py-1 text-sm font-semibold text-blue-400 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 text-sm font-semibold text-red-400 bg-slate-700 hover:bg-slate-600 rounded-lg shadow-md transition-colors duration-200 cursor-pointer"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

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
    addBalance: {
      label: 'Add Balance',
      content: <AddBalanceTab />, 
    },
    matches: {
      label: 'Matches',
      content: <GenericTableTab data={exampleMatches} title='Matches' />,
    }
    ,
    players: {
      label: 'Players',
      content: <GenericTableTab data={examplePlayers} title='Players' />,
    },
  };

  const [activeTab, setActiveTab] = useState<possibleTabs>('info');

  return (
    <div className="min-h-screen flex bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 bg-slate-800 text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        {Object.entries(tabs).map(([key, tab], index) => (
          <>
            {key === 'matches' && <hr className="my-4 border-slate-600" />}
            <button
              key={key}
              className={`py-2 px-4 mb-2 text-left rounded-lg ${
                activeTab === key ? 'bg-slate-700' : 'hover:bg-slate-700'
              }`}
              onClick={() => setActiveTab(key as possibleTabs)}
            >
              {tab.label}
            </button>
          </>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">{tabs[activeTab].content}</div>
    </div>
  );
};

export default Dashboard;