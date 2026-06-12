import { useState } from 'react'
import { Sidebar } from './components/Sidebar'
import { DashboardHome } from './components/DashboardHome'
import { NormalizationLab } from './components/NormalizationLab'
import { DataQuestView } from './components/DataQuestView'
import { GamesView } from './components/GamesView'
import { LeaderboardView } from './components/LeaderboardView'
import { AuthView } from './components/AuthView'
import { useAuthStore } from './store/authStore'
import type { ViewType } from './types'
import './index.css'

function App() {
  const [currentView, setCurrentView] = useState<ViewType>('dashboard')
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (!isAuthenticated) {
    return <AuthView />
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':     return <DashboardHome onNavigate={setCurrentView} />
      case 'normalization': return <NormalizationLab />
      case 'dataquest':     return <DataQuestView />
      case 'games':         return <GamesView />
      case 'leaderboard':   return <LeaderboardView />
      default:              return <DashboardHome onNavigate={setCurrentView} />
    }
  }

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="main-content flex-1">
        <div className="animate-fade-in" key={currentView}>
          {renderView()}
        </div>
      </main>
    </div>
  )
}

export default App
