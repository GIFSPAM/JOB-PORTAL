import React from 'react';
type Props = {
  isApplied: boolean;
  isClosed: boolean;
  isSaved: boolean;
  applying: boolean;
  saving: boolean;
  onApply: () => void;
  onToggleSave: () => void;
};

export const ExploreJobSeekerActions: React.FC<Props> = ({
  isApplied,
  isClosed,
  isSaved,
  applying,
  saving,
  onApply,
  onToggleSave,
}) => (
  <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
    <button
      onClick={() => {
        if (isClosed) {
          return;
        }
        onApply();
      }}
      disabled={applying || isApplied}
      aria-disabled={isClosed}
      className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-60 ${
        isClosed
          ? 'border-white/10 bg-white/5 text-text-muted cursor-not-allowed hover:bg-white/5'
          : isApplied
            ? 'border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/15'
            : 'border-brand-accent/20 bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/15'
      }`}
    >
      {isClosed ? 'Apply (Closed)' : applying ? 'Applying...' : isApplied ? 'Applied' : 'Apply'}
    </button>
    <button
      onClick={onToggleSave}
      disabled={saving}
      className={`inline-flex items-center justify-center px-3 py-2 rounded-lg border text-xs font-bold transition-all disabled:opacity-60 ${
        isSaved
          ? 'border-yellow-500/20 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/15'
          : 'border-white/10 bg-white/5 text-text-main hover:bg-white/10'
      }`}
    >
      {saving ? 'Saving...' : isSaved ? 'Saved' : 'Save'}
    </button>
  </div>
);
