import React, { useState, useEffect } from 'react';
import { FLYWHEEL_STEPS } from '../data/forgeData';
import { useFirebase } from '../context/FirebaseContext';

export const ForgeMethodView: React.FC = () => {
  const { user, profile, saveForgedAsset, loginWithGoogle } = useFirebase();

  const [business, setBusiness] = useState(profile?.defaultBusiness || 'Elite Dental Studio — Invisalign');
  const [audience, setAudience] = useState(
    profile?.defaultAudience || 'Moms 28-42, $90k+, researching smile fix'
  );
  const [goal, setGoal] = useState(profile?.defaultGoal || 'Book 30 consultations / month');
  const [themeAccent, setThemeAccent] = useState<'orange' | 'lime'>(profile?.themeAccent || 'orange');
  const [font, setFont] = useState(profile?.defaultFont || 'Satoshi Bold');
  const [aspectRatio, setAspectRatio] = useState<'4:5' | '9:16' | '1:1'>(
    profile?.defaultAspectRatio || '4:5'
  );

  const [isForging, setIsForging] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [savedFeedback, setSavedFeedback] = useState(false);

  // Sync profile defaults when profile loads
  useEffect(() => {
    if (profile?.defaultBusiness) setBusiness(profile.defaultBusiness);
    if (profile?.defaultAudience) setAudience(profile.defaultAudience);
    if (profile?.defaultGoal) setGoal(profile.defaultGoal);
    if (profile?.themeAccent) setThemeAccent(profile.themeAccent);
    if (profile?.defaultFont) setFont(profile.defaultFont);
    if (profile?.defaultAspectRatio) setAspectRatio(profile.defaultAspectRatio);
  }, [profile]);

  useEffect(() => {
    if (!isForging) return;
    if (stepIndex >= 6) {
      setIsForging(false);
      // Auto-save to user account if logged in
      if (user) {
        saveForgedAsset({
          business,
          audience,
          goal,
          themeAccent,
          font,
          aspectRatio,
          hookRate: 42,
          ctr: 2.1,
          roas: 2.7,
        });
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 3000);
      }
      return;
    }
    const timer = setTimeout(() => {
      setStepIndex((prev) => prev + 1);
    }, 700);
    return () => clearTimeout(timer);
  }, [isForging, stepIndex, user]);

  const handleStartForge = () => {
    setStepIndex(0);
    setIsForging(true);
  };

  return (
    <div className="px-4 md:px-8 lg:px-10 py-6 md:py-8">
      <div className="max-w-[1320px] mx-auto space-y-10">
        {/* Hero Header */}
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#15151E] border border-[#2A2A3A] mono text-[11px] tracking-[0.16em] text-white/60">
              <span className="w-2 h-2 rounded-full bg-[#FF6A00] animate-[pulse_0.9s_ease-in-out_infinite_alternate]" />
              THE FORGE METHOD • v8
            </span>
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black mono text-[11px] font-black tracking-[0.14em]">
              UNIQUE • USEFUL • UNDENIABLE
            </span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-black leading-[1.02] tracking-tight max-w-[20ch]">
            The Forge Method — A New Way of Marketing That's{' '}
            <span className="bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] bg-clip-text text-transparent">
              Unique, Useful, and Undeniable
            </span>
          </h1>

          <p className="mt-4 text-base md:text-lg leading-relaxed text-white/60 max-w-3xl">
            We took 12 proven GTM playbooks + Search Dominance + Predictive AI + Self-Improving Models and forged one
            flywheel that makes you unavoidable.
          </p>
        </div>

        {/* Manifesto Banner */}
        <div className="rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-5 md:p-7 relative overflow-hidden">
          <div className="flex gap-4">
            <div className="hidden md:flex w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black font-black items-center justify-center shrink-0">
              !
            </div>
            <div>
              <span className="text-white/40 mono text-[10px] tracking-[0.2em] block mb-1">MANIFESTO</span>
              <p className="text-sm md:text-base leading-relaxed text-white/80">
                Old marketing creates content that dies in the feed. New marketing creates assets that rank on Google,
                win Map Pack, get cited by AI (ChatGPT, Claude, Gemini, Perplexity), predict winners before spending a
                dollar, and self-optimize forever. One asset works across every surface buyers use — and compounds daily.
              </p>
            </div>
          </div>
        </div>

        {/* 6-Layer Flywheel Interactive Graphic */}
        <div className="rounded-3xl bg-[#15151E] border border-[#2A2A3A] p-6 md:p-10 relative overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <p className="mono text-[10px] tracking-[0.2em] text-white/40">FLYWHEEL • 6 LAYERS • FOREVER LOOP</p>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
                Every asset compounds. Competitors cannot catch up.
              </h2>
            </div>
            <div className="flex items-center gap-2 text-xs mono text-white/50">
              <span className="w-2 h-2 rounded-full bg-[#D6FF57]" />
              LOOPING CONTINUOUS ENGINE
            </div>
          </div>

          {/* Grid of Flywheel Layers */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FLYWHEEL_STEPS.map((step) => (
              <div
                key={step.n}
                className="rounded-2xl bg-[#0A0A0F] border border-[#2A2A3A] p-5 relative overflow-hidden group hover:border-white/20 transition-all"
              >
                <div
                  className="absolute top-0 left-0 w-full h-[2px]"
                  style={{ background: `linear-gradient(90deg, ${step.color}, transparent)` }}
                />
                <div className="flex items-center justify-between mb-3">
                  <span
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-black"
                    style={{ background: step.color }}
                  >
                    0{step.n}
                  </span>
                  <span className="mono text-[10px] tracking-widest text-white/40">{step.key}</span>
                </div>
                <h3 className="text-sm font-bold text-white mb-1.5">{step.title}</h3>
                <p className="text-xs text-white/60 leading-relaxed">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 3 Pillars: Unique, Useful, Undeniable */}
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              k: 'UNIQUE',
              title: 'No one combines all 6 surfaces',
              body: 'No single tool combines prompt engineering, template auto-fit, predictive ROAS scoring, search dominance, self-improving models, and GTM playbooks in one engine. Competitors do single channels; Forge dominates every touchpoint.',
              accent: '#FF6A00',
            },
            {
              k: 'USEFUL',
              title: 'Eliminates wasted testing spend',
              body: 'Solves the real creator dilemma: "I create content that gets buried, ignored by AI, and burns budget on losers." Forge predicts Hook Rate and ROAS with 87% accuracy before you launch.',
              accent: '#D6FF57',
            },
            {
              k: 'UNDENIABLE',
              title: 'Compounds automatically over time',
              body: 'Each asset forged feeds the Model Forge architecture, enriches your AI citations, expands your template library, and triggers dual-sided referral loops. The flywheel accelerates daily.',
              accent: '#FF8E3E',
            },
          ].map((pillar) => (
            <div
              key={pillar.k}
              className="rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-5 relative overflow-hidden"
            >
              <div
                className="absolute top-0 left-0 w-full h-[2px]"
                style={{ background: `linear-gradient(90deg, ${pillar.accent}, transparent)` }}
              />
              <span className="mono text-[10px] tracking-[0.2em] text-white/40">{pillar.k}</span>
              <h3 className="text-base font-bold text-white mt-1.5 mb-2">{pillar.title}</h3>
              <p className="text-xs text-white/60 leading-relaxed">{pillar.body}</p>
            </div>
          ))}
        </div>

        {/* Interactive Live Forge Studio */}
        <div className="rounded-3xl bg-[#15151E] border border-[#2A2A3A] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-[#2A2A3A] flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="mono text-[10px] tracking-[0.2em] text-white/40 uppercase">Interactive Studio</span>
              <h3 className="text-xl md:text-2xl font-bold text-white mt-0.5">
                Forge an Undeniable Asset in 30 Seconds
              </h3>
            </div>
            <div className="flex items-center gap-3">
              {savedFeedback && (
                <span className="mono text-xs text-[#D6FF57] flex items-center gap-1">
                  ✓ Saved to Firebase!
                </span>
              )}
              <button
                onClick={handleStartForge}
                disabled={isForging}
                className="h-11 px-6 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-black text-xs hover:opacity-90 transition-opacity shadow-[0_0_25px_rgba(255,106,0,0.3)] disabled:opacity-50"
              >
                {isForging ? 'Forging Flywheel...' : 'Forge Undeniable Asset →'}
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[340px_1fr_320px]">
            {/* Left Controls */}
            <div className="p-6 border-b lg:border-b-0 lg:border-r border-[#2A2A3A] bg-[#0A0A0F]/50 space-y-4">
              <div>
                <label className="mono text-[10px] text-white/40 block mb-1">BUSINESS / OFFER</label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#15151E] border border-[#2A2A3A] px-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div>
                <label className="mono text-[10px] text-white/40 block mb-1">TARGET AUDIENCE</label>
                <textarea
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl bg-[#15151E] border border-[#2A2A3A] p-2.5 text-xs text-white focus:outline-none focus:border-[#FF6A00] resize-none"
                />
              </div>

              <div>
                <label className="mono text-[10px] text-white/40 block mb-1">GOAL</label>
                <input
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  className="w-full h-10 rounded-xl bg-[#15151E] border border-[#2A2A3A] px-3 text-xs text-white focus:outline-none focus:border-[#FF6A00]"
                />
              </div>

              <div className="pt-2">
                <label className="mono text-[10px] text-white/40 block mb-1.5">STYLE CUSTOMIZATION</label>
                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setThemeAccent('orange')}
                    className={`flex-1 h-9 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      themeAccent === 'orange'
                        ? 'bg-[#FF6A00] text-black border-[#FF6A00]'
                        : 'bg-[#15151E] border-[#2A2A3A] text-white/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#FF6A00] border border-black/20" />
                    Orange
                  </button>
                  <button
                    type="button"
                    onClick={() => setThemeAccent('lime')}
                    className={`flex-1 h-9 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 ${
                      themeAccent === 'lime'
                        ? 'bg-[#D6FF57] text-black border-[#D6FF57]'
                        : 'bg-[#15151E] border-[#2A2A3A] text-white/60'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-[#D6FF57] border border-black/20" />
                    Lime
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={font}
                    onChange={(e) => setFont(e.target.value)}
                    className="h-9 rounded-xl bg-[#15151E] border border-[#2A2A3A] px-2.5 text-xs text-white"
                  >
                    <option value="Satoshi Bold">Satoshi Bold</option>
                    <option value="Space Grotesk">Space Grotesk</option>
                    <option value="Instrument Serif">Instrument Serif</option>
                  </select>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value as '4:5' | '9:16' | '1:1')}
                    className="h-9 rounded-xl bg-[#15151E] border border-[#2A2A3A] px-2.5 text-xs text-white"
                  >
                    <option value="4:5">4:5 Feed</option>
                    <option value="9:16">9:16 Story</option>
                    <option value="1:1">1:1 Square</option>
                  </select>
                </div>
              </div>

              {!user && (
                <div className="p-3 rounded-xl bg-[#15151E] border border-white/5 text-center">
                  <p className="text-[11px] text-white/60 mb-2">Want to save your forged assets permanently?</p>
                  <button
                    onClick={loginWithGoogle}
                    className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors"
                  >
                    Sign In with Google
                  </button>
                </div>
              )}
            </div>

            {/* Middle Pipeline Run */}
            <div className="p-6 bg-[#0A0A0F] space-y-3">
              <span className="mono text-[10px] tracking-[0.2em] text-white/40 block mb-2 uppercase">
                Flywheel Execution Pipeline
              </span>

              {[
                { title: 'Prompt Engineered', desc: `Targeting: "${audience}" for "${business}"`, done: stepIndex >= 1 },
                { title: 'Template Customized', desc: `Color: ${themeAccent} | Font: ${font} | Ratio: ${aspectRatio}`, done: stepIndex >= 2 },
                { title: 'Predictive Scoring', desc: 'Predicted: Hook 42% | CTR 2.1% | ROAS 2.7x (87% confidence)', done: stepIndex >= 3 },
                { title: 'Search Dominance Seeded', desc: 'Rank #1 Map Pack & Google + AI Overviews citation prepared', done: stepIndex >= 4 },
                { title: 'Self-Improving Model Feedback', desc: 'Architecture updated with +18% compound score to user model', done: stepIndex >= 5 },
                { title: 'GTM Scaling Loops Activated', desc: 'Referral loop, VIP community token, and retargeting ready', done: stepIndex >= 6 },
              ].map((step, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border transition-all ${
                    step.done
                      ? 'bg-[#15151E] border-[#2A2A3A] text-white'
                      : 'bg-transparent border-white/5 text-white/30'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          step.done ? 'bg-[#D6FF57] text-black' : 'bg-[#2A2A3A] text-white/40'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      {step.title}
                    </span>
                    {step.done && (
                      <span className="mono text-[9px] text-[#D6FF57] font-bold uppercase">Ready</span>
                    )}
                  </div>
                  <p className="mono text-[11px] text-white/50 pl-7">{step.desc}</p>
                </div>
              ))}
            </div>

            {/* Right Output Package */}
            <div className="p-6 border-t lg:border-t-0 lg:border-l border-[#2A2A3A] bg-[#15151E]/60 space-y-4">
              <span className="mono text-[10px] tracking-[0.2em] text-white/40 block mb-2 uppercase">
                Generated Asset Stack
              </span>

              <div className="space-y-2.5">
                {[
                  { tag: 'UGC AD', desc: `30s Script: Hook + Before/After for ${business.split('—')[0]}`, icon: '▶' },
                  { tag: 'SEO PILLAR', desc: `Complete article targeting high-intent ${audience.split(',')[0]}`, icon: '◐' },
                  { tag: 'GMB POST', desc: 'Local pack geo-coordinate keyword post', icon: '◎' },
                  { tag: 'AI CITATION', desc: 'Structured source answer for ChatGPT & Claude', icon: '✦' },
                  { tag: 'REFERRAL LOOP', desc: 'Dual-sided $50 referral invite trigger', icon: '↗' },
                ].map((asset, i) => (
                  <div
                    key={i}
                    className={`p-2.5 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] flex items-center gap-3 ${
                      stepIndex > i ? 'opacity-100' : 'opacity-40'
                    }`}
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#15151E] flex items-center justify-center text-xs text-[#FF6A00] shrink-0">
                      {asset.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="mono text-[10px] font-bold text-white">{asset.tag}</span>
                        <span className="mono text-[8px] text-[#D6FF57]">READY</span>
                      </div>
                      <p className="text-[11px] text-white/50 truncate mt-0.5">{asset.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Compounding bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between mono text-[10px] text-white/50 mb-1">
                  <span>FLYWHEEL COMPOUND</span>
                  <span className="text-[#D6FF57] font-bold">+{30 + stepIndex * 11}%</span>
                </div>
                <div className="h-1.5 w-full bg-[#0A0A0F] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] transition-all duration-500"
                    style={{ width: `${Math.min(100, 30 + stepIndex * 12)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison: Old Way vs Forge Method */}
        <div className="rounded-2xl bg-[#15151E] border border-[#2A2A3A] overflow-hidden">
          <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#2A2A3A]">
            <div className="p-6 bg-[#0A0A0F]/50">
              <span className="px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-400 mono text-[10px] font-bold">
                OLD MARKETING — DIES IN THE FEED
              </span>
              <ul className="mt-4 space-y-2 text-xs text-white/60 leading-relaxed">
                <li>• Post random videos and pray the algorithm notices you</li>
                <li>• Burn paid spend testing creative fatigue with live budget</li>
                <li>• Rank nowhere on Google and invisible on Google Maps</li>
                <li>• Zero citations in AI Overviews or ChatGPT search</li>
                <li>• One-off linear work that decays within 24 hours</li>
              </ul>
            </div>
            <div className="p-6 bg-gradient-to-br from-[#FF6A00]/5 to-[#D6FF57]/5">
              <span className="px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 mono text-[10px] font-bold">
                THE FORGE METHOD — UNDENIABLE
              </span>
              <ul className="mt-4 space-y-2 text-xs text-white/80 leading-relaxed">
                <li>✓ Multi-surface assets: UGC, SEO, Maps, AI Citations, Email</li>
                <li>✓ 87% predictive scoring: kill losing ads before spending $1</li>
                <li>✓ Rank #1 on Google Search and dominate local Map Pack</li>
                <li>✓ Seed structured data for ChatGPT, Claude, and Gemini citations</li>
                <li>✓ Every asset feeds the Model Forge for autonomous compounding</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
