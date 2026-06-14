/**
 * =========================================================================
 * SPACED REPETITION memory engine AND RELATIONAL STORAGE MOCKUP
 * =========================================================================
 * This module manages persistent spaced repetition records ("relational tables"
 * mocked in localStorage) and provides the core calculation logic.
 * 
 * Each record implements the following schema:
 * - id: unique key
 * - userId: student id
 * - subtopicId: the syllabus reference (e.g., "10.1")
 * - title: description of the derivation/topic
 * - topicName: chapter heading (e.g., "Topic 10: Fields")
 * - rubricScore: the last score obtained (0 to 3)
 * - previousInterval: the prior spacing window (days)
 * - currentInterval: the current active spacing window (days)
 * - nextReviewDue: timestamp of next assessment
 * - isConceptLeak: warning flag if score is below 2 (active conceptual trap)
 * - lastTested: timestamp of last interaction
 */

export interface StudentReviewTask {
  id: string;
  userId: string;
  subtopicId: string;
  title: string;
  topicName: string;
  rubricScore: number;
  previousInterval: number;
  currentInterval: number;
  nextReviewDue: string;
  isConceptLeak: boolean;
  lastTested: string;
}

const STORAGE_KEY = "ib_physics_srs_records";

const DEFAULT_TASKS: StudentReviewTask[] = [
  {
    id: "task_1",
    userId: "student_1",
    subtopicId: "10.1",
    title: "Derive Gravitational Potential Gradient equation (dV/dr)",
    topicName: "Topic 10.1: Describing Fields",
    rubricScore: 1,
    previousInterval: 3,
    currentInterval: 1,
    nextReviewDue: new Date(Date.now() - 3600000 * 4).toISOString(), // 4 hours ago (OVERDUE - Decay badge active)
    isConceptLeak: true,
    lastTested: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "task_2",
    userId: "student_1",
    subtopicId: "10.1",
    title: "Equate Kepler's Third Law (T² ∝ r³) using Newton's laws",
    topicName: "Topic 10.1: Describing Fields",
    rubricScore: 3,
    previousInterval: 1,
    currentInterval: 3,
    nextReviewDue: new Date(Date.now() - 3600000 * 25).toISOString(), // 25 hours ago (OVERDUE - Decay badge active)
    isConceptLeak: false,
    lastTested: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "task_3",
    userId: "student_1",
    subtopicId: "10.2",
    title: "Derive satellite orbital speed (v = √[GM/r])",
    topicName: "Topic 10.2: Fields at Work",
    rubricScore: 3,
    previousInterval: 0,
    currentInterval: 1,
    nextReviewDue: new Date(Date.now() + 86400000 * 2).toISOString(), // 2 days in the future (Upcoming)
    isConceptLeak: false,
    lastTested: new Date(Date.now() - 12000000).toISOString(),
  },
  {
    id: "task_4",
    userId: "student_1",
    subtopicId: "10.2",
    title: "Derive Escape Speed (v_esc = √[2GM/R]) from Work Energy",
    topicName: "Topic 10.2: Fields at Work",
    rubricScore: 2,
    previousInterval: 3,
    currentInterval: 5,
    nextReviewDue: new Date(Date.now() + 86405000 * 5).toISOString(), // 5 days in the future (Upcoming)
    isConceptLeak: false,
    lastTested: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "task_5",
    userId: "student_1",
    subtopicId: "11.1",
    title: "Magnetic Flux Linkage & Faraday's Law boundary derivation",
    topicName: "Topic 11.1: Electromagnetic Induction",
    rubricScore: 0,
    previousInterval: 7,
    currentInterval: 1,
    nextReviewDue: new Date(Date.now() - 3600000 * 1.5).toISOString(), // 1.5 hours ago (OVERDUE + Concept Leak)
    isConceptLeak: true,
    lastTested: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
];

// Read from LocalStorage or seed default tasks
export function getStudentReviewTasks(): StudentReviewTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
      return DEFAULT_TASKS;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("[SRS Storage] Error loading local records", e);
    return DEFAULT_TASKS;
  }
}

// Write tasks back to local storage
export function saveStudentReviewTasks(tasks: StudentReviewTask[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("[SRS Storage] Error saving records to storage", e);
  }
}

/**
 * CORE LOGIC IMPLEMENTATION
 * Calculates and updates student database tracking state in compliance with memory algorithm parameters
 */
export function processStudentSubmission(
  userId: string,
  subtopicId: string,
  rubricScore: number
): StudentReviewTask {
  const tasks = getStudentReviewTasks();
  
  // Find or create record for user + subtopic
  let taskIndex = tasks.findIndex(t => t.userId === userId && t.subtopicId === subtopicId);
  const now = new Date();
  
  let previousInterval = 0;
  let currentTitle = "Custom Derivation Focus";
  let currentTopic = "Topic 10: General Fields Verification";
  
  if (taskIndex !== -1) {
    previousInterval = tasks[taskIndex].currentInterval;
    currentTitle = tasks[taskIndex].title;
    currentTopic = tasks[taskIndex].topicName;
  } else {
    // Dynamic naming based on standard physics subtopics
    if (subtopicId === "10.1") {
      currentTitle = "Equate Kepler's Third Law (T² ∝ r³) using Newton's laws";
      currentTopic = "Topic 10.1: Describing Fields";
    } else if (subtopicId === "10.2") {
      currentTitle = "Derive satellite orbital speed (v = √[GM/r])";
      currentTopic = "Topic 10.2: Fields at Work";
    } else if (subtopicId === "11.1") {
      currentTitle = "Magnetic Flux Linkage & Faraday's Law boundary derivation";
      currentTopic = "Topic 11.1: Electromagnetic Induction";
    }
  }

  // Calculate new repetition window based on the memory engine guidelines
  let nextInterval = 1;
  let isConceptLeak = false;

  if (rubricScore === 3) {
    // Full Marks / Band 7 Mastery
    if (previousInterval === 0) {
      nextInterval = 1; // Day 1 initial check
    } else if (previousInterval === 1) {
      nextInterval = 3; // Day 3 validation step
    } else {
      nextInterval = Math.round(previousInterval * 2.5); // Exponential interval leap forward
    }
    isConceptLeak = false;
  } else if (rubricScore === 2) {
    // Satisfactory understanding
    nextInterval = previousInterval === 0 ? 1 : Math.round(previousInterval * 1.5); // Slower progression
    isConceptLeak = false;
  } else {
    // Score is 0 or 1 / Band 2-3 Trap caught => Drop back to 1 day & flag Concept Leak
    nextInterval = 1;
    isConceptLeak = true;
  }

  const reviewDueObject = new Date();
  reviewDueObject.setDate(reviewDueObject.getDate() + nextInterval);

  const updatedTask: StudentReviewTask = {
    id: taskIndex !== -1 ? tasks[taskIndex].id : `task_dyn_${Math.random().toString(16).substring(2, 6)}`,
    userId,
    subtopicId,
    title: currentTitle,
    topicName: currentTopic,
    rubricScore,
    previousInterval,
    currentInterval: nextInterval,
    nextReviewDue: reviewDueObject.toISOString(),
    isConceptLeak,
    lastTested: now.toISOString()
  };

  if (taskIndex !== -1) {
    tasks[taskIndex] = updatedTask;
  } else {
    tasks.push(updatedTask);
  }

  saveStudentReviewTasks(tasks);
  
  // Custom event trigger to notify other components of database state update
  window.dispatchEvent(new Event("srs-db-updated"));

  return updatedTask;
}
