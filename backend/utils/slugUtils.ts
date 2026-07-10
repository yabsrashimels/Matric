const FOLDER_ALIASES: Record<string, string> = {
  maths: 'mathematics',
  math: 'mathematics',
  socal: 'social',
  social: 'social',
};

const DISPLAY_NAMES: Record<string, string> = {
  mathematics: 'Mathematics',
  physics: 'Physics',
  chemistry: 'Chemistry',
  biology: 'Biology',
  english: 'English',
  aptitude: 'Aptitude',
  social: 'Social',
  history: 'History',
  geography: 'Geography',
  economics: 'Economics',
  civics: 'Civics',
  ict: 'ICT',
};

const ICONS: Record<string, string> = {
  mathematics: 'Calculator',
  physics: 'Atom',
  chemistry: 'Beaker',
  biology: 'Dna',
  english: 'BookOpen',
  aptitude: 'Cpu',
  social: 'Globe',
  history: 'Milestone',
  geography: 'Globe',
  economics: 'Coins',
  civics: 'Shield',
  ict: 'Cpu',
};

const SKIP_FOLDERS = new Set(['forpay_500_nextplan']);

export function normalizeSlug(value: string): string {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
  return FOLDER_ALIASES[cleaned] || cleaned;
}

export function toDisplayName(slug: string): string {
  const normalized = normalizeSlug(slug);
  if (DISPLAY_NAMES[normalized]) return DISPLAY_NAMES[normalized];
  return normalized
    .split(/[-_]/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

export function getSubjectIcon(slug: string): string {
  return ICONS[normalizeSlug(slug)] || 'BookOpen';
}

export function shouldSkipFolder(folderName: string): boolean {
  return SKIP_FOLDERS.has(folderName.toLowerCase());
}

export function resolveFolderName(slug: string, availableFolders: string[]): string | null {
  const normalized = normalizeSlug(slug);
  const match = availableFolders.find((folder) => normalizeSlug(folder) === normalized);
  return match || null;
}

export function extractYearFromFilename(filename: string): number | null {
  const matches = filename.match(/(\d{4})/g);
  if (!matches || matches.length === 0) return null;
  const year = parseInt(matches[matches.length - 1], 10);
  if (Number.isNaN(year) || year < 1990 || year > 2100) return null;
  return year;
}

export function sanitizePathSegment(segment: string): string | null {
  const cleaned = segment.trim().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!cleaned || cleaned.includes('..')) return null;
  return cleaned;
}
