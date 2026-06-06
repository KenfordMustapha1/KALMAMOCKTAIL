import { Link } from 'react-router-dom';
import { Bell, CircleCheck, X } from 'lucide-react';

const CustomerOrderAlertBanner = ({ alert, onDismiss }) => {
  if (!alert) return null;

  const isReady = alert.type === 'ready';

  return (
    <div
      className={`fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-lg rounded-lg border p-4 shadow-lg animate-fade-in ${
        isReady
          ? 'bg-purple-500/20 border-purple-500/50 text-purple-100'
          : 'bg-green-500/20 border-green-500/50 text-green-100'
      }`}
      role="alert"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-white flex items-center gap-2">
            {isReady ? (
              <Bell className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            ) : (
              <CircleCheck className="w-5 h-5 shrink-0" strokeWidth={1.75} />
            )}
            {alert.message}
          </p>
          <Link
            to="/orders"
            className="text-sm underline mt-1 inline-block opacity-90 hover:opacity-100"
            onClick={onDismiss}
          >
            View my orders
          </Link>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-white/70 hover:text-white p-1"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" strokeWidth={1.75} />
        </button>
      </div>
    </div>
  );
};

export default CustomerOrderAlertBanner;
