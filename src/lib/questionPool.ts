import { api } from './api';
import { Question } from '../types';
import { isPremiumQuestion, QUESTIONS } from '../data/questions';

function mapDbRow(row: any, idOffset = 0): Question {
  const options = [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
  const correctLetter = String(row.correct_answer || '').toUpperCase();
  const answerIndex = ['A', 'B', 'C', 'D'].indexOf(correctLetter);
  const correctAnswer = answerIndex >= 0 && answerIndex < options.length ? options[answerIndex] : (options[0] || '');

  return {
    id: Number(row.id) + idOffset,
    subject: row.subject_name || row.subject || 'General',
    topic: row.topic_name || row.topic || 'General',
    difficulty: (row.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
    year: Number(row.year || new Date().getFullYear()),
    question: row.question || 'No question text available',
    options,
    correctAnswer,
    explanation: row.explanation || '',
    incorrectExplanations: {},
    reference: row.reference || '',
    hint: row.hint || '',
    time: row.estimated_time ? `${row.estimated_time} seconds` : '60 seconds',
  };
}

function mapApiQuestion(row: any, index: number, subjectName: string): Question {
  const options = row.options || [row.option_a, row.option_b, row.option_c, row.option_d].filter(Boolean);
  const letterIndex = ['A', 'B', 'C', 'D'].indexOf(String(row.correct_answer || 'A').toUpperCase());
  return {
    id: Number(row.id || 200000 + index),
    subject: row.subject || subjectName,
    topic: row.topic || 'General',
    difficulty: (row.difficulty || 'Medium') as 'Easy' | 'Medium' | 'Hard',
    year: Number(row.year),
    question: row.question,
    options,
    correctAnswer: row.correctAnswer || options[letterIndex] || options[0],
    explanation: row.explanation || '',
    incorrectExplanations: {},
    reference: row.reference || '',
    hint: row.hint || '',
    time: row.time || '60 seconds',
  };
}

export async function loadQuestionPool(isPaid: boolean): Promise<Question[]> {
  const pool: Question[] = [...QUESTIONS];
  const seenTexts = new Set(pool.map((q) => q.question));

  try {
    const response = await api.getQuestions({ limit: 200 });
    const rows = Array.isArray(response?.data?.questions) ? response.data.questions : [];
    for (const row of rows) {
      const mapped = mapDbRow(row);
      if (!seenTexts.has(mapped.question)) {
        seenTexts.add(mapped.question);
        pool.push(mapped);
      }
    }
  } catch {
    // DB unavailable — keep free defaults
  }

  if (isPaid) {
    try {
      const catalogRes = await api.getSubjects();
      const catalog = Array.isArray(catalogRes?.data) ? catalogRes.data : [];

      for (const subject of catalog) {
        if (subject.type === 'nested') {
          for (const child of subject.children || []) {
            for (const year of child.years || []) {
              try {
                const res = await api.getSocialYearQuestions(child.slug, year);
                for (const [idx, row] of (res.data?.questions || []).entries()) {
                  const mapped = mapApiQuestion(row, idx, child.name);
                  if (!seenTexts.has(mapped.question)) {
                    seenTexts.add(mapped.question);
                    pool.push(mapped);
                  }
                }
              } catch {
                // skip locked or unavailable years
              }
            }
          }
          continue;
        }

        for (const year of subject.years || []) {
          try {
            const res = await api.getSubjectYearQuestions(subject.slug, year);
            for (const [idx, row] of (res.data?.questions || []).entries()) {
              const mapped = mapApiQuestion(row, idx, subject.name);
              if (!seenTexts.has(mapped.question)) {
                seenTexts.add(mapped.question);
                pool.push(mapped);
              }
            }
          } catch {
            // skip locked or unavailable years
          }
        }
      }
    } catch {
      // catalog unavailable
    }
  }

  if (!isPaid) {
    return pool.filter((q) => !isPremiumQuestion(q));
  }

  return pool;
}

export async function getCatalogQuestionCount(): Promise<number> {
  try {
    const response = await api.getSubjects();
    const catalog = Array.isArray(response?.data) ? response.data : [];
    return catalog.reduce((sum: number, subject: any) => sum + (subject.questionCount || 0), 0);
  } catch {
    return QUESTIONS.length;
  }
}

export function findQuestionById(pool: Question[], questionId: number): Question | undefined {
  return pool.find((q) => q.id === questionId);
}
