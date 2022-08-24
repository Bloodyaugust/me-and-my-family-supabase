import SupabaseProvider from './SupabaseContext';
import Feed from './feed/Feed';
import './App.css';

function App() {
  return (
    <div className="App">
      <SupabaseProvider>
        <Feed />
      </SupabaseProvider>
    </div>
  );
}

export default App;
