import { useState } from 'react';
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
        className="text-sm text-kalma-muted hover:text-kalma-gold transition-colors"
        title={enabled ? 'Order alerts on' : 'Order alerts off'}
      >
        {enabled ? '🔔 Alerts on' : '🔕 Alerts off'}
      </button>
    );
  }

  return (
    <div className="card p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-white font-medium text-sm">Order ready alerts</p>
        <p className="text-kalma-muted text-xs mt-1">
          Get a buzz on your phone when your drink is ready for pickup.
        </p>
      </div>
      <button
        type="button"
        onClick={handleToggle}
        className={enabled ? 'btn-primary text-sm' : 'btn-secondary text-sm'}
      >
        {enabled ? '🔔 Buzzer ON' : '🔕 Buzzer OFF'}
      </button>
    </div>
  );
};

export default CustomerOrderSoundToggle;
