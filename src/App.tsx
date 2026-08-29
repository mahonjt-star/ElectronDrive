import React from 'react';
import { CarFront, History, BarChart3, LogOut, Loader2 } from 'lucide-react';
import { useAuth, AuthProvider } from './hooks/AuthContext';
import { loginWithGoogle, logout } from './lib/firebase';
import { Button } from './components/ui/Button';
import { ActiveTripTab } from './components/ActiveTripTab';
import { HistoryTab } from './components/HistoryTab';
import { AnalyticsTab } from './components/AnalyticsTab';

function AppContent() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = React.useState<'log' | 'history' | 'analytics'>('log');

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center relative px-4">
        <div className="immersive-bg"></div>
        <div className="w-full max-w-md space-y-8 glass-card p-8 text-center shadow-xl">
          <div className="mx-auto w-16 h-16 flex items-center justify-center rounded-xl bg-[#00D1FF] rotate-[15deg]">
            <CarFront className="h-8 w-8 text-black -rotate-[15deg]" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ELECTRON<span className="text-[#00D1FF]">DRIVE</span></h1>
            <p className="mt-2 text-slate-400">BYD Seal EV Trip & Efficiency Tracker</p>
          </div>
          <Button onClick={loginWithGoogle} className="w-full btn-primary" size="lg">
            Sign in with Google
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full flex-col font-sans overflow-hidden relative">
      <div className="immersive-bg"></div>
      
      <header className="relative z-10 flex h-20 items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-black/20 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center rounded-md bg-[#00D1FF] rotate-[15deg]">
            <CarFront className="h-5 w-5 text-black -rotate-[15deg]" />
          </div>
          <h1 className="text-xl font-bold tracking-tight hidden sm:block">ELECTRON<span className="text-[#00D1FF]">DRIVE</span></h1>
        </div>
        
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            CLOUD SYNC ACTIVE
          </div>
          <div className="flex items-center gap-3 glass-card px-3 py-1.5 sm:px-4 sm:py-2">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-slate-700 flex items-center justify-center text-[10px] sm:text-xs overflow-hidden">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                user.displayName?.substring(0, 2).toUpperCase() || 'U'
              )}
            </div>
            <span className="text-xs sm:text-sm font-semibold hidden sm:inline">{user.displayName || 'User'}</span>
            <button onClick={logout} className="p-1 hover:text-[#00D1FF] transition-colors ml-1">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 mb-20 overflow-y-auto no-scrollbar">
        {activeTab === 'log' && <ActiveTripTab />}
        {activeTab === 'history' && <HistoryTab />}
        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-20 bg-black/40 border-t border-white/5 pb-safe backdrop-blur-lg">
        <div className="flex h-16 max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('log')}
            className={`flex flex-1 flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'log' ? 'text-[#00D1FF]' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <CarFront className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Log Trip</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex flex-1 flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'history' ? 'text-[#00D1FF]' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <History className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex flex-1 flex-col items-center justify-center space-y-1 transition-colors ${
              activeTab === 'analytics' ? 'text-[#00D1FF]' : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <BarChart3 className="h-6 w-6" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Analytics</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
