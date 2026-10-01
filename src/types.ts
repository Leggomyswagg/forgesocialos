export interface NavModule {
  id: string;
  label: string;
  desc: string;
  hot?: boolean;
}

export interface FlywheelStep {
  n: number;
  key: string;
  title: string;
  detail: string;
  color: string;
  icon: string;
}

export interface AssetPackageItem {
  k: string;
  title: string;
  description: string;
  icon: string;
  tag: string;
  previewContent?: string;
}

export interface GtmPlaybookItem {
  id: string;
  title: string;
  category: string;
  impact: string;
  timeline: string;
  steps: string[];
  metricTarget: string;
}

export interface PromptTemplate {
  id: string;
  title: string;
  category: string;
  prompt: string;
  variables: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  themeAccent?: 'orange' | 'lime';
  defaultFont?: string;
  defaultAspectRatio?: '4:5' | '9:16' | '1:1';
  defaultBusiness?: string;
  defaultAudience?: string;
  defaultGoal?: string;
  forgedAssetsCount?: number;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  actionType: string;
  title: string;
  details?: string;
  createdAt: string;
}

export interface ForgedAsset {
  id: string;
  userId: string;
  business: string;
  audience?: string;
  goal?: string;
  themeAccent?: 'orange' | 'lime';
  font?: string;
  aspectRatio?: '4:5' | '9:16' | '1:1';
  hookRate?: number;
  ctr?: number;
  roas?: number;
  createdAt: string;
}

export interface FeedbackItem {
  id: string;
  userId: string;
  userName?: string;
  type: 'feature_suggestion' | 'bug_report' | 'general_feedback';
  title: string;
  description: string;
  rating?: number;
  status: 'open' | 'in_review' | 'resolved';
  createdAt: string;
}

export interface CampaignMetric {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  campaignName: string;
  channel: string;
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  ctr?: number;
  cvr?: number;
  roas?: number;
  hookRate?: number;
  cpa?: number;
  createdAt: string;
}
