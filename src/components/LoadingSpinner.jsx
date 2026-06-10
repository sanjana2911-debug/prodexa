/**
 * Reusable loading spinner component
 */
export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
    xl: 'h-16 w-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`${sizes[size]} rounded-full border-primary-200 dark:border-primary-800 border-t-primary-600 animate-spin`} />
      {text && <p className="text-sm text-gray-500 dark:text-gray-400">{text}</p>}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <LoadingSpinner size="lg" text="Loading..." />
    </div>
  );
}

export function ButtonLoader() {
  return <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />;
}