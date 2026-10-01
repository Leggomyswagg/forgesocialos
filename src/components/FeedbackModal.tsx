import React, { useState } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { FeedbackItem } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const { user, profile, loginWithGoogle, submitFeedback, userFeedbacks } = useFirebase();
  const [activeTab, setActiveTab] = useState<'submit' | 'history'>('submit');
  const [type, setType] = useState<FeedbackItem['type']>('feature_suggestion');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Please enter a title and description.');
      return;
    }
    setErrorMsg('');
    setSubmitting(true);
    try {
      await submitFeedback({
        userName: profile?.displayName || user?.displayName || user?.email || 'Anonymous',
        type,
        title: title.trim(),
        description: description.trim(),
        rating,
      });
      setSuccessMsg('Thank you! Your feedback has been logged to the engineering team.');
      setTitle('');
      setDescription('');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('history');
      }, 1500);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 glass">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#15151E] border border-[#2A2A3A] p-6 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2A2A3A] pb-4 mb-4">
          <div>
            <span className="mono text-[10px] tracking-[0.2em] text-white/40 uppercase">Feedback System</span>
            <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">Submit Feedback & Suggestions</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#0A0A0F] border border-[#2A2A3A] flex items-center justify-center text-white/50 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-1 bg-[#0A0A0F] rounded-xl border border-[#2A2A3A] mb-5">
          <button
            onClick={() => setActiveTab('submit')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'submit'
                ? 'bg-[#15151E] text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            New Submission
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              activeTab === 'history'
                ? 'bg-[#15151E] text-white shadow-sm'
                : 'text-white/50 hover:text-white'
            }`}
          >
            My Feedback ({userFeedbacks.length})
          </button>
        </div>

        {!user ? (
          <div className="text-center py-8 px-4 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A]">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF6A00] to-[#D6FF57] text-black font-bold mx-auto flex items-center justify-center mb-3">
              ✦
            </div>
            <h4 className="text-sm font-bold text-white mb-1">Account Required</h4>
            <p className="text-xs text-white/50 max-w-sm mx-auto mb-4">
              Sign in with Google to submit bug reports, vote on feature suggestions, and track ticket status.
            </p>
            <button
              onClick={loginWithGoogle}
              className="px-5 py-2 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs"
            >
              Sign In with Google
            </button>
          </div>
        ) : activeTab === 'submit' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/50 text-red-200 text-xs">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-200 text-xs">
                {successMsg}
              </div>
            )}

            <div>
              <label className="mono text-[10px] text-white/50 block mb-1.5">CATEGORY</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'feature_suggestion', label: 'Feature Idea' },
                  { id: 'bug_report', label: 'Report Issue' },
                  { id: 'general_feedback', label: 'General' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setType(item.id as FeedbackItem['type'])}
                    className={`py-2 px-2 rounded-lg text-xs font-medium border text-center transition-colors ${
                      type === item.id
                        ? 'bg-[#FF6A00]/20 border-[#FF6A00] text-white'
                        : 'bg-[#0A0A0F] border-[#2A2A3A] text-white/50 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mono text-[10px] text-white/50 block mb-1">TITLE</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="E.g., Add webhook trigger for Zapier integration"
                maxLength={256}
                className="w-full h-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] px-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A00]"
              />
            </div>

            <div>
              <label className="mono text-[10px] text-white/50 block mb-1">DESCRIPTION</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detail what you'd like to see, steps to reproduce, or workflow enhancements..."
                maxLength={2048}
                rows={3}
                className="w-full rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] p-3 text-xs text-white placeholder-white/20 focus:outline-none focus:border-[#FF6A00] resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="mono text-[10px] text-white/50 block mb-1">SATISFACTION RATING</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-base transition-transform hover:scale-110 ${
                        rating >= star ? 'text-[#FF6A00]' : 'text-white/20'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="h-10 px-6 rounded-full bg-gradient-to-r from-[#FF6A00] to-[#D6FF57] text-black font-bold text-xs hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send Feedback'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            {userFeedbacks.length === 0 ? (
              <div className="text-center py-8 text-white/40 text-xs">
                No feedback submitted yet. Your ideas shape the Forge OS roadmap.
              </div>
            ) : (
              userFeedbacks.map((fb) => (
                <div key={fb.id} className="p-3 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] text-left">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="mono text-[10px] px-2 py-0.5 rounded-full bg-[#15151E] border border-white/10 text-white/60">
                      {fb.type.replace('_', ' ').toUpperCase()}
                    </span>
                    <span
                      className={`mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        fb.status === 'resolved'
                          ? 'bg-[#D6FF57] text-black'
                          : fb.status === 'in_review'
                          ? 'bg-[#FF6A00] text-black'
                          : 'bg-white/10 text-white/70'
                      }`}
                    >
                      {fb.status.toUpperCase()}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{fb.title}</h4>
                  <p className="text-[11px] text-white/60 line-clamp-2 mb-2">{fb.description}</p>
                  <div className="flex items-center justify-between mono text-[9px] text-white/40">
                    <span>{new Date(fb.createdAt).toLocaleDateString()}</span>
                    <span>Rating: {fb.rating ? '★'.repeat(fb.rating) : 'N/A'}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
