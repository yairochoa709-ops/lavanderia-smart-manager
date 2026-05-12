import React from 'react';
import Sidebar from './components/Sidebar';
import Reception from './pages/Reception';

function App() {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <Reception />
      </main>
    </div>
  );
}

export default App;
