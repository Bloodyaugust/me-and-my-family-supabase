import SupabaseProvider from './SupabaseContext';
import Feed from './feed/Feed';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './login/Login';
import Main from './main/Main';
import Profile from './profile/Profile';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <SupabaseProvider>
          <Routes>
            <Route path="/" element={<Main />}>
              <Route element={<Feed />} index />
              <Route path="profile" element={<Profile />} />
            </Route>
            <Route path="/login" element={<Login />} />
          </Routes>
        </SupabaseProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
