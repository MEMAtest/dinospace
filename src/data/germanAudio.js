// German Garage uses a deliberately separate word pack. Keeping the mapping
// in data (rather than constructing a filename from user-facing text) makes
// every offline asset auditable and prevents an unreviewed fallback voice.
export const GERMAN_AUDIO_SLUGS = Object.freeze({
  Rot: 'rot', Blau: 'blau', Grün: 'gruen', Gelb: 'gelb', Orange: 'orange', Lila: 'lila', Rosa: 'rosa', Braun: 'braun', Schwarz: 'schwarz', Weiß: 'weiss',
  Eins: 'eins', Zwei: 'zwei', Drei: 'drei', Vier: 'vier', Fünf: 'fuenf', Sechs: 'sechs', Sieben: 'sieben', Acht: 'acht', Neun: 'neun', Zehn: 'zehn',
  Hund: 'hund', Katze: 'katze', Vogel: 'vogel', Fisch: 'fisch', Löwe: 'loewe', Pferd: 'pferd', Kuh: 'kuh', Hase: 'hase',
  Kreis: 'kreis', Quadrat: 'quadrat', Dreieck: 'dreieck', Stern: 'stern', Herz: 'herz', Diamant: 'diamant',
  Apfel: 'apfel', Banane: 'banane', Brot: 'brot', Käse: 'kaese', Pizza: 'pizza', Eis: 'eis',
  Auto: 'auto', Bus: 'bus', Zug: 'zug', Flugzeug: 'flugzeug', Fahrrad: 'fahrrad', Rakete: 'rakete',
  Kopf: 'kopf', Hand: 'hand', Fuß: 'fuss', Auge: 'auge', Nase: 'nase', Ohr: 'ohr', Mund: 'mund', Arm: 'arm',
  Hallo: 'hallo', Tschüss: 'tschuess', Danke: 'danke', Bitte: 'bitte', Ja: 'ja', Nein: 'nein',
});

export const getGermanAudioPath = (term) => {
  const slug = GERMAN_AUDIO_SLUGS[term];
  return slug ? `/audio/de/${slug}.mp3` : null;
};
