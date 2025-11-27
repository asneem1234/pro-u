const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  loading = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 shadow-sm hover:shadow-lg active:scale-95 hover:-translate-y-0.5';
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 focus:ring-emerald-500 disabled:from-emerald-400 disabled:to-emerald-400 shadow-emerald-500/25 hover:shadow-emerald-500/40',
    secondary: 'bg-gradient-to-r from-stone-100 to-stone-200 dark:from-gray-700 dark:to-gray-600 text-stone-700 dark:text-gray-200 hover:from-stone-200 hover:to-stone-300 dark:hover:from-gray-600 dark:hover:to-gray-500 focus:ring-stone-500 hover:shadow-stone-500/20',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 disabled:from-red-400 disabled:to-red-400 shadow-red-500/25 hover:shadow-red-500/40',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 focus:ring-emerald-500 disabled:from-emerald-400 disabled:to-teal-400 hover:shadow-teal-500/40',
    outline: 'border-2 border-emerald-500 dark:border-emerald-400 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 focus:ring-emerald-500 hover:shadow-emerald-500/20',
    ghost: 'text-stone-600 dark:text-gray-300 hover:bg-stone-100 dark:hover:bg-gray-700 focus:ring-stone-500 shadow-none hover:shadow-sm',
    gold: 'bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 hover:from-amber-500 hover:to-amber-600 focus:ring-amber-500 shadow-amber-500/25 hover:shadow-amber-500/50 font-bold',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className} ${disabled || loading ? 'cursor-not-allowed opacity-70' : ''}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};

export default Button;
