/**
 * Effect #5: Skeleton loader with shimmer-gradient sweep
 * Animated background-position sweep for loading states.
 */

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle';
  count?: number;
}

export function SkeletonLoader({ className = '', variant = 'rect', count = 1 }: SkeletonProps) {
  const getVariantClass = () => {
    switch (variant) {
      case 'circle':
        return 'rounded-full';
      case 'text':
        return 'h-4 rounded-md';
      case 'rect':
      default:
        return 'rounded-lg';
    }
  };

  if (count === 1) {
    return (
      <div
        className={`animate-shimmer bg-slate-200/80 ${getVariantClass()} ${className}`}
        role="status"
        aria-label="Loading content..."
      />
    );
  }

  return (
    <div className="space-y-2.5 w-full">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-shimmer bg-slate-200/80 ${getVariantClass()} ${className}`}
          role="status"
          aria-label="Loading item..."
        />
      ))}
    </div>
  );
}
