import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  onSnapshot,
  query,
  where
} from 'firebase/firestore';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  handleFirestoreError,
  OperationType
} from '../firebase';
import { UserProfile, UserActivity, ForgedAsset, FeedbackItem, CampaignMetric } from '../types';

interface FirebaseContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  userActivities: UserActivity[];
  userAssets: ForgedAsset[];
  userFeedbacks: FeedbackItem[];
  userMetrics: CampaignMetric[];
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserProfile>) => Promise<void>;
  logActivity: (actionType: string, title: string, details?: string) => Promise<void>;
  saveForgedAsset: (asset: Omit<ForgedAsset, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  submitFeedback: (feedback: Omit<FeedbackItem, 'id' | 'userId' | 'status' | 'createdAt'>) => Promise<void>;
  addCampaignMetric: (metric: Omit<CampaignMetric, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  deleteCampaignMetric: (metricId: string) => Promise<void>;
  seedDefaultCampaignMetrics: () => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextType | undefined>(undefined);

export const FirebaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userAssets, setUserAssets] = useState<ForgedAsset[]>([]);
  const [userFeedbacks, setUserFeedbacks] = useState<FeedbackItem[]>([]);
  const [userMetrics, setUserMetrics] = useState<CampaignMetric[]>([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setProfile(null);
        setUserActivities([]);
        setUserAssets([]);
        setUserFeedbacks([]);
        setLoading(false);
        return;
      }

      const userDocPath = `users/${currentUser.uid}`;
      try {
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          const nowStr = new Date().toISOString();
          const initialProfile: UserProfile = {
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Marketer',
            photoURL: currentUser.photoURL || '',
            themeAccent: 'orange',
            defaultFont: 'Satoshi Bold',
            defaultAspectRatio: '4:5',
            defaultBusiness: 'Elite Dental Studio — Invisalign',
            defaultAudience: 'Moms 28-42, $90k+, researching smile fix',
            defaultGoal: 'Book 30 consultations / month',
            forgedAssetsCount: 0,
            lastActiveAt: nowStr,
            createdAt: nowStr,
            updatedAt: nowStr,
          };
          await setDoc(userDocRef, initialProfile);
          setProfile(initialProfile);
        } else {
          setProfile(userDocSnap.data() as UserProfile);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, userDocPath);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Listen to profile updates
  useEffect(() => {
    if (!user) return;
    const userDocPath = `users/${user.uid}`;
    const unsubscribe = onSnapshot(
      doc(db, 'users', user.uid),
      (snapshot) => {
        if (snapshot.exists()) {
          setProfile(snapshot.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, userDocPath);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Listen to activities
  useEffect(() => {
    if (!user) return;
    const activitiesPath = `users/${user.uid}/activities`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'activities'),
      (snapshot) => {
        const items: UserActivity[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as UserActivity);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserActivities(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, activitiesPath);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Listen to user's saved forged assets
  useEffect(() => {
    if (!user) return;
    const assetsPath = `users/${user.uid}/assets`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'assets'),
      (snapshot) => {
        const items: ForgedAsset[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ForgedAsset);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserAssets(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, assetsPath);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Listen to user's feedback submissions
  useEffect(() => {
    if (!user) return;
    const feedbackPath = 'feedback';
    const feedbackQuery = query(collection(db, 'feedback'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(
      feedbackQuery,
      (snapshot) => {
        const items: FeedbackItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as FeedbackItem);
        });
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserFeedbacks(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, feedbackPath);
      }
    );
    return () => unsubscribe();
  }, [user]);

  // Listen to user's campaign metrics
  useEffect(() => {
    if (!user) return;
    const metricsPath = `users/${user.uid}/metrics`;
    const unsubscribe = onSnapshot(
      collection(db, 'users', user.uid, 'metrics'),
      (snapshot) => {
        const items: CampaignMetric[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as CampaignMetric);
        });
        items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setUserMetrics(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, metricsPath);
      }
    );
    return () => unsubscribe();
  }, [user]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error('Google Sign In Error:', error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Sign Out Error:', error);
    }
  };

  const updatePreferences = async (prefs: Partial<UserProfile>) => {
    if (!user || !profile) return;
    const userDocPath = `users/${user.uid}`;
    try {
      const updatedData = {
        ...prefs,
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      await updateDoc(doc(db, 'users', user.uid), updatedData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, userDocPath);
    }
  };

  const logActivity = async (actionType: string, title: string, details?: string) => {
    if (!user) return;
    const activityId = `act_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `users/${user.uid}/activities/${activityId}`;
    try {
      const newActivity: UserActivity = {
        id: activityId,
        userId: user.uid,
        actionType,
        title,
        ...(details ? { details } : {}),
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid, 'activities', activityId), newActivity);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const saveForgedAsset = async (asset: Omit<ForgedAsset, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) return;
    const assetId = `asset_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `users/${user.uid}/assets/${assetId}`;
    try {
      const newAsset: ForgedAsset = {
        id: assetId,
        userId: user.uid,
        ...asset,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid, 'assets', assetId), newAsset);

      // Increment count on profile
      const newCount = (profile?.forgedAssetsCount || 0) + 1;
      await updatePreferences({ forgedAssetsCount: newCount });
      await logActivity('forge_asset', `Forged Asset: ${asset.business}`, `Predicted Hook: ${asset.hookRate || 42}% | ROAS: ${asset.roas || 2.7}x`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const submitFeedback = async (feedback: Omit<FeedbackItem, 'id' | 'userId' | 'status' | 'createdAt'>) => {
    if (!user) {
      throw new Error('Please sign in with Google to submit feedback.');
    }
    const feedbackId = `fb_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `feedback/${feedbackId}`;
    try {
      const newFeedback: FeedbackItem = {
        id: feedbackId,
        userId: user.uid,
        ...feedback,
        status: 'open',
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'feedback', feedbackId), newFeedback);
      await logActivity('feedback_submitted', `Feedback: ${feedback.title}`, `Type: ${feedback.type}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const addCampaignMetric = async (metric: Omit<CampaignMetric, 'id' | 'userId' | 'createdAt'>) => {
    if (!user) {
      throw new Error('Please sign in to log campaign metrics.');
    }
    const metricId = `metric_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const path = `users/${user.uid}/metrics/${metricId}`;
    try {
      const newMetric: CampaignMetric = {
        id: metricId,
        userId: user.uid,
        ...metric,
        createdAt: new Date().toISOString(),
      };
      await setDoc(doc(db, 'users', user.uid, 'metrics', metricId), newMetric);
      await logActivity('metric_logged', `Logged Metric: ${metric.campaignName}`, `Spend: $${metric.spend} | ROAS: ${metric.roas}x`);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteCampaignMetric = async (metricId: string) => {
    if (!user) return;
    const path = `users/${user.uid}/metrics/${metricId}`;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'users', user.uid, 'metrics', metricId));
      await logActivity('metric_deleted', `Deleted metric ${metricId}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const seedDefaultCampaignMetrics = async () => {
    if (!user) return;
    const defaultData = [
      { date: '2026-09-15', campaignName: 'Invisalign Adult - TikTok UGC', channel: 'TikTok Ads', impressions: 18400, clicks: 590, conversions: 24, spend: 280, revenue: 1120, ctr: 3.2, cvr: 4.1, roas: 4.0, hookRate: 46, cpa: 11.6 },
      { date: '2026-09-16', campaignName: 'Invisalign Adult - TikTok UGC', channel: 'TikTok Ads', impressions: 21500, clicks: 680, conversions: 28, spend: 310, revenue: 1350, ctr: 3.1, cvr: 4.1, roas: 4.3, hookRate: 48, cpa: 11.0 },
      { date: '2026-09-17', campaignName: 'Map Pack #1 Geo-Drop', channel: 'Map Pack SEO', impressions: 14200, clicks: 490, conversions: 21, spend: 150, revenue: 840, ctr: 3.4, cvr: 4.2, roas: 5.6, hookRate: 42, cpa: 7.1 },
      { date: '2026-09-18', campaignName: 'Moms 28-42 Meta Retargeting', channel: 'Meta Reels', impressions: 26800, clicks: 790, conversions: 35, spend: 420, revenue: 1680, ctr: 2.9, cvr: 4.4, roas: 4.0, hookRate: 44, cpa: 12.0 },
      { date: '2026-09-19', campaignName: 'Moms 28-42 Meta Retargeting', channel: 'Meta Reels', impressions: 29400, clicks: 840, conversions: 38, spend: 450, revenue: 1890, ctr: 2.8, cvr: 4.5, roas: 4.2, hookRate: 43, cpa: 11.8 },
      { date: '2026-09-20', campaignName: 'Google Search High-Intent Pillar', channel: 'Google Search', impressions: 16800, clicks: 620, conversions: 31, spend: 390, revenue: 1520, ctr: 3.6, cvr: 5.0, roas: 3.9, hookRate: 41, cpa: 12.5 },
      { date: '2026-09-21', campaignName: 'Google Search High-Intent Pillar', channel: 'Google Search', impressions: 19100, clicks: 710, conversions: 36, spend: 410, revenue: 1780, ctr: 3.7, cvr: 5.0, roas: 4.3, hookRate: 42, cpa: 11.3 },
      { date: '2026-09-22', campaignName: 'AI Overviews Answer Seeding', channel: 'AI Overviews', impressions: 11500, clicks: 390, conversions: 19, spend: 160, revenue: 760, ctr: 3.4, cvr: 4.8, roas: 4.7, hookRate: 49, cpa: 8.4 },
      { date: '2026-09-23', campaignName: 'Invisalign Adult - TikTok UGC', channel: 'TikTok Ads', impressions: 32000, clicks: 1040, conversions: 46, spend: 520, revenue: 2190, ctr: 3.2, cvr: 4.4, roas: 4.2, hookRate: 47, cpa: 11.3 },
      { date: '2026-09-24', campaignName: 'Invisalign Adult - TikTok UGC', channel: 'TikTok Ads', impressions: 34500, clicks: 1120, conversions: 49, spend: 560, revenue: 2360, ctr: 3.2, cvr: 4.3, roas: 4.2, hookRate: 46, cpa: 11.4 },
      { date: '2026-09-25', campaignName: 'Lifecycle 3D Scan SMS Invite', channel: 'Lifecycle SMS', impressions: 9800, clicks: 580, conversions: 42, spend: 120, revenue: 1680, ctr: 5.9, cvr: 7.2, roas: 14.0, hookRate: 53, cpa: 2.8 },
      { date: '2026-09-26', campaignName: 'Moms 28-42 Meta Retargeting', channel: 'Meta Reels', impressions: 31200, clicks: 960, conversions: 44, spend: 490, revenue: 1980, ctr: 3.0, cvr: 4.5, roas: 4.0, hookRate: 45, cpa: 11.1 },
      { date: '2026-09-27', campaignName: 'Invisalign Weekend Blitz', channel: 'TikTok Ads', impressions: 38200, clicks: 1240, conversions: 54, spend: 610, revenue: 2680, ctr: 3.2, cvr: 4.3, roas: 4.4, hookRate: 48, cpa: 11.2 },
      { date: '2026-09-28', campaignName: 'Invisalign Weekend Blitz', channel: 'Meta Reels', impressions: 36900, clicks: 1180, conversions: 52, spend: 590, revenue: 2540, ctr: 3.2, cvr: 4.4, roas: 4.3, hookRate: 47, cpa: 11.3 },
    ];

    for (const item of defaultData) {
      await addCampaignMetric(item);
    }
  };

  return (
    <FirebaseContext.Provider
      value={{
        user,
        profile,
        loading,
        userActivities,
        userAssets,
        userFeedbacks,
        userMetrics,
        loginWithGoogle,
        logout,
        updatePreferences,
        logActivity,
        saveForgedAsset,
        submitFeedback,
        addCampaignMetric,
        deleteCampaignMetric,
        seedDefaultCampaignMetrics,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};
