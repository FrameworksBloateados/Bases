import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import type {JSX} from 'react';
import {useState, useEffect} from 'react';

export default function ProtectedRoute({children}: {children: JSX.Element}) {
  const {isAuthenticated, isLoading} = useAuth();
  const [showLoading, setShowLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      // Start fading out loading page
      setShowLoading(false);
      // Start fading in content after a brief delay
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isAuthenticated && !isLoading) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Loading page - fades out */}
      <div
        className={`fixed inset-0 transition-opacity duration-500 ${
          showLoading ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <LoadingPage />
      </div>

      {/* Content - fades in */}
      <div
        className={`transition-opacity duration-700 ${
          showContent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>
    </div>
  );
}
