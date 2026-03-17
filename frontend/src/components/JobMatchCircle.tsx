import React from 'react';

interface JobMatchCircleProps {
  matchPercentage: number;
  size?: number;
  strokeWidth?: number;
}

export const JobMatchCircle: React.FC<JobMatchCircleProps> = ({ 
  matchPercentage, 
  size = 120,
  strokeWidth = 8
}) => {
  const safePercentage = Number.isFinite(matchPercentage) ? matchPercentage : 0;
  const percentage = Math.min(Math.max(safePercentage, 0), 100);

  const getColor = (percent: number): string => {
    if (percent < 33) return '#ef4444';
    if (percent < 66) return '#eab308';
    return '#22c55e';
  };

  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const arcLength = 1.5 * Math.PI * radius;
  const progressLength = (percentage / 100) * arcLength;
  const color = getColor(percentage);

  const toCartesian = (angleDeg: number) => {
    const angleRad = (angleDeg * Math.PI) / 180;
    return {
      x: center + radius * Math.cos(angleRad),
      y: center + radius * Math.sin(angleRad),
    };
  };

  const start = toCartesian(135);
  const end = toCartesian(45);
  const arcPath = `M ${start.x} ${start.y} A ${radius} ${radius} 0 1 1 ${end.x} ${end.y}`;

  return (
    <div className="flex flex-col items-center gap-2">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size}>
          <path
            d={arcPath}
            fill="none"
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          <path
            d={arcPath}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${progressLength} ${arcLength}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.5s ease' }}
          />
        </svg>
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
          }}
          className="flex flex-col items-center"
        >
          <div className="text-xl font-bold" style={{ color }}>
            {Math.round(percentage)}%
          </div>
          <div className="text-xs text-text-muted">Match</div>
        </div>
      </div>
    </div>
  );
};
