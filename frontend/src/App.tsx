import './index.css';
import {useEffect, useState} from 'react';
import {useAuth} from './context/AuthContext';

type WhoAmIResponse = {
  userId: number;
  email: string;
  accessToken: string;
};

export function App() {
  const {authenticatedFetch, isAuthenticated, isLoading} = useAuth();
  const [userInfo, setUserInfo] = useState<WhoAmIResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || isLoading) return;

    const fetchWhoAmI = async () => {
      try {
        setError(null);
        const response = await authenticatedFetch(
          'http://ffb.dev.internal/api/v1/whoami',
          {method: 'GET'}
        );

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data: WhoAmIResponse = await response.json();
        setUserInfo(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load user info.'
        );
      }
    };

    fetchWhoAmI();
  }, [authenticatedFetch, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient">
        <p className="text-slate-200 text-lg font-semibold">Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient">
        <p className="text-slate-200 text-lg font-semibold">
          You are not authenticated. Please sign in.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"></div>
        <div
          className="absolute top-40 left-10 w-72 h-72 bg-slate-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '2s'}}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-600 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-float"
          style={{animationDelay: '4s'}}
        ></div>
      </div>

      <div className="relative w-full max-w-xl p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl">
        <div className="text-center mb-6">
          <div className="inline-block p-3 bg-linear-to-r from-slate-600 to-slate-500 rounded-full mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            Session Info
          </h1>
          <p className="text-slate-300 text-sm">
            Data from <span className="font-semibold">/api/v1/whoami</span>
          </p>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm">
            <p className="text-sm text-red-200 font-medium">{error}</p>
          </div>
        )}

        {userInfo ? (
          <div className="space-y-4">
            <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4 text-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm uppercase tracking-wide text-slate-400">
                  User ID
                </span>
                <span className="font-semibold text-white">{userInfo.userId}</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm uppercase tracking-wide text-slate-400">
                  Email
                </span>
                <span className="font-semibold text-white break-all">
                  {userInfo.email}
                </span>
              </div>
            </div>

            <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4 text-slate-100">
              <span className="text-sm uppercase tracking-wide text-slate-400 block mb-2">
                Access Token
              </span>
              <p className="font-mono text-xs text-slate-200 break-all max-h-40 overflow-y-auto bg-black/30 rounded-lg p-3">
                {userInfo.accessToken}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-slate-200 text-center">
            No user information available yet.
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
