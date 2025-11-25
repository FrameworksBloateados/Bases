import type {JSX} from 'react';

export default function LoadingPage(): JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-slate-500/30" />
        <div className="absolute inset-0 rounded-full border-4 border-t-slate-100 border-r-slate-300 border-b-transparent border-l-transparent animate-spin" />
      </div>
    </div>
  );
}
