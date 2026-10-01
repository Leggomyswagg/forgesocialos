import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { UserProfileModal } from './UserProfileModal';
import { FeedbackModal } from './FeedbackModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  activeModule: string;
  onSelectModule?: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, activeModule, onSelectModule }) => {
  const { user, profile, loginWithGoogle } = useFirebase();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 h-[72px] border-b border-[#2A2A3A] bg-[#0A0A0F]/80 glass flex items-center">
        <div className="w-full max-w-[1920px] mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Left Brand Area */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="md:hidden w-10 h-10 rounded-xl bg-[#15151E] border border-[#2A2A3A] flex items-center justify-center text-white/70"
            >
              ☰
            </button>
            <div
              onClick={() => onSelectModule?.('forge')}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] p-[1px] flex items-center justify-center shadow-[0_0_20px_rgba(255,106,0,0.25)]">
                <div className="w-full h-full bg-[#0A0A0F] rounded-[11px] flex items-center justify-center font-black text-transparent bg-clip-text bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-lg">
                  FS
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white">FORGESOCIAL</span>
                  <span className="mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#FF6A00]/20 text-[#FF6A00] border border-[#FF6A00]/30">
                    v8
                  </span>
                </div>
                <span className="mono text-[9px] tracking-[0.16em] text-white/40">THE NEW WAY • FORGE METHOD</span>
              </div>
            </div>
          </div>

          {/* Right Controls & Auth */}
          <div className="flex items-center gap-2.5">
            {/* Live Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 h-8 rounded-full bg-[#15151E] border border-[#2A2A3A]">
              <span className="w-2 h-2 rounded-full bg-[#D6FF57] animate-[pulse_1s_ease-in-out_infinite_alternate]" />
              <span className="mono text-[10px] text-white/70 tracking-wide">FORGE OS LIVE</span>
            </div>

            {/* Analytics Dashboard Trigger Button */}
            <button
              onClick={() => onSelectModule?.('analytics')}
              className={`h-9 px-3.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                activeModule === 'analytics'
                  ? 'bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold border-transparent shadow-[0_0_20px_rgba(255,106,0,0.25)]'
                  : 'bg-[#15151E] border-[#2A2A3A] text-white/80 hover:text-white hover:border-white/20'
              }`}
              title="Open Marketing Campaign Analytics"
            >
              <span>📊</span>
              <span className="hidden sm:inline">Analytics</span>
            </button>

            {/* Feedback Button */}
            <button
              onClick={() => setFeedbackModalOpen(true)}
              className="h-9 px-3.5 rounded-full bg-[#15151E] border border-[#2A2A3A] text-white/80 hover:text-white hover:border-white/20 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span>💬</span>
              <span className="hidden sm:inline">Feedback</span>
            </button>

            {/* Profile / Auth Button */}
            {user ? (
              <button
                onClick={() => setProfileModalOpen(true)}
                className="flex items-center gap-2 h-9 pl-1.5 pr-3 rounded-full bg-[#15151E] border border-[#2A2A3A] hover:border-white/20 transition-colors"
              >
                {profile?.photoURL || user.photoURL ? (
                  <img
                    src={profile?.photoURL || user.photoURL || ''}
                    alt="User"
                    className="w-6 h-6 rounded-full object-cover border border-white/20"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black text-[10px] font-bold flex items-center justify-center">
                    {profile?.displayName?.[0] || user.email?.[0] || 'U'}
                  </div>
                )}
                <span className="text-xs font-semibold text-white truncate max-w-[100px] hidden sm:inline">
                  {profile?.displayName || user.displayName || user.email?.split('@')[0]}
                </span>
              </button>
            ) : (
              <button
                onClick={loginWithGoogle}
                className="h-9 px-4 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(255,106,0,0.25)] flex items-center gap-1.5"
              >
                <span>Google Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* User Profile Modal */}
      <UserProfileModal isOpen={profileModalOpen} onClose={() => setProfileModalOpen(false)} />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={feedbackModalOpen} onClose={() => setFeedbackModalOpen(false)} />
    </>
  );
};
