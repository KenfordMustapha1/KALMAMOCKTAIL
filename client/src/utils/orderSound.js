const STORAGE_KEY = 'kalmaOrderSound';

let audioContext = null;

const getAudioContext = async () => {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;

  if (!audioContext) {
    audioContext = new AudioCtx();
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
  }

  return audioContext;
};

export const isOrderSoundEnabled = () => localStorage.getItem(STORAGE_KEY) !== 'false';

export const setOrderSoundEnabled = (enabled) => {
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
};

export const unlockOrderSound = async () => {
  await getAudioContext();
};

const playTone = async (frequency, duration, delay = 0, volume = 0.25) => {
  if (!isOrderSoundEnabled()) return;

  const ctx = await getAudioContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.frequency.value = frequency;
  oscillator.type = 'square';

  const start = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, start + duration);

  oscillator.start(start);
  oscillator.stop(start + duration + 0.05);
};

/** New order — quick double beep (counter bell) */
export const playNewOrderBuzzer = async () => {
  await playTone(880, 0.12, 0);
  await playTone(880, 0.12, 0.18);
  await playTone(1100, 0.18, 0.36);
};

/** Order ready for pickup — triple ascending ding */
export const playOrderReadyBuzzer = async () => {
  await playTone(523, 0.2, 0);
  await playTone(659, 0.2, 0.22);
  await playTone(784, 0.35, 0.44);
};

/** Order completed — longer buzz like fast-food "order up" */
export const playOrderCompletedBuzzer = async () => {
  await playTone(440, 0.15, 0);
  await playTone(554, 0.15, 0.16);
  await playTone(659, 0.15, 0.32);
  await playTone(880, 0.4, 0.48, 0.3);
};
