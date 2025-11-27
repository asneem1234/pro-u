const Input = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600'}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const Select = ({ 
  label, 
  options, 
  error, 
  className = '', 
  placeholder = 'Select an option',
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600'}
        `}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

const Textarea = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`
          w-full px-4 py-2.5 border rounded-xl transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
          resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          ${error ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-600 hover:border-emerald-300 dark:hover:border-emerald-600'}
        `}
        rows={4}
        {...props}
      />
      {error && (
        <p className="mt-1.5 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};

export { Input, Select, Textarea };
