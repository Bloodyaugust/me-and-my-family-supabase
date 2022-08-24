import SupabaseProvider from './SupabaseContext';
import Feed from './feed/Feed';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login/Login';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SupabaseProvider>
          <Routes>
            <Route path="/" element={<Feed />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </SupabaseProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
