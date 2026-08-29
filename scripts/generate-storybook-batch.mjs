import { execFile } from 'node:child_process';
import { access, mkdir, readFile, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const STORY_MODEL = process.env.OPENROUTER_STORY_MODEL || 'deepseek/deepseek-v4-flash-0731';
const STORY_FALLBACK_MODEL = process.env.OPENROUTER_STORY_FALLBACK_MODEL || 'z-ai/glm-5.3-flash';
const IMAGE_MODEL = process.env.OPENROUTER_IMAGE_MODEL || 'bytedance-seed/seedream-5-0-lite';
const IMAGE_FALLBACK_MODEL = process.env.OPENROUTER_IMAGE_FALLBACK_MODEL || 'qwen/qwen-image-3';
const STORY_VOICE_ID = process.env.ELEVENLABS_STORY_VOICE_ID || 'Xb7hH8MSUJpSbSDYk0k2'; // Alice
const ELEVENLABS_MODEL = process.env.ELEVENLABS_STORY_MODEL_ID || 'eleven_v3';
const OUTPUT_ROOT = path.resolve('public/storybooks');
const REQUEST_DELAY_MS = Number(process.env.STORYBOOK_REQUEST_DELAY_MS || 400);

const books = [
  {
    id: 'rex-missing-moon-map',
    title: 'Rex and the Missing Moon Map',
    premise: 'A cheerful young T-Rex astronaut follows clues across the Moon with a small friendly robot and learns that teamwork solves difficult problems.',
    style: 'colourful premium 3D animated family-film illustration, soft rounded forms, rich cinematic lighting, joyful expressive faces',
    palette: 'deep space blue, lunar silver, warm orange, friendly turquoise accents',
  },
  {
    id: 'luna-whispering-forest',
    title: 'Luna and the Whispering Forest',
    premise: 'A curious young red fox follows a mysterious whisper through a magical British woodland and helps her animal friends discover its gentle source.',
    style: 'beautiful hand-painted 2D children\'s storybook illustration, watercolour and gouache textures, expressive animals, delicate natural details',
    palette: 'moss green, warm russet, moonlit blue, soft gold and wildflower colours',
  },
  {
    id: 'nia-great-river-journey',
    title: 'Nia’s Great River Journey',
    premise: 'A young African elephant follows a river with her herd, meets other animals and learns why clean water matters to every living thing.',
    style: 'warm realistic wildlife storybook photography look, natural African light, anatomically believable animals, gentle child-friendly emotion, cinematic but not frightening',
    palette: 'golden grass, river blue, elephant grey, acacia green, warm sunset amber',
  },
];

const storySchema = {
  type: 'object',
  additionalProperties: false,
  required: ['title', 'summary', 'characters', 'coverPrompt', 'pages'],
  properties: {
    title: { type: 'string' },
    summary: { type: 'string' },
    characters: {
      type: 'array',
      minItems: 1,
      maxItems: 5,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['name', 'visualDescription'],
        properties: {
          name: { type: 'string' },
          visualDescription: { type: 'string' },
        },
      },
    },
    coverPrompt: { type: 'string' },
    pages: {
      type: 'array',
      minItems: 10,
      maxItems: 10,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['pageNumber', 'text', 'imagePrompt'],
        properties: {
          pageNumber: { type: 'integer', minimum: 1, maximum: 10 },
          text: { type: 'string' },
          imagePrompt: { type: 'string' },
        },
      },
    },
  },
};

function assertSecrets() {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required');
  if (!ELEVENLABS_API_KEY) throw new Error('ELEVENLABS_API_KEY is required');
}

function words(value) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function validateStory(story, expectedTitle) {
  if (!story || !Array.isArray(story.pages) || story.pages.length !== 10) {
    throw new Error('Story must contain exactly ten pages');
  }
  if (story.title !== expectedTitle) throw new Error(`Expected title “${expectedTitle}”`);
  story.pages.forEach((page, index) => {
    if (page.pageNumber !== index + 1) throw new Error(`Page ${index + 1} has an invalid number`);
    const count = words(page.text);
    if (count < 20 || count > 40) throw new Error(`Page ${index + 1} has ${count} words; expected 20–40`);
    if (!page.imagePrompt?.trim()) throw new Error(`Page ${index + 1} has no image prompt`);
  });
}

async function requestJson(url, options, label) {
  const response = await fetch(url, { ...options, signal: AbortSignal.timeout(120_000) });
  const body = await response.text();
  if (!response.ok) throw new Error(`${label} failed (${response.status}): ${body.slice(0, 500)}`);
  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`${label} returned invalid JSON: ${body.slice(0, 500)}`);
  }
}

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

function detectMediaType(bytes) {
  if (bytes[0] === 0xff && bytes[1] === 0xd8) return 'image/jpeg';
  if (bytes.subarray(1, 4).toString() === 'PNG') return 'image/png';
  if (bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP') return 'image/webp';
  return 'image/png';
}

async function writeWebp(outputPath, bytes) {
  const sourcePath = `${outputPath}.source`;
  await writeFile(sourcePath, bytes);
  try {
    await execFileAsync('cwebp', ['-quiet', '-q', '82', '-resize', '1600', '0', sourcePath, '-o', outputPath]);
  } finally {
    await unlink(sourcePath).catch(() => {});
  }
}

async function generateStory(book, model) {
  const prompt = `Write an original British-English picture book for a child aged five to six.

Required title, which must be copied exactly without any subtitle or punctuation change: ${book.title}
Premise: ${book.premise}

Return exactly ten numbered story pages. Target 24 to 34 words on every page; 20 is the hard minimum and 40 is the hard maximum. Count the words before answering. Use warm, clear, read-aloud language. Create a complete plot with a beginning, discovery, gentle challenge, cooperative solution, and satisfying ending. Avoid peril, villains, brands, copyrighted characters, baby talk, moral lectures, and American spellings. Any factual wildlife or science statements must be accurate.

Define every recurring character with an exact visual description that can be repeated across illustrations. Each image prompt must describe only that page's visible scene while preserving those character details. Do not request words, lettering, signs, captions, borders, split panels, or UI inside images. Show complete characters inside the frame, including feet, tails, ears, and important props.`;

  const result = await requestJson('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dinospace-eight.vercel.app',
      'X-Title': 'Amari Discovery Storybook Studio',
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      max_tokens: 9000,
      messages: [
        { role: 'system', content: 'You are a careful UK children’s picture-book writer and visual continuity editor. Follow the supplied JSON schema exactly.' },
        { role: 'user', content: prompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'amari_storybook', strict: true, schema: storySchema },
      },
      provider: { require_parameters: true, allow_fallbacks: true },
    }),
  }, `Story generation with ${model}`);

  const content = result.choices?.[0]?.message?.content;
  if (typeof content !== 'string') throw new Error(`Story generation with ${model} returned no text`);
  const story = JSON.parse(content);
  validateStory(story, book.title);
  return { story, model, usage: result.usage || null };
}

async function generateStoryWithFallback(book) {
  const attempts = [STORY_MODEL, STORY_MODEL, STORY_FALLBACK_MODEL, STORY_FALLBACK_MODEL];
  let lastError;
  for (const model of attempts) {
    try {
      return await generateStory(book, model);
    } catch (error) {
      lastError = error;
      console.warn(`${book.id}: story attempt with ${model} failed: ${error.message}`);
    }
  }
  throw lastError;
}

function characterBible(story) {
  return story.characters.map((character) => `${character.name}: ${character.visualDescription}`).join(' ');
}

async function generateImageWithModel({ prompt, referenceDataUrl, model, provider }) {
  const payload = {
    model,
    prompt,
    n: 1,
    resolution: '2K',
    aspect_ratio: '4:3',
    provider: { only: [provider], allow_fallbacks: false },
  };
  if (referenceDataUrl) {
    payload.input_references = [{ type: 'image_url', image_url: { url: referenceDataUrl } }];
  }

  const result = await requestJson('https://openrouter.ai/api/v1/images', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://dinospace-eight.vercel.app',
      'X-Title': 'Amari Discovery Storybook Studio',
    },
    body: JSON.stringify(payload),
  }, 'Image generation');

  const encoded = result.data?.[0]?.b64_json;
  if (!encoded) throw new Error('Image generation returned no image data');
  return { bytes: Buffer.from(encoded, 'base64'), mediaType: result.data[0].media_type || 'image/png', usage: result.usage || null };
}

async function generateImage(options) {
  try {
    return await generateImageWithModel({ ...options, model: IMAGE_MODEL, provider: 'seed' });
  } catch (primaryError) {
    console.warn(`Primary image model failed: ${primaryError.message}`);
    return generateImageWithModel({ ...options, model: IMAGE_FALLBACK_MODEL, provider: 'alibaba' });
  }
}

async function generateNarration(text, previousText, nextText) {
  const url = new URL(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(STORY_VOICE_ID)}`);
  url.searchParams.set('output_format', 'mp3_44100_128');
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xi-api-key': ELEVENLABS_API_KEY },
    signal: AbortSignal.timeout(90_000),
    body: JSON.stringify({
      text,
      model_id: ELEVENLABS_MODEL,
      ...(ELEVENLABS_MODEL === 'eleven_v3' ? {} : {
        previous_text: previousText || undefined,
        next_text: nextText || undefined,
      }),
      voice_settings: {
        stability: 0.44,
        similarity_boost: 0.78,
        style: 0.12,
        use_speaker_boost: true,
        speed: 0.93,
      },
    }),
  });
  if (!response.ok) throw new Error(`Narration failed (${response.status}): ${(await response.text()).slice(0, 500)}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length < 1000) throw new Error('Narration returned an unexpectedly small MP3');
  return bytes;
}

function pageVisualPrompt(book, story, page) {
  const realismGuard = book.id === 'nia-great-river-journey'
    ? 'Use naturalistic, photorealistic wildlife imagery with believable anatomy, fur and skin texture, depth of field, and warm cinematic African light. Do not use illustration, painting, watercolour, gouache, cartoon, toy, or 3D-animation styling.'
    : '';
  return `${book.style}. Colour palette: ${book.palette}. Recurring character bible: ${characterBible(story)}. Scene: ${page.imagePrompt}. ${realismGuard} Preserve the exact designs, proportions, colours, clothing, and props from the supplied cover reference. Premium family picture-book composition, clear focal point, complete uncropped characters, safe and welcoming. No words, letters, numbers, captions, logos, watermark, border, collage, split panel, or UI.`;
}

async function generateBook(book) {
  const outputDir = path.join(OUTPUT_ROOT, book.id);
  await mkdir(outputDir, { recursive: true });
  const manifestPath = path.join(outputDir, 'book.json');
  let generated;
  let story;
  if (await exists(manifestPath)) {
    console.log(`${book.id}: resuming existing story`);
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    story = {
      title: manifest.title,
      summary: manifest.summary,
      characters: manifest.characters,
      pages: manifest.pages,
      coverPrompt: manifest.coverPrompt || '',
    };
    generated = { model: manifest.generation?.storyModel || STORY_MODEL };
  } else {
    console.log(`${book.id}: writing story`);
    generated = await generateStoryWithFallback(book);
    story = generated.story;
  }

  const manifest = {
    id: book.id,
    title: story.title,
    ageBand: '5–6',
    style: book.style,
    summary: story.summary,
    characters: story.characters,
    coverPrompt: story.coverPrompt,
    cover: { image: 'cover.webp', audio: 'audio-cover.mp3', narration: story.title },
    pages: story.pages.map((page) => ({
      pageNumber: page.pageNumber,
      text: page.text,
      image: `page-${String(page.pageNumber).padStart(2, '0')}.webp`,
      audio: `audio-page-${String(page.pageNumber).padStart(2, '0')}.mp3`,
      imagePrompt: page.imagePrompt,
    })),
    generation: {
      storyModel: generated.model,
      imageModel: IMAGE_MODEL,
      imageFallbackModel: IMAGE_FALLBACK_MODEL,
      narrationModel: ELEVENLABS_MODEL,
      narrator: 'Alice',
      generatedAt: new Date().toISOString(),
    },
  };
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

  const coverPath = path.join(outputDir, 'cover.webp');
  let coverBytes;
  let coverMediaType;
  if (await exists(coverPath)) {
    console.log(`${book.id}: reusing cover`);
    coverBytes = await readFile(coverPath);
    coverMediaType = detectMediaType(coverBytes);
  } else {
    console.log(`${book.id}: illustrating cover`);
    const realismGuard = book.id === 'nia-great-river-journey'
      ? 'Use naturalistic, photorealistic wildlife imagery with believable anatomy, fur and skin texture, depth of field, and warm cinematic African light. Do not use illustration, painting, watercolour, gouache, cartoon, toy, or 3D-animation styling.'
      : '';
    const coverPrompt = `${book.style}. Colour palette: ${book.palette}. Recurring character bible: ${characterBible(story)}. Cover scene without any title or lettering: ${story.coverPrompt}. ${realismGuard} Premium family picture-book cover composition with generous safe space, complete uncropped characters, warm emotion. No words, letters, numbers, captions, logos, watermark, border, collage, split panel, or UI.`;
    const cover = await generateImage({ prompt: coverPrompt });
    coverBytes = cover.bytes;
    coverMediaType = cover.mediaType;
    await writeWebp(coverPath, coverBytes);
    coverBytes = await readFile(coverPath);
    coverMediaType = 'image/webp';
  }
  const coverDataUrl = `data:${coverMediaType};base64,${coverBytes.toString('base64')}`;

  for (const page of story.pages) {
    const pagePath = path.join(outputDir, `page-${String(page.pageNumber).padStart(2, '0')}.webp`);
    if (await exists(pagePath)) {
      console.log(`${book.id}: reusing page ${page.pageNumber}/10`);
      continue;
    }
    console.log(`${book.id}: illustrating page ${page.pageNumber}/10`);
    const image = await generateImage({ prompt: pageVisualPrompt(book, story, page), referenceDataUrl: coverDataUrl });
    await writeWebp(pagePath, image.bytes);
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }

  const narration = [story.title, ...story.pages.map((page) => page.text)];
  for (let index = 0; index < narration.length; index += 1) {
    const fileName = index === 0 ? 'audio-cover.mp3' : `audio-page-${String(index).padStart(2, '0')}.mp3`;
    if (await exists(path.join(outputDir, fileName))) {
      console.log(`${book.id}: reusing narration ${index === 0 ? 'cover' : `page ${index}/10`}`);
      continue;
    }
    console.log(`${book.id}: narrating ${index === 0 ? 'cover' : `page ${index}/10`}`);
    const audio = await generateNarration(narration[index], narration[index - 1], narration[index + 1]);
    await writeFile(path.join(outputDir, fileName), audio);
    await new Promise((resolve) => setTimeout(resolve, REQUEST_DELAY_MS));
  }
}

async function main() {
  assertSecrets();
  await mkdir(OUTPUT_ROOT, { recursive: true });
  for (const book of books) await generateBook(book);
  console.log('Storybook batch complete');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
