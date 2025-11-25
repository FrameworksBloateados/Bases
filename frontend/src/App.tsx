import './index.css';
import {LoginForm} from './components/LoginForm';
import {login} from './utils/auth';
import {useAuth} from './context/AuthContext';

export function App() {
  const {login: setAuthToken} = useAuth();

  const handleLogin = async (credentials: {
    email: string;
    password: string;
  }) => {
    const accessToken = await login(credentials);
    setAuthToken(accessToken);
  };

  return (
    <div className="app">
      <LoginForm onSubmit={handleLogin} />
    </div>
  );
}

export default App;
