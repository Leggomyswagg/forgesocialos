import React from 'react';
import { NAV_MODULES } from '../data/forgeData';
import { useFirebase } from '../context/FirebaseContext';

interface SidebarProps {
  activeModule: string;
  onSelectModule: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeModule,
  onSelectModule,
  isOpen,
  onClose,
}) => {
  const { profile, userAssets } = useFirebase();

  return (
    <>
      <aside
        className={`fixed md:sticky top-[72px] z-40 h-[calc(100vh-72px)] w-[280px] lg:w-[300px] bg-[#0A0A0F] border-r border-[#2A2A3A] overflow-y-auto transition-transform md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:block shrink-0`}
      >
        <div className="p-4">
          {/* OS Summary card */}
          <div className="mb-5 p-4 rounded-2xl bg-[#15151E] border border-[#2A2A3A] relative overflow-hidden">
            <div className="flex items-center justify-between">
              <p className="mono text-[10px] tracking-[0.2em] text-white/40">NAVIGATION</p>
              <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#2A2A3A] text-white/60">
                14 MODULES
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-[1.5] text-white/70">
              One OS. Every surface. From prompt to compounding referral loop.
            </p>
            {profile && (
              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between mono text-[10px] text-white/40">
                <span>Forged Assets:</span>
                <span className="text-[#D6FF57] font-bold">{userAssets.length}</span>
              </div>
            )}
          </div>

          {/* Nav List */}
          <nav className="space-y-1">
            {NAV_MODULES.map((item) => {
              const active = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectModule(item.id);
                    onClose();
                  }}
                  className={`w-full text-left group relative flex items-center justify-between px-3 py-2.5 rounded-[14px] border transition-all ${
                    active
                      ? 'bg-[#15151E] border-[#2A2A3A] shadow-[0_0_0_1px_rgba(255,106,0,0.25)]'
                      : 'bg-transparent border-transparent hover:bg-[#15151E]/60 hover:border-[#2A2A3A]/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-7 h-7 rounded-[9px] flex items-center justify-center text-xs font-bold transition-colors ${
                        active
                          ? 'bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black'
                          : 'bg-[#15151E] border border-[#2A2A3A] text-white/40 group-hover:text-white/80'
                      }`}
                    >
                      {item.label[0]}
                    </div>
                    <div>
                      <div
                        className={`text-xs font-semibold leading-none flex items-center gap-1.5 ${
                          active ? 'text-white' : 'text-white/70'
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.hot && (
                          <span className="px-1.5 py-0.5 rounded-full text-[8px] font-black tracking-widest bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="mono text-[10px] text-white/30 mt-1">{item.desc}</div>
                    </div>
                  </div>
                  {active && <div className="w-1.5 h-1.5 rounded-full bg-[#FF6A00]" />}
                </button>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};
