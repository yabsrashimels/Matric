import fs from 'fs';
import path from 'path';
import {
  extractYearFromFilename,
  getSubjectIcon,
  normalizeSlug,
  resolveFolderName,
  shouldSkipFolder,
  toDisplayName,
} from '../utils/slugUtils';

export interface CatalogChild {
  slug: string;
  name: string;
  years: number[];
  questionCount: number;
}

export interface CatalogSubject {
  slug: string;
  name: string;
  icon: string;
  type: 'flat' | 'nested';
  years: number[];
  children: CatalogChild[];
  questionCount: number;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const CATALOG_TTL_MS = 60_000;
const FILE_CACHE_TTL_MS = 300_000;
const FREE_PREVIEW_LIMIT = 5;

let catalogCache: CacheEntry<CatalogSubject[]> | null = null;
const fileCache = new Map<string, CacheEntry<RawQuestion[]>>();

export interface RawQuestion {
  subject: string;
  topic: string;
  year: number;
  difficulty: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  explanation?: string;
  reference?: string;
  hint?: string;
  estimated_time?: number;
}

function isJsonFile(name: string): boolean {
  return name.toLowerCase().endsWith('.json');
}

function listTopLevelFolders(): string[] {
  if (!fs.existsSync(DATA_DIR)) return [];
  return fs
    .readdirSync(DATA_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !shouldSkipFolder(entry.name))
    .map((entry) => entry.name);
}

function listJsonFiles(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs.readdirSync(dirPath).filter(isJsonFile);
}

function listSubfolders(dirPath: string): string[] {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !shouldSkipFolder(entry.name))
    .map((entry) => entry.name);
}

function getYearsFromDirectory(dirPath: string): { years: number[]; files: string[] } {
  const files = listJsonFiles(dirPath);
  const years = new Set<number>();
  for (const file of files) {
    const year = extractYearFromFilename(file);
    if (year) years.add(year);
  }
  return { years: Array.from(years).sort((a, b) => a - b), files };
}

function readJsonFile(filePath: string): RawQuestion[] {
  const cached = fileCache.get(filePath);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value;
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(raw);
  const questions = Array.isArray(parsed) ? parsed : [];
  fileCache.set(filePath, {
    value: questions,
    expiresAt: Date.now() + FILE_CACHE_TTL_MS,
  });
  return questions;
}

function findJsonFileForYear(dirPath: string, year: number): string | null {
  const files = listJsonFiles(dirPath);
  const match = files.find((file) => extractYearFromFilename(file) === year);
  return match ? path.join(dirPath, match) : null;
}

function countQuestionsInDirectory(dirPath: string): number {
  let total = 0;
  for (const file of listJsonFiles(dirPath)) {
    const filePath = path.join(dirPath, file);
    try {
      total += readJsonFile(filePath).length;
    } catch {
      // skip invalid files
    }
  }
  return total;
}

function buildFlatSubject(folderName: string): CatalogSubject | null {
  const folderPath = path.join(DATA_DIR, folderName);
  const rootJsonFiles = listJsonFiles(DATA_DIR).filter((file) => {
    const slug = normalizeSlug(folderName);
    return file.toLowerCase().includes(slug.slice(0, 4));
  });

  const { years: folderYears } = getYearsFromDirectory(folderPath);
  const rootYears = rootJsonFiles
    .map((file) => extractYearFromFilename(file))
    .filter((year): year is number => year !== null);

  const years = Array.from(new Set([...folderYears, ...rootYears])).sort((a, b) => a - b);
  if (years.length === 0 && rootJsonFiles.length === 0) return null;

  const slug = normalizeSlug(folderName);
  let questionCount = countQuestionsInDirectory(folderPath);
  for (const file of rootJsonFiles) {
    try {
      questionCount += readJsonFile(path.join(DATA_DIR, file)).length;
    } catch {
      // skip
    }
  }

  return {
    slug,
    name: toDisplayName(slug),
    icon: getSubjectIcon(slug),
    type: 'flat',
    years,
    children: [],
    questionCount,
  };
}

function buildNestedSubject(folderName: string): CatalogSubject | null {
  const folderPath = path.join(DATA_DIR, folderName);
  const subfolders = listSubfolders(folderPath);
  if (subfolders.length === 0) return null;

  const children: CatalogChild[] = [];
  for (const childFolder of subfolders) {
    const childPath = path.join(folderPath, childFolder);
    const { years } = getYearsFromDirectory(childPath);
    if (years.length === 0) continue;
    children.push({
      slug: normalizeSlug(childFolder),
      name: toDisplayName(childFolder),
      years,
      questionCount: countQuestionsInDirectory(childPath),
    });
  }

  if (children.length === 0) return null;

  const slug = normalizeSlug(folderName);
  return {
    slug,
    name: toDisplayName(slug),
    icon: getSubjectIcon(slug),
    type: 'nested',
    years: [],
    children: children.sort((a, b) => a.name.localeCompare(b.name)),
    questionCount: children.reduce((sum, child) => sum + child.questionCount, 0),
  };
}

export function invalidateCatalogCache(): void {
  catalogCache = null;
  fileCache.clear();
}

export function getCatalog(): CatalogSubject[] {
  if (catalogCache && catalogCache.expiresAt > Date.now()) {
    return catalogCache.value;
  }

  const folders = listTopLevelFolders();
  const subjects: CatalogSubject[] = [];

  for (const folder of folders) {
    const nested = buildNestedSubject(folder);
    if (nested) {
      subjects.push(nested);
      continue;
    }
    const flat = buildFlatSubject(folder);
    if (flat) subjects.push(flat);
  }

  subjects.sort((a, b) => a.name.localeCompare(b.name));
  catalogCache = { value: subjects, expiresAt: Date.now() + CATALOG_TTL_MS };
  return subjects;
}

export function getSubjectBySlug(slug: string): CatalogSubject | null {
  const normalized = normalizeSlug(slug);
  return getCatalog().find((subject) => subject.slug === normalized) || null;
}

export function getSocialChildren(): CatalogChild[] {
  const social = getCatalog().find((subject) => subject.slug === 'social');
  return social?.children || [];
}

function loadQuestionsFromPaths(paths: string[], fallbackYear?: number): RawQuestion[] {
  const all: RawQuestion[] = [];
  for (const filePath of paths) {
    try {
      const questions = readJsonFile(filePath);
      for (const question of questions) {
        all.push({
          ...question,
          year: question.year || fallbackYear || extractYearFromFilename(path.basename(filePath)) || 0,
        });
      }
    } catch (error) {
      console.warn(`Failed to read question file: ${filePath}`, error);
    }
  }
  return all;
}

export function loadSubjectYearQuestions(subjectSlug: string, year: number): RawQuestion[] {
  const folders = listTopLevelFolders();
  const folderName = resolveFolderName(subjectSlug, folders);
  if (!folderName) return [];

  const folderPath = path.join(DATA_DIR, folderName);
  const filePath = findJsonFileForYear(folderPath, year);
  const paths: string[] = [];

  if (filePath) paths.push(filePath);

  if (normalizeSlug(folderName) === 'mathematics') {
    const rootMatch = listJsonFiles(DATA_DIR).find((file) => extractYearFromFilename(file) === year);
    if (rootMatch) paths.push(path.join(DATA_DIR, rootMatch));
  }

  return loadQuestionsFromPaths(paths, year);
}

export function loadSocialYearQuestions(subSubjectSlug: string, year: number): RawQuestion[] {
  const folders = listTopLevelFolders();
  const socialFolder = resolveFolderName('social', folders);
  if (!socialFolder) return [];

  const socialPath = path.join(DATA_DIR, socialFolder);
  const subfolders = listSubfolders(socialPath);
  const subFolder = resolveFolderName(subSubjectSlug, subfolders);
  if (!subFolder) return [];

  const filePath = findJsonFileForYear(path.join(socialPath, subFolder), year);
  if (!filePath) return [];
  return loadQuestionsFromPaths([filePath], year);
}

export function getFreePreviewQuestions(questions: RawQuestion[]): RawQuestion[] {
  return questions.slice(0, FREE_PREVIEW_LIMIT);
}

export interface SearchFilters {
  subject?: string;
  year?: number;
  topic?: string;
  difficulty?: string;
  q?: string;
}

export function searchQuestions(filters: SearchFilters): RawQuestion[] {
  const catalog = getCatalog();
  const results: RawQuestion[] = [];
  const normalizedSubject = filters.subject ? normalizeSlug(filters.subject) : undefined;
  const topicNeedle = filters.topic?.trim().toLowerCase();
  const queryNeedle = filters.q?.trim().toLowerCase();
  const difficulty = filters.difficulty?.trim();

  const loadAndFilter = (questions: RawQuestion[], subjectName: string) => {
    for (const question of questions) {
      const questionYear = Number(question.year);
      if (filters.year && questionYear !== filters.year) continue;
      if (difficulty && difficulty !== 'All' && question.difficulty !== difficulty) continue;
      if (topicNeedle && !String(question.topic || '').toLowerCase().includes(topicNeedle)) continue;
      if (queryNeedle) {
        const haystack = [
          question.question,
          question.topic,
          question.explanation,
          subjectName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(queryNeedle)) continue;
      }
      results.push({ ...question, subject: question.subject || subjectName });
    }
  };

  for (const subject of catalog) {
    if (normalizedSubject && subject.slug !== normalizedSubject) continue;

    if (subject.type === 'nested') {
      for (const child of subject.children) {
        if (normalizedSubject && normalizeSlug(child.slug) !== normalizedSubject && subject.slug !== normalizedSubject) {
          continue;
        }
        for (const year of child.years) {
          if (filters.year && year !== filters.year) continue;
          const questions = loadSocialYearQuestions(child.slug, year);
          loadAndFilter(questions, child.name);
        }
      }
      continue;
    }

    for (const year of subject.years) {
      if (filters.year && year !== filters.year) continue;
      const questions = loadSubjectYearQuestions(subject.slug, year);
      loadAndFilter(questions, subject.name);
    }
  }

  return results;
}
