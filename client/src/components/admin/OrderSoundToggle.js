import { useEffect, useState } from 'react';
import { Bell, BellOff } from 'lucide-react';
import {
  isOrderSoundEnabled,
  setOrderSoundEnabled,
  unlockOrderSound,
  playNewOrderBuzzer,
} from '../../utils/orderSound';

const OrderSoundToggle = () => {
  const [enabled, setEnabled] = useState(isOrderSoundEnabled);
  const [needsUnlock, setNeedsUnlock] = useState(false);

  useEffect(() => {
    setEnabled(isOrderSoundEnabled());
  }, []);

  const handleToggle = async () => {
    const next = !enabled;
    setOrderSoundEnabled(next);
    setEnabled(next);

    if (next) {
      try {
        await unlockOrderSound();
        await playNewOrderBuzzer();
        setNeedsUnlock(false);
      } catch {
        setNeedsUnlock(true);
      }
    }
  };

  const handleUnlock = async () => {
    try {
      await unlockOrderSound();
      await playNewOrderBuzzer();
      setNeedsUnlock(false);
    } catch {
      setNeedsUnlock(true);
    }
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleToggle}
        className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg border transition-colors ${
          enabled
            ? 'border-kalma-gold/50 text-kalma-gold bg-kalma-gold/10'
            : 'border-kalma-border text-kalma-muted hover:text-white'
        }`}
      >
        {enabled ? (
          <Bell className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        ) : (
          <BellOff className="w-4 h-4 shrink-0" strokeWidth={1.75} />
        )}
        {enabled ? 'Order buzzer: ON' : 'Order buzzer: OFF'}
      </button>
      {enabled && needsUnlock && (
        <button
          type="button"
          onClick={handleUnlock}
          className="w-full text-xs text-kalma-gold hover:underline"
        >
          Tap to enable sound
        </button>
      )}
    </div>
  );
};

export default OrderSoundToggle;
