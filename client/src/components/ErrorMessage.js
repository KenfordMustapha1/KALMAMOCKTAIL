const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center animate-fade-in">
      <p className="text-red-400 mb-2">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm text-kalma-gold hover:underline">
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
