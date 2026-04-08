const DINO_SVGS = {
  trex: {
    color: '#16a34a',
    // Big head, tiny arms, thick tail
    paths: [
      // Body
      'M50,55 Q55,40 65,38 Q78,36 82,42 Q86,48 82,55 Q78,58 72,58 L68,58 Q65,62 58,65 Q50,68 42,65 Q35,62 30,58 Q22,52 18,48 Q14,44 18,42 Q22,40 26,44 L30,48 Q35,52 42,55 Z',
      // Tiny arm
      'M58,56 Q56,60 54,62 Q52,60 54,58 Z',
      // Legs
      'M42,65 L40,80 L36,80 L38,65',
      'M55,65 L57,80 L53,80 L52,65',
      // Tail
      'M18,48 Q10,46 6,40 Q4,36 8,34 Q12,36 16,42 Z',
      // Eye
      'M76,42 A2,2 0 1,1 76,42.01',
      // Jaw
      'M82,48 Q88,50 86,54 Q82,56 78,54 Z',
      // Teeth
      'M82,48 L83,51 M85,49 L85,52',
    ],
  },
  brachio: {
    color: '#0d9488',
    // Very long neck, tall body
    paths: [
      // Body (oval)
      'M45,62 Q55,52 65,58 Q72,62 70,70 Q65,78 55,78 Q45,76 42,70 Q40,65 45,62 Z',
      // Long neck
      'M52,58 Q48,42 44,30 Q42,24 38,20 Q36,18 34,20 Q32,24 36,22 Q40,20 42,24 Q46,32 50,50 Z',
      // Head
      'M34,20 Q30,16 26,18 Q24,20 26,24 Q28,26 32,24 Q36,22 34,20 Z',
      // Eye
      'M28,20 A1.5,1.5 0 1,1 28,20.01',
      // Front legs
      'M52,76 L50,90 L46,90 L48,76',
      'M60,78 L62,90 L58,90 L56,78',
      // Back legs
      'M65,72 L68,90 L64,90 L62,72',
      // Tail
      'M70,70 Q78,68 84,64 Q86,62 84,60 Q80,62 74,66 Z',
    ],
  },
  trike: {
    color: '#ea580c',
    // Frill/shield, 3 horns, stocky body
    paths: [
      // Body
      'M40,58 Q50,50 62,54 Q70,58 68,66 Q64,74 54,76 Q44,76 38,70 Q34,64 40,58 Z',
      // Frill (shield behind head)
      'M28,38 Q22,30 20,24 Q20,18 26,16 Q32,14 38,18 Q42,22 40,30 Q38,36 34,40 Z',
      // Head
      'M30,42 Q26,38 24,34 Q22,32 24,30 Q28,28 34,30 Q38,34 36,40 Q34,44 30,42 Z',
      // Top horn
      'M30,28 L28,16 L32,18 Z',
      // Left horn
      'M24,32 L16,26 L20,30 Z',
      // Right horn
      'M34,30 L38,20 L36,28 Z',
      // Eye
      'M30,34 A1.5,1.5 0 1,1 30,34.01',
      // Front legs
      'M44,74 L42,88 L38,88 L40,74',
      'M52,76 L54,88 L50,88 L48,76',
      // Back legs
      'M60,70 L64,88 L60,88 L56,70',
      // Tail
      'M68,66 Q76,62 82,58 Q84,56 82,54 Q78,56 72,62 Z',
    ],
  },
  stego: {
    color: '#2563eb',
    // Back plates, spiked tail
    paths: [
      // Body
      'M30,58 Q40,50 55,52 Q68,54 72,62 Q74,70 66,76 Q55,80 42,78 Q32,76 28,68 Q26,62 30,58 Z',
      // Head
      'M24,56 Q18,52 14,50 Q10,50 10,54 Q12,58 18,58 Q22,58 24,56 Z',
      // Eye
      'M14,53 A1.5,1.5 0 1,1 14,53.01',
      // Back plates
      'M36,52 L32,38 L40,48 Z',
      'M44,48 L42,32 L48,44 Z',
      'M52,48 L52,30 L56,44 Z',
      'M60,50 L62,34 L64,48 Z',
      'M66,54 L70,40 L70,52 Z',
      // Front legs
      'M36,76 L34,90 L30,90 L32,76',
      'M46,78 L48,90 L44,90 L42,78',
      // Back legs
      'M58,78 L60,90 L56,90 L54,78',
      // Tail with spikes
      'M72,62 Q80,58 86,54 Q88,52 86,50',
      'M84,54 L92,48 L88,56 Z',
      'M80,58 L88,54 L84,60 Z',
    ],
  },
  raptor: {
    color: '#dc2626',
    // Sleek bipedal, curved claw
    paths: [
      // Body (lean)
      'M42,48 Q50,42 58,44 Q66,46 68,52 Q68,58 62,62 Q55,64 48,62 Q42,60 40,54 Q40,50 42,48 Z',
      // Head (small, angular)
      'M32,38 Q28,34 24,34 Q20,36 22,40 Q26,42 32,42 Q36,42 38,40 Q40,38 38,36 Q36,34 32,38 Z',
      // Neck
      'M38,40 Q40,44 42,48',
      // Eye
      'M26,37 A1.5,1.5 0 1,1 26,37.01',
      // Jaw teeth
      'M22,40 L23,42 M24,40 L24,43',
      // Arms (small, forward-reaching)
      'M46,50 Q42,54 40,58 Q38,56 42,52 Z',
      // Left leg
      'M50,62 L46,76 L42,80 L44,76 L48,62',
      // Right leg
      'M58,62 L56,76 L52,80 L54,76 L56,62',
      // Curved claw (signature)
      'M42,80 Q38,82 36,78 Q38,76 40,80',
      'M52,80 Q48,82 46,78 Q48,76 50,80',
      // Tail (long, thin, counterbalance)
      'M68,52 Q76,48 84,46 Q88,44 90,42 Q88,40 86,42 Q80,44 72,48 Z',
    ],
  },
  ankyl: {
    color: '#92400e',
    // Wide armored body, club tail
    paths: [
      // Body (wide, low)
      'M25,54 Q35,44 55,44 Q72,44 78,54 Q80,62 74,70 Q62,76 44,76 Q30,76 24,68 Q20,60 25,54 Z',
      // Armor pattern
      'M35,48 L38,44 L42,48 L38,52 Z',
      'M48,46 L52,42 L56,46 L52,50 Z',
      'M62,48 L66,44 L70,48 L66,52 Z',
      'M42,56 L46,52 L50,56 L46,60 Z',
      'M56,56 L60,52 L64,56 L60,60 Z',
      // Head
      'M20,54 Q14,50 10,52 Q8,56 12,58 Q16,60 22,58 Z',
      // Eye
      'M14,54 A1.5,1.5 0 1,1 14,54.01',
      // Front legs (short, sturdy)
      'M34,74 L32,86 L28,86 L30,74',
      'M46,76 L48,86 L44,86 L42,76',
      // Back legs
      'M60,76 L62,86 L58,86 L56,76',
      'M70,72 L74,86 L70,86 L66,72',
      // Tail with club
      'M78,58 Q84,56 88,54 Q92,52 94,54 Q96,58 92,60 Q88,58 84,58 Z',
      // Club
      'M92,54 Q98,50 98,56 Q98,62 92,60 Z',
    ],
  },
  para: {
    color: '#9333ea',
    // Duck-bill, tubular head crest
    paths: [
      // Body
      'M40,56 Q50,48 62,50 Q72,54 72,62 Q70,72 60,76 Q48,78 40,72 Q34,66 36,60 Q38,56 40,56 Z',
      // Neck
      'M38,54 Q34,46 30,40 Q28,36 30,34 Z',
      // Head (duck-like)
      'M26,34 Q22,30 18,32 Q14,36 18,40 Q22,42 28,40 Q32,38 30,34 Z',
      // Crest (tubular, sweeping back)
      'M26,30 Q24,22 28,16 Q32,12 36,14 Q38,18 34,24 Q30,28 26,30 Z',
      // Duck bill
      'M14,36 Q10,38 8,36 Q10,34 14,34 Z',
      // Eye
      'M22,34 A1.5,1.5 0 1,1 22,34.01',
      // Front legs
      'M44,74 L42,88 L38,88 L40,74',
      'M52,76 L54,88 L50,88 L48,76',
      // Back legs
      'M62,72 L66,88 L62,88 L58,72',
      // Tail
      'M72,62 Q80,58 86,54 Q88,52 86,50 Q82,52 76,58 Z',
    ],
  },
  spino: {
    color: '#15803d',
    // Sail fin on back, bipedal
    paths: [
      // Body
      'M38,58 Q48,52 60,54 Q70,56 72,62 Q72,68 66,72 Q56,76 46,74 Q38,70 36,64 Q36,60 38,58 Z',
      // Sail fin (tall, dramatic)
      'M42,54 Q40,36 44,22 Q48,16 52,22 Q56,16 60,22 Q64,16 66,24 Q68,36 66,54',
      // Sail ribs
      'M46,52 L48,26',
      'M52,50 L54,20',
      'M58,50 L60,24',
      // Head (crocodilian, long snout)
      'M28,48 Q22,44 16,44 Q10,46 10,50 Q14,54 22,52 Q28,52 32,50 Q36,48 34,46 Z',
      // Eye
      'M20,47 A1.5,1.5 0 1,1 20,47.01',
      // Neck
      'M34,50 Q36,54 38,58',
      // Front arms (small)
      'M44,64 Q40,68 38,72 Q36,70 40,66 Z',
      // Legs
      'M48,74 L46,88 L42,88 L44,74',
      'M58,74 L60,88 L56,88 L54,74',
      // Tail
      'M72,62 Q80,58 86,56 Q90,54 88,52 Q84,54 76,58 Z',
    ],
  },
  ptero: {
    color: '#0284c7',
    // Wings spread wide, beak
    paths: [
      // Body (small, central)
      'M45,48 Q50,44 55,46 Q58,50 55,54 Q50,56 46,54 Q44,52 45,48 Z',
      // Left wing
      'M45,48 Q32,36 18,28 Q10,24 6,28 Q4,32 10,34 Q18,36 30,42 Q38,46 45,48 Z',
      // Right wing
      'M55,48 Q68,36 82,28 Q90,24 94,28 Q96,32 90,34 Q82,36 70,42 Q62,46 55,48 Z',
      // Wing fingers (left)
      'M6,28 Q4,22 8,20 Q12,22 10,28',
      'M14,26 Q14,20 18,20 Q20,22 16,28',
      // Wing fingers (right)
      'M94,28 Q96,22 92,20 Q88,22 90,28',
      'M86,26 Q86,20 82,20 Q80,22 84,28',
      // Head + beak
      'M48,44 Q46,38 42,36 Q38,34 36,36 Q34,40 38,42 Q42,42 46,44 Z',
      // Long beak
      'M36,36 Q30,34 26,36 Q28,38 34,38 Z',
      // Eye
      'M40,38 A1.5,1.5 0 1,1 40,38.01',
      // Crest
      'M42,36 Q40,30 44,28 Q46,32 44,36 Z',
      // Feet
      'M48,54 L46,62 L42,64 L44,60 L48,54',
      'M52,54 L54,62 L58,64 L56,60 L52,54',
    ],
  },
  dillo: {
    color: '#65a30d',
    // Bipedal, twin head crests
    paths: [
      // Body (lean, bipedal)
      'M42,52 Q50,46 60,48 Q68,50 68,58 Q66,66 58,68 Q48,70 42,66 Q38,60 40,54 Q40,52 42,52 Z',
      // Neck
      'M40,50 Q36,44 32,40 Z',
      // Head
      'M28,36 Q24,32 20,34 Q18,38 22,42 Q26,44 32,42 Q36,40 34,36 Q32,34 28,36 Z',
      // Twin crests (signature feature)
      'M24,32 Q20,22 18,14 Q20,12 24,16 Q26,24 26,30 Z',
      'M30,32 Q32,22 34,14 Q36,12 34,18 Q32,24 30,30 Z',
      // Eye
      'M24,37 A1.5,1.5 0 1,1 24,37.01',
      // Jaw
      'M18,38 Q14,40 14,38 Q16,36 20,36 Z',
      // Small arms
      'M46,58 Q42,62 40,66 Q38,64 42,60 Z',
      // Legs
      'M48,68 L46,84 L42,84 L44,68',
      'M58,68 L60,84 L56,84 L54,68',
      // Claws
      'M42,84 L40,86 M44,84 L44,86',
      'M56,84 L54,86 M58,84 L58,86',
      // Tail
      'M68,56 Q76,52 82,50 Q86,48 84,46 Q80,48 72,52 Z',
    ],
  },
};

const DinoIcon = ({ species, size = 64, className = '' }) => {
  const dino = DINO_SVGS[species];

  if (!dino) {
    return (
      <span className={className} style={{ fontSize: size * 0.75, lineHeight: 1 }}>
        🦕
      </span>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {dino.paths.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={dino.color}
          stroke={dino.color}
          strokeWidth="1.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

export default DinoIcon;
