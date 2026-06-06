import { useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  isOrderSoundEnabled,
  setOrderSoundEnabled,
  unlockOrderSound,
  playOrderReadyBuzzer,
} from '../utils/orderSound';

const CustomerOrderSoundToggle = ({ compact = false }) => {
  const [enabled, setEnabled] = useState(isOrderSoundEnabled);

  const handleToggle = async () => {
    const next = !enabled;
    setOrderSoundEnabled(next);
    setEnabled(next);

    if (next) {
      await unlockOrderSound();
      await playOrderReadyBuzzer();
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-sm text-kalma-muted hover:text-kalma-gold transition-colors"
        title={enabled ? 'Order alerts on' : 'Order alerts off'}
      >
        {enabled ? (
          <Bell className="w-4 h-4" strokeWidth={1.75} />
        ) : (
          <BellOff className="w-4 h-4" strokeWidth={1.75} />
        )}
        {enabled ? 'Alerts on' : 'Alerts off'}
      </button>
    );
  }

  return (
    <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-white font-medium text-sm flex items-center gap-2">
          <Bell className="w-4 h-4 text-kalma-gold" strokeWidth={1.75} />
          Order ready alerts
        </p>
        <p className="text-kalma-muted text-xs mt-1">
          Get a buzz on your phone when your drink is ready for pickup.
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className={`${enabled ? 'btn-primary' : 'btn-secondary'} text-sm flex items-center gap-2`}
      >
        {enabled ? (
          <Bell className="w-4 h-4" strokeWidth={1.75} />
        ) : (
          <BellOff className="w-4 h-4" strokeWidth={1.75} />
        )}
        {enabled ? 'Buzzer ON' : 'Buzzer OFF'}
      </button>
    </div>
  );
};

export default CustomerOrderSoundToggle;
