/**
 * All progress lives in localStorage, client-side only -- no accounts, no
 * backend, same "no cloud" approach as the app itself. The honest cost: this
 * doesn't follow you across devices or browsers.
 */
const PROGRESS_KEY = "stegotool_learning_progress_v1";
const PASS_THRESHOLD = 0.7; // 70% correct to pass a quiz

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function saveProgress(progress) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
}

function progressKeyFor(lesson, level) {
  return `${lesson}_${level}`;
}

/** Records a quiz attempt. Returns { passed, score, total, percent }. */
function recordQuizResult(lesson, level, score, total) {
  const percent = total > 0 ? score / total : 0;
  const passed = percent >= PASS_THRESHOLD;
  const progress = loadProgress();
  const key = progressKeyFor(lesson, level);
  const existing = progress[key] || {};
  progress[key] = {
    score,
    total,
    percent,
    passed: passed || existing.passed, // once passed, stays passed even if retaken
    bestScore: Math.max(score, existing.bestScore || 0),
    attempts: (existing.attempts || 0) + 1,
    lastAttempt: new Date().toISOString()
  };
  saveProgress(progress);
  return { passed, score, total, percent };
}

function isLevelPassed(lesson, level) {
  const progress = loadProgress();
  return !!progress[progressKeyFor(lesson, level)]?.passed;
}

function isLessonComplete(lesson) {
  return isLevelPassed(lesson, "basic") && isLevelPassed(lesson, "advanced");
}

function getLevelResult(lesson, level) {
  const progress = loadProgress();
  return progress[progressKeyFor(lesson, level)] || null;
}

/** All lesson IDs the curriculum defines -- set by lessons-data.js at load time. */
function allLessonIds() {
  return typeof LESSONS !== "undefined" ? Object.keys(LESSONS) : [];
}

function overallProgressSummary() {
  const lessons = allLessonIds();
  const complete = lessons.filter(isLessonComplete);
  return {
    totalLessons: lessons.length,
    completedLessons: complete.length,
    allComplete: lessons.length > 0 && complete.length === lessons.length
  };
}

function resetProgress() {
  localStorage.removeItem(PROGRESS_KEY);
}
