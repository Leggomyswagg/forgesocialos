import React, { useState } from 'react';
import { FirebaseProvider } from './context/FirebaseContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ForgeMethodView } from './components/ForgeMethodView';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { ModuleViews } from './components/ModuleViews';

export default function App() {
  const [activeModule, setActiveModule] = useState('forge');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <FirebaseProvider>
      <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-[#FF6A00]/30 selection:text-white antialiased flex flex-col">
        {/* Main Sticky Header with Auth & Feedback */}
        <Header
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          activeModule={activeModule}
          onSelectModule={(id) => setActiveModule(id)}
        />

        {/* Core Layout */}
        <div className="pt-[72px] flex flex-1 w-full max-w-[1920px] mx-auto">
          {/* Navigation Sidebar */}
          <Sidebar
            activeModule={activeModule}
            onSelectModule={(id) => setActiveModule(id)}
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Viewport Content */}
          <main className="flex-1 min-w-0 pb-16">
            {activeModule === 'forge' ? (
              <ForgeMethodView />
            ) : activeModule === 'analytics' ? (
              <AnalyticsDashboard onBackToForge={() => setActiveModule('forge')} />
            ) : (
              <ModuleViews
                activeModule={activeModule}
                onBackToForge={() => setActiveModule('forge')}
              />
            )}
          </main>
        </div>

        {/* Footer */}
        <footer className="border-t border-[#2A2A3A] py-4 px-6 flex flex-wrap items-center justify-between gap-3 bg-[#0A0A0F] mono text-[10px] text-white/30 z-20">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6FF57]" />
            <span>FORGESOCIAL v8 • THE FORGE METHOD • UNIQUE • USEFUL • UNDENIABLE</span>
          </div>
          <div className="flex items-center gap-4">
            <span>FIRESTORE ENTERPRISE BACKED</span>
            <span>GOOGLE AUTH INTEGRATED</span>
          </div>
        </footer>
      </div>
    </FirebaseProvider>
  );
}
