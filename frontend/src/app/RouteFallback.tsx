import React from 'react';

export const RouteFallback: React.FC = () => (
  <section className="pt-28 pb-16 px-6 min-h-screen">
    <div className="max-w-6xl mx-auto">
      <div className="glass-card p-8 space-y-3">
        {[1, 2, 3, 4].map((index) => (
          <div key={index} className="h-12 rounded-xl bg-white/5 animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);
