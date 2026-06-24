import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-700 rounded-full animate-spin"></div>
        <div className="absolute w-8 h-8 border-4 border-t-cyan-500 border-cyan-100 rounded-full animate-spin animate-reverse"></div>
      </div>
      <p className="mt-4 text-slate-500 dark:text-slate-400 font-medium animate-pulse text-sm">
        Retrieving clinical data...
      </p>
    </div>
  );
};

export default LoadingSpinner;
