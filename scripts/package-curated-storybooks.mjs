import { createHash } from 'node:crypto';
import { access, mkdir, open, readFile, readdir, rename, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStoryImage, createStoryNarration, createStorySession, STORY_API_BASE } from '../src/data/storybookApi.js';
import {
  buildCuratedBookManifest,
  curatedBookAssets,
  validatePackagedBook,
  validateCuratedManuscripts,
  validateImageBytes,
  validateNarrationBytes,
} from './storybook-curated-packager-core.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_PATH = path.join(ROOT, 'docs/storybook-curated-manuscripts.json');
const STAGING_ROOT = path.join(ROOT, 'tmp/storybook-curated-media');
const OUTPUT_ROOT = path.join(ROOT, 'public/storybooks');
const REQUEST_STATE = path.join(ROOT, 'tmp/storybook-curated-request-state.json');
const LOCK_PATH = path.join(ROOT, 'tmp/storybook-curated-packager.lock');
const API_ORIGIN = 'https://dinospace-eight.vercel.app';
const WINDOW_MS = 10 * 60 * 1000;
const API_LIMIT = 30;
const DEFAULT_MEDIA_CALL_LIMIT = 22;

const args = new Set(process.argv.slice(2));
const candidateImages = args.has('--candidate-images');
const valueArg = (prefix, fallback) => process.argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length) || fallback;
const refreshCandidatePages = new Set(valueArg('--refresh-candidate-pages=', '').split(',').map((value) => Number(value.trim())).filter((value) => Number.isInteger(value) && value >= 1 && value <= 10));
const refreshStagedFiles = new Set(valueArg('--refresh-staged-files=', '').split(',').map((value) => value.trim()).filter((value) => /^[a-z0-9.-]+$/i.test(value)));
const generate = args.has('--generate');
const selectedSlug = valueArg('--book=', '');
const requestedCallLimit = Number(valueArg('--max-media-calls=', String(DEFAULT_MEDIA_CALL_LIMIT)));
if (!Number.isInteger(requestedCallLimit) || requestedCallLimit < 1 || requestedCallLimit > 22) {
  throw new Error('--max-media-calls must be an integer from 1 to 22 (one default book batch).');
}

const exists = async (file) => access(file).then(() => true, () => false);
const assetsForBook = (book) => {
  const assets = curatedBookAssets(book);
  if (!candidateImages) return assets;
  if (book.slug !== 'bo-busy-bee-garden') throw new Error('Image revision candidate mode is currently scoped to Bo only.');
  return assets.filter((asset) => asset.kind === 'image' && /^page-(?:0[1-6]|10)\.webp$/.test(asset.file)).map((asset) => ({ ...asset, reference: false }));
};
const atomicWrite = async (file, bytes) => {
  await mkdir(path.dirname(file), { recursive: true });
  const partial = `${file}.partial`;
  await writeFile(partial, bytes, { flag: 'w' });
  await rename(partial, file);
};
const parseJsonFile = async (file, fallback) => {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return fallback; }
};

async function finalizeBook(item) {
  const allAssets = curatedBookAssets(item.book);
  for (const asset of allAssets) {
    const bytes = await readFile(path.join(item.stageDir, asset.file));
    if (asset.kind === 'image') validateImageBytes(bytes, 'image/webp');
    else validateNarrationBytes(bytes, 'audio/mpeg');
  }
  const manifest = buildCuratedBookManifest(item.book, item.sourceHash);
  await atomicWrite(path.join(item.stageDir, 'book.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  if (await exists(item.outputDir)) throw new Error(`Refusing to overwrite existing packaged directory ${item.outputDir}; review it before replacement.`);
  await rm(path.join(item.stageDir, '.checkpoint.json'), { force: true });
  await mkdir(path.dirname(item.outputDir), { recursive: true });
  await rename(item.stageDir, item.outputDir);
  await validatePackagedBook(item.outputDir, item.book, item.sourceHash);
  console.log(`Packaged ${item.book.slug}: 22 verified assets plus book.json. Catalog is unchanged.`);
}

async function loadRunState() {
  const state = await parseJsonFile(REQUEST_STATE, { requests: [], blockedUntil: 0 });
  const now = Date.now();
  state.requests = Array.isArray(state.requests) ? state.requests.filter((item) => Number.isFinite(item.at) && now - item.at < WINDOW_MS) : [];
  state.blockedUntil = Number.isFinite(state.blockedUntil) ? state.blockedUntil : 0;
  return state;
}

async function main() {
  const raw = JSON.parse(await readFile(SOURCE_PATH, 'utf8'));
  const books = validateCuratedManuscripts(raw);
  const targets = selectedSlug ? books.filter((book) => book.slug === selectedSlug) : books;
  if (!targets.length) throw new Error(`Unknown curated Storybook slug: ${selectedSlug}`);

  const pending = [];
  for (const book of targets) {
    const stageDir = path.join(candidateImages ? path.join(ROOT, 'tmp/storybook-curated-candidates') : STAGING_ROOT, book.slug);
    const outputDir = path.join(OUTPUT_ROOT, book.slug);
    const stageAssets = assetsForBook(book);
    const sourceHash = createHash('sha256').update(JSON.stringify(book)).digest('hex');
    if (!candidateImages && await exists(outputDir)) await validatePackagedBook(outputDir, book, sourceHash);
    const missing = [];
    for (const asset of stageAssets) {
      const target = !candidateImages && await exists(path.join(outputDir, asset.file))
        ? path.join(outputDir, asset.file)
        : path.join(stageDir, asset.file);
      const forceCandidateRefresh = candidateImages && refreshCandidatePages.has(Number(asset.file.match(/^page-(\d+)/)?.[1]));
      const forceStageRefresh = !candidateImages && refreshStagedFiles.has(asset.file);
      if (forceCandidateRefresh || forceStageRefresh || !(await exists(target))) missing.push(asset);
    }
    pending.push({ book, sourceHash, stageDir, outputDir, missing });
  }

  const missingTotal = pending.reduce((total, item) => total + item.missing.length, 0);
  if (!generate) {
    const mode = candidateImages ? 'image-review-candidate' : 'dry-run';
    console.log(JSON.stringify({ mode, providerCalls: 0, books: pending.map(({ book, missing }) => ({ slug: book.slug, assetsNeeded: missing.length, totalAssets: candidateImages ? assetsForBook(book).length : 22 })), missingAssets: missingTotal, nextCommand: `node scripts/package-curated-storybooks.mjs --generate ${candidateImages ? '--candidate-images ' : ''}--book=${pending.find((item) => item.missing.length)?.book.slug || targets[0].slug}` }, null, 2));
    return;
  }
  if (STORY_API_BASE !== `${API_ORIGIN}/api/story`) throw new Error('Generation requires the canonical hosted Storybook API.');
  if (refreshStagedFiles.size && (await Promise.all(pending.map((item) => exists(item.outputDir)))).some(Boolean)) throw new Error('--refresh-staged-files can only refresh unpublished staged assets, never packaged books.');
  for (const item of pending) {
    if (!(await exists(item.stageDir))) continue;
    const stagedFiles = await readdir(item.stageDir);
    const checkpoint = await parseJsonFile(path.join(item.stageDir, '.checkpoint.json'), null);
    const hasAsset = stagedFiles.some((file) => file !== '.checkpoint.json');
    if (hasAsset && !checkpoint) throw new Error(`Staged files for ${item.book.slug} have no source checkpoint; preserve and inspect them before continuing.`);
    if (checkpoint && checkpoint.sourceHash !== item.sourceHash) throw new Error(`Staged files for ${item.book.slug} were made from different manuscript content; preserve and review before continuing.`);
  }
  for (const item of pending) {
    if (item.missing.length === 0 && !(await exists(item.outputDir)) && (await exists(path.join(item.stageDir, '.checkpoint.json')))) await finalizeBook(item);
  }
  if (!missingTotal) {
    console.log(candidateImages ? 'All requested Bo image candidates are present in ignored tmp; public files are unchanged.' : 'All selected books already have 22 packaged assets; no provider calls needed.');
    return;
  }
  const state = await loadRunState();
  if (state.blockedUntil > Date.now()) {
    throw new Error(`Story API cooldown is active until ${new Date(state.blockedUntil).toISOString()}; wait at least ten minutes after the previous 429.`);
  }
  const recentCalls = state.requests.length;
  const remainingRateBudget = Math.max(0, API_LIMIT - recentCalls - 1); // reserve one call for the session endpoint
  const mediaBudget = Math.min(requestedCallLimit, remainingRateBudget);
  if (!mediaBudget) throw new Error('The local request journal shows no safe calls left in the current ten-minute window. Resume after it expires.');

  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  await promisify(execFile)('cwebp', ['-version']);

  let requestsThisRun = 0;
  const guardedFetch = globalThis.fetch;
  globalThis.fetch = async (input, options = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.origin !== API_ORIGIN || !url.pathname.startsWith('/api/story/')) throw new Error('Refusing a non-canonical Storybook API request.');
    if (requestsThisRun >= mediaBudget + 1) throw new Error('Run call budget exhausted; resume in a later bounded run.');
    requestsThisRun += 1;
    state.requests.push({ at: Date.now(), endpoint: url.pathname.split('/').at(-1) });
    await atomicWrite(REQUEST_STATE, `${JSON.stringify(state, null, 2)}\n`);
    const headers = new Headers(options.headers || (input instanceof Request ? input.headers : undefined));
    headers.set('Origin', API_ORIGIN);
    const response = await guardedFetch(input, { ...options, headers });
    if (response.status === 429) {
      state.blockedUntil = Date.now() + WINDOW_MS;
      await atomicWrite(REQUEST_STATE, `${JSON.stringify(state, null, 2)}\n`);
      throw new Error('Story API returned 429. Stopped immediately and recorded a ten-minute cooldown; do not retry before it expires.');
    }
    return response;
  };

  try {
    const session = await createStorySession();
    let mediaCalls = 0;
    for (const item of pending) {
      if (!item.missing.length || mediaCalls >= mediaBudget) continue;
      await mkdir(item.stageDir, { recursive: true });
      const checkpointFile = path.join(item.stageDir, '.checkpoint.json');
      const checkpoint = await parseJsonFile(checkpointFile, null);
      if (checkpoint && checkpoint.sourceHash !== item.sourceHash) throw new Error(`Staged files for ${item.book.slug} were made from different manuscript content; preserve and review before regenerating.`);
      await atomicWrite(checkpointFile, `${JSON.stringify({ slug: item.book.slug, sourceHash: item.sourceHash, updatedAt: new Date().toISOString() }, null, 2)}\n`);
      for (const asset of item.missing) {
        if (mediaCalls >= mediaBudget) break;
        let bytes;
        if (asset.kind === 'image') {
          const pageNumber = Number(asset.file.match(/^page-(\d+)/)?.[1]);
          const boShots = ({
            1: 'Use a wide establishing view that shows the garden and places Bo and Gran smaller within it.',
            2: 'Use a medium side view focused on the single blossom and bee, with Bo and Gran farther back.',
            3: 'Use a close botanical view of the bee and blossom; show Bo and Gran only softly in the distant background.',
            4: 'Use a diagonal action composition showing the bee in flight between two clearly separate blossoms.',
            5: 'Use an eye-level two-shot of Bo asking Gran, with the flowering branches as secondary background detail.',
            6: 'Use a wide view focused on Bo and Gran safely watching from the path behind the low fence. Keep the whole flower bed in the distant background. If a bee is visible, make it a tiny speck beside a blossom, no taller than one fiftieth of Bo’s height. No close-up bee, no foreground bee, no enlarged insect.',
            7: 'Use an upward view through the branches, with Bo and Gran small at the bottom of the frame.',
            8: 'Use a close view of the tree base, fallen petals, and tiny green apples; keep Bo and Gran to one side.',
            9: 'Use a medium harvest scene showing the basket, a few ripe apples, Bo, and Gran in a different pose.',
            10: 'Use a quiet wide sunset view, with Bo and Gran on the path looking across to one tiny distant bee. The bee must be no taller than Bo’s thumbnail and remain near a far blossom; do not enlarge it or put it in the foreground.',
          })[pageNumber] || '';
          const shot = candidateImages ? boShots : 'Choose a camera angle and arrangement that makes this page action unmistakable and differs from the cover and nearby pages.';
          const referenceImage = undefined;
          const styleLock = item.book.style === 'painted-2d'
            ? 'Use hand-painted 2D children’s picture-book art with matte watercolor and gouache texture, visible soft brush edges, and consistent hand-drawn outlines. This must read as a flat 2D illustration. Do not use 3D CGI rendering, photorealism, plastic textures, or a 3D animated-film look.'
            : `Use this exact illustration style throughout: ${item.book.style}. Do not switch to another rendering style.`;
          const pageForImage = item.book.pages[pageNumber - 1];
          const sceneText = `${asset.prompt} ${asset.file === 'cover.webp' ? '' : pageForImage?.text || ''}`.toLowerCase();
          const sceneCharacters = item.book.characters.filter((character) => {
            const characterName = character.name.toLowerCase();
            if (sceneText.includes(characterName)) return true;
            if (characterName === 'bea' && /\bbees?\b/.test(sceneText)) return true;
            if (item.book.slug === 'sami-night-light-parade' && characterName === 'tavi') return /\btavi\b|firefly|moving light|blinking light/.test(sceneText);
            return false;
          });
          const characterLock = sceneCharacters.map((character) => `${character.name} must match exactly: ${character.visualDescription}`).join('; ');
          const sceneIncludesTavi = sceneCharacters.some((character) => character.name.toLowerCase() === 'tavi');
          const tinyFirefly = item.book.slug === 'sami-night-light-parade' && sceneIncludesTavi
            ? 'Tavi is a tiny, natural-sized firefly: in any wide or medium shot, omit the body and show only a pinprick yellow-green glow less than one percent of the image height. If the body is clearly visible, it must be smaller than Sami’s thumbnail at arm’s length; never enlarge the insect for readability. The glow is no larger than a flower centre. Never put the firefly in the foreground.'
            : '';
          const excludeTavi = item.book.slug === 'sami-night-light-parade' && !sceneIncludesTavi ? 'Do not add Tavi or any firefly to this scene.' : '';
          const illustrationType = asset.file === 'cover.webp' ? 'This is a storybook cover illustration.' : 'This is a page illustration, not a cover portrait.';
          const explicitCleanShaven = item.book.slug === 'sami-night-light-parade' && sceneCharacters.some((character) => character.name.toLowerCase() === 'dad')
            ? 'Dad is clean-shaven, with smooth bare cheeks, chin and upper lip; no beard, moustache or stubble.'
            : '';
          const closeFaceInstruction = item.book.slug === 'sami-night-light-parade' && asset.file === 'page-03.webp'
            ? 'Keep Dad’s face clearly visible and clean-shaven; his chin and upper lip are smooth skin, not dark shadow.'
            : '';
          const imagePrompt = `${styleLock} Colour palette: ${item.book.palette}. Binding character design reference (only for characters required by this scene): ${characterLock || 'Keep unmentioned recurring characters out of the scene.'}. When a character appears, preserve their face, hair silhouette, skin/fur colour, clothes and proportions exactly. Do not invent facial hair, glasses, hats, jewelry or other accessories absent from that character’s description. ${explicitCleanShaven} ${closeFaceInstruction} ${tinyFirefly} ${excludeTavi} ${illustrationType} Central narrated action: ${asset.prompt}. Composition instruction: ${shot} Choose a camera angle and arrangement distinct from the other page moments. Do not repeat a previous composition. Premium family picture-book composition, clear focal point, safe and welcoming. No words, letters, numbers, captions, logos, watermark, border, collage, split panel, or UI.`;
          const blob = await createStoryImage({ prompt: imagePrompt, referenceImage }, session);
          if (blob.type && !['image/png', 'image/jpeg', 'image/webp'].includes(blob.type)) throw new Error(`Unexpected illustration MIME type: ${blob.type}`);
          const source = Buffer.from(await blob.arrayBuffer());
          validateImageBytes(source, blob.type);
          const sourceFile = path.join(item.stageDir, `${asset.file}.source`);
          await atomicWrite(sourceFile, source);
          try {
            await promisify(execFile)('cwebp', ['-quiet', '-q', '82', '-resize', '1600', '0', sourceFile, '-o', `${path.join(item.stageDir, asset.file)}.partial`]);
          } finally { await rm(sourceFile, { force: true }); }
          const temporaryWebp = `${path.join(item.stageDir, asset.file)}.partial`;
          const webp = await readFile(temporaryWebp);
          validateImageBytes(webp, 'image/webp');
          await rename(temporaryWebp, path.join(item.stageDir, asset.file));
        } else {
          const narration = await createStoryNarration({ text: asset.text, previousText: asset.previousText, nextText: asset.nextText }, session);
          if (narration.type !== 'audio/mpeg') throw new Error(`Unexpected narration MIME type: ${narration.type || 'missing'}`);
          bytes = Buffer.from(await narration.arrayBuffer());
          validateNarrationBytes(bytes, narration.type);
          await atomicWrite(path.join(item.stageDir, asset.file), bytes);
        }
        mediaCalls += 1;
        console.log(`Checkpointed ${item.book.slug}/${asset.file} (${mediaCalls}/${mediaBudget} media calls this run).`);
      }

      const complete = (await Promise.all(assetsForBook(item.book).map((asset) => exists(path.join(item.stageDir, asset.file))))).every(Boolean);
      if (complete && candidateImages) console.log(`Image review candidates ready under ignored tmp for ${item.book.slug}; public package remains unchanged.`);
      else if (complete) await finalizeBook(item);
      if (mediaCalls >= mediaBudget) break;
    }
    console.log(`Run complete: ${mediaCalls} media requests; ${Math.max(0, missingTotal - mediaCalls)} requested assets remain.`);
  } finally {
    globalThis.fetch = guardedFetch;
  }
}

async function run() {
  if (!generate) return main();
  await mkdir(path.dirname(LOCK_PATH), { recursive: true });
  let lock;
  try { lock = await open(LOCK_PATH, 'wx'); } catch (error) {
    if (error.code === 'EEXIST') throw new Error(`A packager lock exists at ${LOCK_PATH}; do not start another generation run. Inspect the recorded PID before removing a stale lock.`);
    throw error;
  }
  try {
    await lock.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`);
    await main();
  } finally {
    await lock.close();
    await rm(LOCK_PATH, { force: true });
  }
}

run().catch((error) => { console.error(error.message); process.exitCode = 1; });
