export const VOICE_429_COOLDOWN_MS = 5 * 60_000;
export const VOICE_TEMPORARY_COOLDOWN_MS = 15_000;
export const VOICE_MAX_COOLDOWN_MS = 5 * 60_000;

const parseRetryAfterMs = (value, now) => {
  if (typeof value !== 'string' || !value.trim()) return null;
  const seconds = Number(value);
  if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
  const date = Date.parse(value);
  return Number.isFinite(date) ? date - now : null;
};

export const getVoiceCooldownDuration = ({ status, retryAfter }, now = Date.now()) => {
  const rateLimited = status === 429;
  const temporary = status === 0 || status === 204 || status === 408 || status === 425 || (status >= 500 && status <= 599);
  if (!rateLimited && !temporary) return 0;

  const retryAfterMs = parseRetryAfterMs(retryAfter, now);
  const fallback = rateLimited ? VOICE_429_COOLDOWN_MS : VOICE_TEMPORARY_COOLDOWN_MS;
  const duration = retryAfterMs !== null && retryAfterMs > 0 ? retryAfterMs : fallback;
  return Math.max(1_000, Math.min(VOICE_MAX_COOLDOWN_MS, duration));
};

export const createVoiceProviderCooldown = (clock = () => Date.now()) => {
  let until = 0;
  let reason = null;

  return {
    isCoolingDown() { return clock() < until; },
    remainingMs() { return Math.max(0, until - clock()); },
    recordFailure(failure = {}) {
      const now = clock();
      const duration = getVoiceCooldownDuration(failure, now);
      if (!duration) return 0;
      until = Math.max(until, now + duration);
      reason = failure.status === 429 ? 'rate-limited' : 'temporary-failure';
      return duration;
    },
    get reason() { return reason; },
  };
};

export const chooseVoiceSource = ({ packagedClip, premiumRequested, dynamicAvailable, cachedAudio, coolingDown }) => {
  if (packagedClip) return 'packaged';
  if (!premiumRequested || !dynamicAvailable) return 'unavailable';
  if (cachedAudio) return 'cache';
  if (coolingDown) return 'cooldown';
  return 'dynamic';
};
