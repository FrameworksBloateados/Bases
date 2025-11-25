import './index.css';
import {LoginForm} from './components/LoginForm';
import {login} from './utils/auth';

export function App() {
  return (
    <div className="app">
      <LoginForm onSubmit={login} />
    </div>
  );
}

export default App;
