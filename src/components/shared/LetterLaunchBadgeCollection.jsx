import { LETTER_LAUNCH_CHAPTER_BADGES } from '../../data/chapterBadges.js';
import rocketArt from '../../assets/little/fuel-rocket.webp';

const BadgeMedallion = ({ badge, earned }) => (
  <span
    role="img"
    aria-label={`${badge.name} badge${earned ? ', earned' : ', not earned yet'}`}
    className={`relative grid h-14 w-14 shrink-0 place-items-center rounded-full border-[3px] border-white bg-gradient-to-br ${earned ? badge.accent : 'from-slate-200 to-slate-300 grayscale'} shadow-[0_4px_0_rgba(15,23,42,.22)] ring-2 ${earned ? 'ring-amber-200' : 'ring-slate-200'}`}
  >
    <img src={rocketArt} alt="" draggable={false} className={`h-9 w-9 object-contain drop-shadow ${earned ? '' : 'opacity-45'}`} />
    <span className="absolute -bottom-1 -right-1 grid min-h-6 min-w-6 place-items-center rounded-full border-2 border-white bg-white px-1 text-[10px] font-black leading-none text-slate-900 shadow">
      {badge.mark}
    </span>
  </span>
);

const LetterLaunchBadgeCollection = ({ earnedBadgeIds = [], rewardBadgeId = null, rewardIsNew = false }) => {
  const earned = new Set(earnedBadgeIds);
  const rewardBadge = LETTER_LAUNCH_CHAPTER_BADGES.find((badge) => badge.id === rewardBadgeId);
  const earnedCount = LETTER_LAUNCH_CHAPTER_BADGES.filter((badge) => earned.has(badge.id)).length;

  return (
    <section aria-label="Letter Launch chapter badge collection" className="w-full max-w-md rounded-[1.65rem] border-4 border-cyan-200 bg-gradient-to-br from-sky-50 via-white to-amber-50 p-3 text-left shadow-[0_6px_0_rgba(14,116,144,.16)] sm:p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
        <h2 className="text-base font-black text-slate-900 sm:text-lg">Rocket badge collection</h2>
        <span className="rounded-full border-2 border-amber-200 bg-amber-100 px-3 py-1 text-sm font-black text-amber-900">{earnedCount} of 4 earned</span>
      </div>

      {rewardBadge && (
        <div aria-live="polite" className="mb-3 flex items-center gap-3 rounded-2xl border-4 border-amber-200 bg-gradient-to-r from-amber-50 to-cyan-50 p-2.5 shadow-inner sm:p-3">
          <BadgeMedallion badge={rewardBadge} earned />
          <div className="min-w-0">
            <p className="text-xs font-black uppercase tracking-wide text-sky-800">{rewardIsNew ? 'New chapter badge!' : 'Chapter badge in your collection'}</p>
            <p className="text-base font-black leading-tight text-slate-900">{rewardBadge.name}</p>
            <p className="text-sm font-semibold leading-snug text-slate-600">{rewardBadge.description}</p>
          </div>
        </div>
      )}

      <ul className="grid grid-cols-2 gap-2" aria-label="Four Letter Launch chapter badges">
        {LETTER_LAUNCH_CHAPTER_BADGES.map((badge) => {
          const isEarned = earned.has(badge.id);
          return (
            <li key={badge.id} className={`flex min-h-[76px] min-w-0 items-center gap-2 rounded-2xl border-2 p-2 ${isEarned ? 'border-cyan-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-100/90'}`}>
              <BadgeMedallion badge={badge} earned={isEarned} />
              <span className="min-w-0">
                <strong className="block text-xs leading-tight text-slate-900 sm:text-sm">{badge.name}</strong>
                <span className={`mt-1 block text-[11px] font-black uppercase tracking-wide ${isEarned ? 'text-emerald-700' : 'text-slate-500'}`}>{isEarned ? 'Earned' : 'Finish chapter'}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default LetterLaunchBadgeCollection;
