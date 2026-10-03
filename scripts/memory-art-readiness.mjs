import { MEMORY_LEVELS } from '../src/data/index.js';
import { memoryIllustrationAudit } from '../src/data/memoryMatchContent.js';

const entries = memoryIllustrationAudit(MEMORY_LEVELS);
const illustrated = entries.filter(({ illustration }) => illustration);
const missing = entries.filter(({ illustration }) => !illustration);
console.log(JSON.stringify({
  scope: 'Amari Memory Match token artwork; read-only source inventory, no media generation or network requests',
  uniqueTokens: entries.length,
  illustrated: illustrated.length,
  missing: missing.length,
  illustratedTokens: illustrated,
  missingTokens: missing,
}, null, 2));
