import { useState, useEffect } from 'react';

/**
 * TimeElapsed Component
 * Displays time elapsed from created_at timestamp in minutes only
 * Shows 0 min if less than 1 minute
 * Updates every minute
 */
const TimeElapsed = ({ createdAt, timeElapsed }) => {
  const hasBackendElapsed =
    timeElapsed?.total_minutes !== undefined && timeElapsed?.total_minutes !== null;

  const [minutes, setMinutes] = useState(() => {
    if (hasBackendElapsed) {
      return timeElapsed.total_minutes;
    }
    return 0;
  });

  useEffect(() => {
    if (hasBackendElapsed) {
      setMinutes(timeElapsed.total_minutes);
      return undefined;
    }

    if (!createdAt) {
      setMinutes(0);
      return undefined;
    }

    const calculateTimeElapsed = () => {
      const createdDate = new Date(createdAt);
      const now = new Date();
      const diffMs = now - createdDate;
      const diffMinutes = Math.floor(diffMs / (1000 * 60));

      if (diffMinutes < 1) {
        setMinutes(0);
      } else {
        setMinutes(diffMinutes);
      }
    };

    calculateTimeElapsed();

    const interval = setInterval(calculateTimeElapsed, 60000);
    return () => clearInterval(interval);
  }, [createdAt, hasBackendElapsed, timeElapsed?.total_minutes]);

  if (!createdAt && (timeElapsed?.total_minutes === undefined || timeElapsed?.total_minutes === null)) return '-';

  const hours = hasBackendElapsed
    ? timeElapsed.hours ?? Math.floor(timeElapsed.total_minutes / 60)
    : Math.floor(minutes / 60);
  const remainingMinutes = hasBackendElapsed
    ? timeElapsed.minutes ?? (timeElapsed.total_minutes % 60)
    : minutes % 60;

  const displayText = (() => {
    if (hasBackendElapsed) {
      if (hours > 0) {
        return `${hours}h ${remainingMinutes}m`;
      }
      return `${timeElapsed.total_minutes} min`;
    }

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }

    return `${minutes} min`;
  })();

  return (
    <div className="flex items-center gap-1 text-blue-600">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="text-sm">{displayText}</span>
    </div>
  );
};

export default TimeElapsed;
