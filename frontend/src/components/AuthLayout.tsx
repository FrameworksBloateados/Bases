import type {ReactNode} from 'react';

type AuthPageLayoutProps = {
  children: ReactNode;
};

export function AuthPageLayout({children}: AuthPageLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 animate-gradient relative overflow-hidden py-4 px-4 sm:px-0">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
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

      {children}
    </div>
  );
}

type AuthFormContainerProps = {
  children: ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export function AuthFormContainer({
  children,
  onSubmit,
}: AuthFormContainerProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="relative w-full max-w-md p-8 bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl rounded-2xl transition-all duration-300 hover:shadow-black/50"
    >
      {children}
    </form>
  );
}

type AuthFormHeaderProps = {
  icon: ReactNode;
  title: string;
  subtitle: string;
};

export function AuthFormHeader({icon, title, subtitle}: AuthFormHeaderProps) {
  return (
    <div className="text-center mb-8">
      <div className="inline-block p-3 bg-linear-to-r from-slate-600 to-slate-500 rounded-full mb-4">
        {icon}
      </div>
      <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">
        {title}
      </h2>
      <p className="text-slate-300 text-sm">{subtitle}</p>
    </div>
  );
}
