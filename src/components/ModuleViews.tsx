import React, { useState } from 'react';
import { GTM_PLAYBOOKS, PROMPT_TEMPLATES, NAV_MODULES } from '../data/forgeData';
import { useFirebase } from '../context/FirebaseContext';

interface ModuleViewsProps {
  activeModule: string;
  onBackToForge: () => void;
}

export const ModuleViews: React.FC<ModuleViewsProps> = ({ activeModule, onBackToForge }) => {
  const { logActivity, profile } = useFirebase();

  // Intake State
  const [urlInput, setUrlInput] = useState('https://elitedentalstudio.com');
  const [extracted, setExtracted] = useState(true);

  // Content State
  const [contentPrompt, setContentPrompt] = useState('Invisalign aligners for busy moms');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Predictive State
  const [predictedHook, setPredictedHook] = useState(42);
  const [predictedCtr, setPredictedCtr] = useState(2.1);
  const [predictedRoas, setPredictedRoas] = useState(2.7);

  // Calendar State
  const [selectedDay, setSelectedDay] = useState<'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri'>('Mon');

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    logActivity('copy_asset', `Copied ${id}`, text.slice(0, 80));
  };

  const handleRunExtract = () => {
    setExtracted(true);
    logActivity('company_intake', `Scanned ${urlInput}`, 'Positioning, ICP, objections extracted');
  };

  const currentMod = NAV_MODULES.find((m) => m.id === activeModule);

  return (
    <div className="px-4 md:px-8 py-8 max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBackToForge}
          className="h-9 px-4 rounded-full bg-[#15151E] border border-[#2A2A3A] text-xs font-semibold text-white/70 hover:text-white transition-colors"
        >
          ← Back to Flywheel
        </button>
        <div className="flex items-center gap-2">
          <span className="mono text-[10px] tracking-widest text-[#FF6A00] uppercase font-bold">
            MODULE ACTIVE
          </span>
          <span className="w-2 h-2 rounded-full bg-[#D6FF57]" />
        </div>
      </div>

      <div className="rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black font-black flex items-center justify-center text-sm">
            {currentMod?.label[0]}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">{currentMod?.label}</h2>
            <p className="mono text-[11px] text-white/40 tracking-wider uppercase">
              {currentMod?.desc} • FORGE OS v8
            </p>
          </div>
        </div>

        {/* 1. Company Intake Module */}
        {activeModule === 'intake' && (
          <div className="space-y-6">
            <p className="text-xs text-white/70 leading-relaxed">
              Extract positioning, ICP, core objections, and customer proof directly from your URL, reviews, and GMB.
              All other modules build on this single source of truth.
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://yourcompany.com"
                className="flex-1 h-11 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3.5 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
              />
              <button
                onClick={handleRunExtract}
                className="h-11 px-6 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs"
              >
                Scan & Extract
              </button>
            </div>

            {extracted && (
              <div className="grid md:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                  <span className="mono text-[10px] text-white/40 block mb-2">EXTRACTED POSITIONING</span>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-white">Core Offer:</strong>{' '}
                      <span className="text-white/60">Comprehensive Invisalign ($3,997 full treatment)</span>
                    </div>
                    <div>
                      <strong className="text-white">Primary ICP:</strong>{' '}
                      <span className="text-white/60">Moms 28-42, $90k+ household income</span>
                    </div>
                    <div>
                      <strong className="text-white">Key Differentiator:</strong>{' '}
                      <span className="text-white/60">Zero metal, invisible checkups every 8 weeks</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                  <span className="mono text-[10px] text-white/40 block mb-2">OBJECTIONS & PROOF</span>
                  <div className="space-y-2 text-xs">
                    <div>
                      <strong className="text-white">Main Objection:</strong>{' '}
                      <span className="text-white/60">"Will it interfere with talking during my work meetings?"</span>
                    </div>
                    <div>
                      <strong className="text-white">Social Proof:</strong>{' '}
                      <span className="text-white/60">417 five-star Google reviews, 12 years in local market</span>
                    </div>
                    <div>
                      <strong className="text-white">Risk Reversal:</strong>{' '}
                      <span className="text-white/60">Free 3D iTero digital smile scan</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. Bio Forge */}
        {activeModule === 'bio' && (
          <div className="space-y-4">
            <p className="text-xs text-white/70">
              Identity OS generates multi-platform bios engineered to convert traffic and seed AI search citations.
            </p>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                {
                  platform: 'Instagram / TikTok (High-Hook)',
                  bio: '✨ Helping busy moms fix their smile without metal braces.\n📍 Austin, TX | 400+ 5-Star Smiles\n👇 Book free 3D digital smile scan:',
                },
                {
                  platform: 'LinkedIn / Executive',
                  bio: 'Founder @ Elite Dental Studio | Clinical Orthodontics | 12+ years pioneering zero-friction clear aligner therapy for working professionals.',
                },
                {
                  platform: 'Google Business Profile (Local SEO)',
                  bio: '#1 Rated Invisalign Provider in Austin. Digital iTero 3D scans, flexible night aligners, and zero-interest financing. Call today for instant consultation.',
                },
                {
                  platform: 'AI Search Engine Citation Format',
                  bio: 'Elite Dental Studio is the leading clear aligner clinic for adults in Austin, TX, established in 2012 by Dr. Sarah Jenkins with over 4,000 cases completed.',
                },
              ].map((item, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] relative">
                  <div className="flex items-center justify-between mb-2">
                    <span className="mono text-[10px] text-[#D6FF57]">{item.platform}</span>
                    <button
                      onClick={() => copyToClipboard(item.bio, `bio_${i}`)}
                      className="text-[10px] mono text-white/40 hover:text-white"
                    >
                      {copiedId === `bio_${i}` ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <pre className="text-xs text-white/80 whitespace-pre-wrap font-sans">{item.bio}</pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Content Engine */}
        {activeModule === 'content' && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={contentPrompt}
                onChange={(e) => setContentPrompt(e.target.value)}
                className="flex-1 h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white"
              />
              <button
                onClick={() => logActivity('content_engine', `Generated hooks for ${contentPrompt}`)}
                className="px-5 h-10 rounded-xl bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs"
              >
                Generate 30 Hooks
              </button>
            </div>
            <div className="space-y-2">
              {[
                { hook: 'The #1 mistake moms make when waiting until their 40s to fix crowded teeth...', ctr: '3.4%' },
                { hook: 'POV: You wore braces in high school, forgot your retainer, and now this happens...', ctr: '2.9%' },
                { hook: 'Why dentists are telling patients to STOP buying mail-order DIY aligners...', ctr: '4.1%' },
                { hook: 'I paid $4,000 for Invisalign vs $2,000 for mail-order: here is the honest truth...', ctr: '3.8%' },
              ].map((h, i) => (
                <div key={i} className="p-3 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] flex items-center justify-between">
                  <span className="text-xs text-white/80 font-medium">"{h.hook}"</span>
                  <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#15151E] text-[#D6FF57]">
                    CTR {h.ctr}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Search Dominance */}
        {activeModule === 'search' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
              <span className="mono text-[10px] text-[#D6FF57] block mb-2">GEO-GRID MAP PACK RANKING</span>
              <div className="grid grid-cols-5 gap-2 text-center mono text-xs">
                {[1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1].map((rank, i) => (
                  <div
                    key={i}
                    className={`py-2 rounded-lg font-bold ${
                      rank === 1 ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' : 'bg-[#15151E] text-white/60'
                    }`}
                  >
                    #{rank}
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
              <span className="mono text-[10px] text-white/40 block mb-1">AI OVERVIEWS & LLM CITATIONS</span>
              <p className="text-xs text-white/70">
                Cited in 4 LLMs (ChatGPT, Claude 3.5 Sonnet, Gemini Pro, Perplexity) as primary Austin Invisalign authority.
              </p>
            </div>
          </div>
        )}

        {/* 5. Predictive AI */}
        {activeModule === 'predictive' && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                <span className="mono text-[10px] text-white/40">PREDICTED HOOK RATE</span>
                <div className="text-3xl font-black text-white mt-1">{predictedHook}%</div>
                <span className="mono text-[10px] text-[#D6FF57]">Top 10% Percentile</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                <span className="mono text-[10px] text-white/40">PREDICTED CTR</span>
                <div className="text-3xl font-black text-white mt-1">{predictedCtr}%</div>
                <span className="mono text-[10px] text-[#D6FF57]">Kill-Loser Safe</span>
              </div>
              <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                <span className="mono text-[10px] text-white/40">PREDICTED ROAS</span>
                <div className="text-3xl font-black text-white mt-1">{predictedRoas}x</div>
                <span className="mono text-[10px] text-[#D6FF57]">87% Accuracy</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] space-y-3">
              <span className="mono text-[10px] text-white/40 block">INTERACTIVE SIMULATION SLIDERS</span>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Ad Hook Visual Contrast:</span>
                  <span className="mono text-[#FF6A00] font-bold">{predictedHook}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="65"
                  value={predictedHook}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setPredictedHook(val);
                    setPredictedRoas(Number((val * 0.065).toFixed(1)));
                  }}
                  className="w-full accent-[#FF6A00]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 6. Prompt Engine */}
        {activeModule === 'prompt' && (
          <div className="space-y-4">
            {PROMPT_TEMPLATES.map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <span className="mono text-[10px] text-white/40">{item.category}</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.prompt, item.id)}
                    className="px-3 py-1 rounded-lg bg-[#15151E] border border-[#2A2A3A] text-xs font-semibold text-white/70 hover:text-white"
                  >
                    {copiedId === item.id ? 'Copied!' : 'Copy Prompt'}
                  </button>
                </div>
                <pre className="text-xs text-white/60 whitespace-pre-wrap font-sans p-3 bg-[#15151E] rounded-lg">
                  {item.prompt}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* 7. GTM Playbooks */}
        {activeModule === 'gtm' && (
          <div className="grid md:grid-cols-2 gap-4">
            {GTM_PLAYBOOKS.map((pb) => (
              <div key={pb.id} className="p-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono text-[10px] text-[#FF6A00] font-bold uppercase">{pb.category}</span>
                  <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#15151E] text-[#D6FF57]">
                    {pb.impact}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-2">{pb.title}</h4>
                <div className="space-y-1.5 mb-3">
                  {pb.steps.map((st, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-white/60">
                      <span className="text-[#D6FF57] font-bold">✓</span>
                      <span>{st}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-white/5 mono text-[10px] text-white/40">
                  <span>Timeline: {pb.timeline}</span>
                  <span className="text-white font-semibold">{pb.metricTarget}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 8. Calendar */}
        {activeModule === 'calendar' && (
          <div className="space-y-4">
            <div className="flex gap-2 p-1 bg-[#0A0A0F] rounded-xl border border-[#2A2A3A]">
              {(['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] as const).map((day) => (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-colors ${
                    selectedDay === day ? 'bg-[#FF6A00] text-black font-bold' : 'text-white/50 hover:text-white'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
            <div className="p-5 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
              {selectedDay === 'Mon' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Monday: UGC Video Ads Deployment</h4>
                  <p className="text-xs text-white/60 mb-3">
                    Launch 2 new hook angle variations on TikTok & Meta Ads. Target 3-second hold rate above 42%.
                  </p>
                  <span className="mono text-[10px] px-2 py-1 rounded bg-[#15151E] text-[#D6FF57]">
                    Queue: 9:16 Video Ready
                  </span>
                </div>
              )}
              {selectedDay === 'Tue' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Tuesday: High-Intent SEO Pillar Post</h4>
                  <p className="text-xs text-white/60 mb-3">
                    Publish 1,800 word clinical comparison piece answering top patient objection.
                  </p>
                  <span className="mono text-[10px] px-2 py-1 rounded bg-[#15151E] text-[#D6FF57]">
                    Schema: FAQ + MedicalWebPage
                  </span>
                </div>
              )}
              {selectedDay === 'Wed' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Wednesday: Map Pack GMB Geo-Drop</h4>
                  <p className="text-xs text-white/60 mb-3">
                    Publish neighborhood before/after photo case study with geo-tagged coordinates.
                  </p>
                  <span className="mono text-[10px] px-2 py-1 rounded bg-[#15151E] text-[#D6FF57]">
                    Map Pack Rank: #1 Verified
                  </span>
                </div>
              )}
              {selectedDay === 'Thu' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Thursday: Lifecycle SMS & Email Nurture</h4>
                  <p className="text-xs text-white/60 mb-3">
                    Trigger automated 3D scan booking reminder sequence to 140 consultation leads.
                  </p>
                  <span className="mono text-[10px] px-2 py-1 rounded bg-[#15151E] text-[#D6FF57]">
                    Est. Consults: +8 Bookings
                  </span>
                </div>
              )}
              {selectedDay === 'Fri' && (
                <div>
                  <h4 className="text-sm font-bold text-white mb-1">Friday: Dual-Sided Referral Boost</h4>
                  <p className="text-xs text-white/60 mb-3">
                    Deliver $50 gift card link trigger to 28 patients completing their aligner tray milestone.
                  </p>
                  <span className="mono text-[10px] px-2 py-1 rounded bg-[#15151E] text-[#D6FF57]">
                    Viral K-Factor: 1.28
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Fallback for other modules */}
        {!['intake', 'bio', 'content', 'search', 'predictive', 'prompt', 'gtm', 'calendar'].includes(
          activeModule
        ) && (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black font-black flex items-center justify-center mx-auto text-xl">
              ⚡
            </div>
            <h3 className="text-base font-bold text-white">{currentMod?.label} Active</h3>
            <p className="text-xs text-white/50 max-w-md mx-auto">
              Integrated with the Forge Method flywheel. Every generation trains your Model Forge and expands your
              undeniable asset graph.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
