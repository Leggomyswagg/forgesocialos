import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    profile,
    updatePreferences,
    logout,
    userActivities,
    userAssets,
  } = useFirebase();

  const [activeTab, setActiveTab] = useState<'profile' | 'activities' | 'assets'>('profile');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [themeAccent, setThemeAccent] = useState<'orange' | 'lime'>(profile?.themeAccent || 'orange');
  const [defaultFont, setDefaultFont] = useState(profile?.defaultFont || 'Satoshi Bold');
  const [defaultAspectRatio, setDefaultAspectRatio] = useState<'4:5' | '9:16' | '1:1'>(
    profile?.defaultAspectRatio || '4:5'
  );
  const [defaultBusiness, setDefaultBusiness] = useState(profile?.defaultBusiness || '');
  const [defaultAudience, setDefaultAudience] = useState(profile?.defaultAudience || '');
  const [defaultGoal, setDefaultGoal] = useState(profile?.defaultGoal || '');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updatePreferences({
        displayName: displayName.trim(),
        themeAccent,
        defaultFont,
        defaultAspectRatio,
        defaultBusiness: defaultBusiness.trim(),
        defaultAudience: defaultAudience.trim(),
        defaultGoal: defaultGoal.trim(),
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    } catch (err) {
      console.error('Error saving profile:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 glass">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A3A] pb-4 mb-4">
          <div className="flex items-center gap-3">
            {profile?.photoURL || user?.photoURL ? (
              <img
                src={profile?.photoURL || user?.photoURL || ''}
                alt="Avatar"
                className="w-10 h-10 rounded-full border border-white/20 object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black font-black flex items-center justify-center text-sm">
                {profile?.displayName?.[0] || user?.email?.[0] || 'U'}
              </div>
            )}
            <div>
              <span className="mono text-[10px] tracking-[0.2em] text-white/40 uppercase">User Profile & OS Tracker</span>
              <h3 className="text-base font-bold text-white leading-tight">
                {profile?.displayName || user?.displayName || 'Forge Operator'}
              </h3>
              <p className="mono text-[11px] text-white/40 truncate max-w-xs">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={logout}
              className="px-3 py-1.5 rounded-full bg-[#0A0A0F] border border-red-500/30 text-red-400 hover:bg-red-950/40 text-xs font-semibold transition-colors"
            >
              Sign Out
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[#0A0A0F] border border-[#2A2A3A] flex items-center justify-center text-white/50 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-[#0A0A0F] rounded-xl border border-[#2A2A3A] mb-5">
          {[
            { id: 'profile', label: 'Preferences & ICP' },
            { id: 'activities', label: `Activity Log (${userActivities.length})` },
            { id: 'assets', label: `Saved Assets (${userAssets.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'profile' | 'activities' | 'assets')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#15151E] text-white shadow-sm'
                  : 'text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSave} className="space-y-4">
              {savedSuccess && (
                <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs">
                  Preferences saved to Firebase successfully!
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">DISPLAY NAME</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                  />
                </div>

                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">THEME ACCENT</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setThemeAccent('orange')}
                      className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        themeAccent === 'orange'
                          ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                          : 'bg-[#0A0A0F] border-[#2A2A3A] text-white/60'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00] border border-black/20" />
                      Orange
                    </button>
                    <button
                      type="button"
                      onClick={() => setThemeAccent('lime')}
                      className={`h-10 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                        themeAccent === 'lime'
                          ? 'bg-[#D6FF57] text-black border-[#D6FF57]'
                          : 'bg-[#0A0A0F] border-[#2A2A3A] text-white/60'
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-[#D6FF57] border border-black/20" />
                      Lime
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">DEFAULT TYPOGRAPHY</label>
                  <select
                    value={defaultFont}
                    onChange={(e) => setDefaultFont(e.target.value)}
                    className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  >
                    <option value="Satoshi Bold">Satoshi Bold</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Instrument Serif">Instrument Serif</option>
                  </select>
                </div>

                <div>
                  <label className="mono text-[10px] text-white/50 block mb-1">DEFAULT ASPECT RATIO</label>
                  <select
                    value={defaultAspectRatio}
                    onChange={(e) => setDefaultAspectRatio(e.target.value as '4:5' | '9:16' | '1:1')}
                    className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
                  >
                    <option value="4:5">4:5 (Instagram / Facebook)</option>
                    <option value="9:16">9:16 (TikTok / Reels / Shorts)</option>
                    <option value="1:1">1:1 (Square Feed / Carousel)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mono text-[10px] text-white/50 block mb-1">DEFAULT BUSINESS / OFFER</label>
                <input
                  type="text"
                  value={defaultBusiness}
                  onChange={(e) => setDefaultBusiness(e.target.value)}
                  placeholder="E.g., Elite Dental Studio — Invisalign"
                  className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="mono text-[10px] text-white/50 block mb-1">TARGET AUDIENCE PROFILE</label>
                <textarea
                  value={defaultAudience}
                  onChange={(e) => setDefaultAudience(e.target.value)}
                  placeholder="E.g., Working moms 28-42, $90k+ household income, researching smile fix"
                  rows={2}
                  className="w-full rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-3 text-xs text-white focus:outline-none focus:border-[#FF6A00] resize-none"
                />
              </div>

              <div>
                <label className="mono text-[10px] text-white/50 block mb-1">PRIMARY GOAL</label>
                <input
                  type="text"
                  value={defaultGoal}
                  onChange={(e) => setDefaultGoal(e.target.value)}
                  placeholder="E.g., Book 30 high-ticket consultations / month"
                  className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="mono text-[10px] text-white/40">
                  Total Forged Assets: <strong className="text-white">{profile?.forgedAssetsCount || 0}</strong>
                </span>
                <button
                  type="submit"
                  disabled={saving}
                  className="h-10 px-6 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  {saving ? 'Saving...' : 'Save Preferences'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'activities' && (
            <div className="space-y-3">
              {userActivities.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-xs">
                  No activity recorded yet. Forge an asset or run a playbook to build your timeline.
                </div>
              ) : (
                userActivities.map((act) => (
                  <div key={act.id} className="p-3 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-[#15151E] border border-white/10 flex items-center justify-center text-xs text-[#FF6A00] shrink-0 mt-0.5">
                      ⚡
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white">{act.title}</h4>
                        <span className="mono text-[9px] text-white/40">
                          {new Date(act.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {act.details && <p className="text-[11px] text-white/50 mt-0.5">{act.details}</p>}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'assets' && (
            <div className="space-y-3">
              {userAssets.length === 0 ? (
                <div className="text-center py-10 text-white/40 text-xs">
                  No saved assets yet. Use the Forge Method generator to create your first undeniable asset package.
                </div>
              ) : (
                userAssets.map((asset) => (
                  <div key={asset.id} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-xs font-black text-white">{asset.business}</h4>
                      <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#15151E] border border-white/10 text-[#D6FF57]">
                        ROAS {asset.roas || '2.7'}x
                      </span>
                    </div>
                    {asset.audience && (
                      <p className="text-[11px] text-white/60 mb-2">
                        <span className="mono text-[10px] text-white/30">ICP:</span> {asset.audience}
                      </p>
                    )}
                    <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-[#15151E] border border-white/5 text-center mono text-[10px]">
                      <div>
                        <span className="text-white/40 block">HOOK</span>
                        <span className="font-bold text-white">{asset.hookRate || 42}%</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">CTR</span>
                        <span className="font-bold text-white">{asset.ctr || 2.1}%</span>
                      </div>
                      <div>
                        <span className="text-white/40 block">RATIO</span>
                        <span className="font-bold text-white">{asset.aspectRatio || '4:5'}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
