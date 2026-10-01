import { readFile, readdir } from 'node:fs/promises';

const IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function validateCuratedManuscripts(source) {
  if (source?.notAvailableInCatalog !== true || !Array.isArray(source.books) || source.books.length !== 4) {
    throw new Error('Curated source must contain exactly four authored books marked unavailable in the catalog.');
  }
  const slugs = new Set();
  for (const book of source.books) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(book.slug) || slugs.has(book.slug)) throw new Error('Every curated book needs a unique safe slug.');
    slugs.add(book.slug);
    if (!book.title?.trim() || !book.summary?.trim() || !book.style?.trim() || !book.palette?.trim() || !book.coverPrompt?.trim()) throw new Error(`${book.slug} is missing reviewed book metadata.`);
    if (!Array.isArray(book.characters) || !book.characters.length || book.characters.some((c) => !c.name?.trim() || !c.visualDescription?.trim())) throw new Error(`${book.slug} is missing its character reference descriptions.`);
    if (!Array.isArray(book.pages) || book.pages.length !== 10) throw new Error(`${book.slug} must have exactly ten pages.`);
    book.pages.forEach((page, index) => {
      const wordCount = page.text?.trim().split(/\s+/).filter(Boolean).length || 0;
      if (page.pageNumber !== index + 1 || wordCount < 20 || wordCount > 40 || !page.title?.trim() || !page.imagePrompt?.trim()) throw new Error(`${book.slug} page ${index + 1} is incomplete or outside the 20–40 word range.`);
      if (page.text.length > 420) throw new Error(`${book.slug} page ${index + 1} exceeds the Story API narration text limit.`);
    });
    if (!Array.isArray(book.comprehension) || book.comprehension.length !== 3 || !Array.isArray(book.wordHelp) || book.wordHelp.length !== 3) throw new Error(`${book.slug} needs three comprehension questions and three word-help entries.`);
    for (const item of book.comprehension) {
      if (!item.prompt?.trim() || !item.clue?.trim() || !item.why?.trim() || !item.answer?.trim() || !Array.isArray(item.choices) || item.choices.filter((choice) => choice === item.answer).length !== 1) throw new Error(`${book.slug} has a comprehension item without one exact answer and replay copy.`);
      if ([item.prompt, item.clue, item.why, ...item.choices].some((text) => text.length > 420)) throw new Error(`${book.slug} has learning copy over the narration text limit.`);
    }
    for (const item of book.wordHelp) if (!item.word?.trim() || !item.meaning?.trim() || item.meaning.length > 420) throw new Error(`${book.slug} has invalid word-help copy.`);
  }
  return source.books;
}

export function curatedBookAssets(book) {
  const assets = [{ kind: 'image', file: 'cover.webp', prompt: book.coverPrompt, reference: false }];
  for (const page of book.pages) assets.push({ kind: 'image', file: `page-${String(page.pageNumber).padStart(2, '0')}.webp`, prompt: page.imagePrompt, reference: true });
  const narration = [book.title, ...book.pages.map((page) => page.text)];
  for (let index = 0; index < narration.length; index += 1) {
    assets.push({
      kind: 'audio',
      file: index === 0 ? 'audio-cover.mp3' : `audio-page-${String(index).padStart(2, '0')}.mp3`,
      text: narration[index],
      previousText: index > 0 ? narration[index - 1] : '',
      nextText: index < narration.length - 1 ? narration[index + 1] : '',
    });
  }
  return assets;
}

export function buildCuratedBookManifest(book, sourceHash) {
  return {
    id: book.slug,
    title: book.title,
    subtitle: book.subtitle,
    ageBand: '5-6',
    summary: book.summary,
    cover: { image: 'cover.webp', audio: 'audio-cover.mp3', narration: book.title },
    pages: book.pages.map((page) => ({
      pageNumber: page.pageNumber,
      title: page.title,
      text: page.text,
      image: `page-${String(page.pageNumber).padStart(2, '0')}.webp`,
      audio: `audio-page-${String(page.pageNumber).padStart(2, '0')}.mp3`,
      imagePrompt: page.imagePrompt,
    })),
    generation: { source: 'reviewed-curated-manuscript', sourcePath: 'docs/storybook-curated-manuscripts.json', sourceHash },
  };
}

export async function validatePackagedBook(outputDir, book, sourceHash) {
  const manifest = JSON.parse(await readFile(`${outputDir}/book.json`, 'utf8'));
  const expected = buildCuratedBookManifest(book, sourceHash);
  if (JSON.stringify(manifest) !== JSON.stringify(expected)) throw new Error(`Packaged manifest for ${book.slug} does not match the reviewed manuscript source.`);
  const files = await readdir(outputDir);
  const expectedFiles = new Set(['book.json', ...curatedBookAssets(book).map((asset) => asset.file)]);
  if (files.length !== expectedFiles.size || files.some((file) => !expectedFiles.has(file))) throw new Error(`Packaged directory for ${book.slug} must contain exactly its manifest and 22 media files.`);
  for (const asset of curatedBookAssets(book)) {
    const bytes = await readFile(`${outputDir}/${asset.file}`);
    if (asset.kind === 'image') validateImageBytes(bytes, 'image/webp');
    else validateNarrationBytes(bytes, 'audio/mpeg');
  }
  return true;
}

export function validateImageBytes(bytes, mimeType) {
  if (!Buffer.isBuffer(bytes) || bytes.length < 100 || !IMAGE_TYPES.has(mimeType)) throw new Error('Illustration has an unsupported MIME type or is unexpectedly small.');
  const isWebp = bytes.subarray(0, 4).toString('ascii') === 'RIFF' && bytes.subarray(8, 12).toString('ascii') === 'WEBP';
  const isPng = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  const isJpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if ((mimeType === 'image/webp' && !isWebp) || (mimeType === 'image/png' && !isPng) || (mimeType === 'image/jpeg' && !isJpeg)) throw new Error('Illustration bytes do not match their MIME type.');
}

export function validateNarrationBytes(bytes, mimeType) {
  if (!Buffer.isBuffer(bytes) || mimeType !== 'audio/mpeg' || bytes.length < 1000) throw new Error('Narration must be a nonempty MP3 of at least 1 KB.');
  const hasId3 = bytes.subarray(0, 3).toString('ascii') === 'ID3';
  const hasMpegFrame = bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0;
  if (!hasId3 && !hasMpegFrame) throw new Error('Narration bytes do not contain an MP3 header.');
}
