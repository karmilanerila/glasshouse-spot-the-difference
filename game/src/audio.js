// Sounds, synthesised with WebAudio — no audio files to ship. A bright
// two-note chime on a find, a low buzz on a miss, a soft pluck for a hint,
// and a little arpeggio when a scene (or the whole game) is complete.
export function createAudio() {
  let context = null;
  let muted = false;
  try {
    muted = window.localStorage.getItem('glasshouse-muted') === '1';
  } catch {
    muted = false;
  }

  function ensure() {
    if (!context) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      context = new AC();
    }
    if (context.state === 'suspended') void context.resume();
    return context;
  }

  function tone(freq, start, dur, type, gain) {
    if (muted) return;
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const amp = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ac.currentTime + start;
    amp.gain.setValueAtTime(0.0001, t);
    amp.gain.exponentialRampToValueAtTime(gain, t + 0.015);
    amp.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(amp);
    amp.connect(ac.destination);
    osc.start(t);
    osc.stop(t + dur + 0.05);
  }

  return {
    get muted() {
      return muted;
    },
    toggleMute() {
      muted = !muted;
      try {
        window.localStorage.setItem('glasshouse-muted', muted ? '1' : '0');
      } catch {
        // Storage can be off: the mute then lasts this visit only.
      }
      return muted;
    },
    unlock() {
      ensure();
    },
    find() {
      tone(659.25, 0, 0.14, 'sine', 0.16);
      tone(880, 0.09, 0.22, 'sine', 0.16);
    },
    miss() {
      tone(140, 0, 0.18, 'square', 0.08);
    },
    hint() {
      tone(523.25, 0, 0.12, 'triangle', 0.12);
    },
    sceneDone() {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.09, 0.2, 'sine', 0.15));
    },
    win() {
      [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => tone(f, i * 0.1, 0.28, 'sine', 0.14));
    },
  };
}
