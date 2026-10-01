import { NavModule, FlywheelStep, AssetPackageItem, GtmPlaybookItem, PromptTemplate } from '../types';

export const NAV_MODULES: NavModule[] = [
  { id: 'forge', label: 'Forge Method', desc: 'The flywheel', hot: true },
  { id: 'analytics', label: 'Analytics Dashboard', desc: 'Campaign ROI & Metrics', hot: true },
  { id: 'intake', label: 'Company Intake', desc: 'Source truth' },
  { id: 'bio', label: 'Bio Forge', desc: 'Identity OS' },
  { id: 'content', label: 'Content Engine', desc: 'Ideas → assets' },
  { id: 'ugc', label: 'UGC Studio', desc: 'Creator ads' },
  { id: 'animation', label: 'Animation Studio', desc: 'Motion system' },
  { id: 'search', label: 'Search Dominance', desc: 'Rank everywhere' },
  { id: 'predictive', label: 'Predictive', desc: '87% accuracy' },
  { id: 'model', label: 'Model Forge', desc: 'Self-improving' },
  { id: 'prompt', label: 'Prompt Engine', desc: 'Converts + ranks' },
  { id: 'templates', label: 'Template Library', desc: 'Custom fit' },
  { id: 'gtm', label: 'GTM Playbook', desc: '12 playbooks' },
  { id: 'adlab', label: 'Ad Lab', desc: 'Test winners' },
  { id: 'calendar', label: 'Calendar', desc: 'Ship daily' },
];

export const FLYWHEEL_STEPS: FlywheelStep[] = [
  { n: 1, key: 'FORGE', title: 'Prompt Engine', detail: 'Prompt that converts, ranks, gets cited', color: '#FF6A00', icon: '◐' },
  { n: 2, key: 'TEMPLATE', title: 'Template Library', detail: 'Pre-built reusable, customizable by color/font/size/style', color: '#D6FF57', icon: '◑' },
  { n: 3, key: 'PREDICT', title: 'Predictive Performance', detail: 'Hook rate, CTR, CVR, ROAS 87% before spend', color: '#FF6A00', icon: '◒' },
  { n: 4, key: 'RANK', title: 'Search Dominance', detail: 'Create. Rank Google. Win Map Pack. Get Cited in AI.', color: '#D6FF57', icon: '◓' },
  { n: 5, key: 'SELF-IMPROVE', title: 'Model Forge', detail: 'Autonomously propose, evaluate, refine architectures', color: '#FF6A00', icon: '◎' },
  { n: 6, key: 'SCALE', title: 'GTM Playbook', detail: 'Referral + Whitelisting + Community + Email + PLG', color: '#D6FF57', icon: '⦿' }
];

export const GTM_PLAYBOOKS: GtmPlaybookItem[] = [
  { id: 'referral', title: 'Referral Loop Engine', category: 'Viral Growth', impact: '+34% MoM', timeline: 'Week 1-2', steps: ['Incentivize dual-sided rewards', 'Automate post-purchase WhatsApp/SMS invite', 'Leaderboard & VIP tier unlock'], metricTarget: 'Viral Coeff > 1.25' },
  { id: 'whitelisting', title: 'Creator Whitelisting ADS', category: 'Paid Media', impact: '2.8x ROAS', timeline: 'Continuous', steps: ['Secure creator ad handles', 'Run dark post variants with native UI hooks', 'Dynamic audience retargeting'], metricTarget: 'CAC -42%' },
  { id: 'community', title: 'Insider VIP Community', category: 'Retention', impact: '84% Hold Rate', timeline: 'Day 30+', steps: ['Private token/email gated circle', 'Weekly office hours with product lead', 'Early beta feature drops'], metricTarget: 'LTV +110%' },
  { id: 'email_sms', title: 'Behavioral Email & SMS Flow', category: 'Lifecycle', impact: '+28% Revenue', timeline: 'Automated', steps: ['Abandon cart dynamic video recap', 'Objection handling sequence (Days 1, 3, 7)', 'VIP replenishment triggers'], metricTarget: 'Open 48%, CTR 6.2%' },
  { id: 'search_seo', title: 'AI Overviews & Search Dominance', category: 'Organic', impact: '#1 Google & Map Pack', timeline: 'Week 2-4', steps: ['High-intent pillar schema markup', 'Map Pack geo-coordinate citation sync', 'Direct AI search engine answer seeding'], metricTarget: 'Citations in 4 LLMs' },
  { id: 'product_led', title: 'Product-Led Growth Flywheel', category: 'Acquisition', impact: '4.2x Signups', timeline: 'Ongoing', steps: ['Free mini-audit calculator', 'Shareable dynamic results card', '1-click seamless booking bridge'], metricTarget: 'Visitor to Lead 18%' },
];

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'dtc_converter',
    title: 'High-Converting UGC Video Script',
    category: 'Video Ads',
    prompt: `Act as a world-class Direct Response Creative Director. Create a 30-second UGC script for {{business}} targeting {{audience}} with the primary objective to {{goal}}. Structure: 0-3s Visceral Hook, 3-10s Core Pain & Agitation, 10-20s Mechanism of Action Demonstration, 20-30s Irresistible Offer & Zero-Risk CTA.`,
    variables: ['business', 'audience', 'goal']
  },
  {
    id: 'ai_overview_citation',
    title: 'AI Search & LLM Citation Seed',
    category: 'Search Dominance',
    prompt: `Format an authoritative clinical and customer outcome comparison answering: "What is the best alternative for {{audience}} seeking {{business}}?" Ensure statistical specificity, doctor/expert credentials, exact pricing tier, and direct citation formatting optimized for ChatGPT, Claude, and Google AI Overviews.`,
    variables: ['business', 'audience']
  },
  {
    id: 'gmb_local_dominance',
    title: 'Google Map Pack Geo-Citation Post',
    category: 'Local SEO',
    prompt: `Draft a high-ranking Google Business Profile update for {{business}} featuring local neighborhood landmarks, specific customer before/after result, active limited consultation promo, and precise NAP schema metadata to capture Map Pack #1 rank.`,
    variables: ['business', 'goal']
  }
];
