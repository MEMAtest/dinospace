// Pure geometry shared by clock pointer input and its interaction checks.
export const clockTimeAtPoint = (time, hand, x, y) => {
  const angle = (Math.atan2(x - 100, 100 - y) * 180 / Math.PI + 360) % 360;
  if (hand === 'hour') return { ...time, hour: Math.round(angle / 30) % 12 || 12 };
  const minute = (Math.round(angle / 90) % 4) * 15;
  let delta = minute - time.minute;
  if (delta > 30) delta -= 60;
  if (delta < -30) delta += 60;
  const total = ((time.hour % 12) * 60 + time.minute + delta + 720) % 720;
  return { hour: Math.floor(total / 60) || 12, minute: total % 60 };
};
