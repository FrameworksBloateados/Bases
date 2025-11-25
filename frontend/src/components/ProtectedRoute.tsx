import {Navigate} from 'react-router-dom';
import {useAuth} from '../context/AuthContext';
import LoadingPage from './LoadingPage';
import type {JSX} from 'react';

export default function ProtectedRoute({children}: {children: JSX.Element}) {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
