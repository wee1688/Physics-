import { createClient } from "@supabase/supabase-js";
import { getStudentReviewTasks, saveStudentReviewTasks, StudentReviewTask } from "./srsStorage";

// Fetch from Vite environments safely avoiding TypeScript compile flags
const SUPABASE_URL = ((import.meta as any).env?.VITE_SUPABASE_URL) || "";
const SUPABASE_ANON_KEY = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY) || "";

// Auxiliary check to determine if real Cloud Supabase credentials are wired
export function isSupabaseConfigured(): boolean {
  return (
    typeof SUPABASE_URL === "string" &&
    SUPABASE_URL.trim() !== "" &&
    !SUPABASE_URL.includes("your-project-id") &&
    typeof SUPABASE_ANON_KEY === "string" &&
    SUPABASE_ANON_KEY.trim() !== "" &&
    !SUPABASE_ANON_KEY.includes("your-supabase-anonymous-public-key")
  );
}

// 1. Initialize the Client safely avoiding runtime crashes on invalid configuration URLs
let supabaseInstance: any = null;
try {
  if (isSupabaseConfigured()) {
    const cleanUrl = SUPABASE_URL.trim();
    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      supabaseInstance = createClient(cleanUrl, SUPABASE_ANON_KEY);
    } else {
      console.warn("[Supabase] Invalid URL. Supabase requires a valid HTTP or HTTPS address. Falling back to local offline mock.");
    }
  }
} catch (e) {
  console.error("[Supabase] Critical initialization failure. Falling back to local offline mock.", e);
}

export const supabase = supabaseInstance;

/**
 * Ensures there is an active session in Supabase, utilizing anonymous sign-in if needed.
 * This guarantees a valid authenticated user is present, satisfying the foreign key references on auth.users.
 */
export async function ensureSession(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;

    // Check if there is an active session
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) return session.user.id;

    // Attempt anonymous sign-in to create valid auth.users reference ID
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    if (!anonError && anonData && anonData.user) {
      console.log("[Supabase Client] Automatically signed in anonymously:", anonData.user.id);
      return anonData.user.id;
    }
  } catch (e) {
    console.warn("[Supabase Client] Exception in ensuring user session:", e);
  }
  return null;
}

/**
 * Returns the current user ID, if any.
 */
export async function getCurrentUserId(): Promise<string | null> {
  if (!supabase) return null;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) return user.id;
  } catch (e) {
    console.warn("[Supabase Client] Error getting current user ID:", e);
  }
  return null;
}

// Map subtopic details dynamically
const subtopicMapping: Record<string, { title: string; syllabus_level: 'SL' | 'HL' }> = {
  "TOPIC_6_1": { title: "Circular Motion Dynamics", syllabus_level: "SL" },
  "TOPIC_6_2": { title: "Newton's Law of Gravitation", syllabus_level: "SL" },
  "TOPIC_10_1": { title: "Gravitational Potential Boundaries", syllabus_level: "HL" },
  "TOPIC_10_2": { title: "Orbital Mechanics", syllabus_level: "HL" },
  "TOPIC_10_3": { title: "Equipotential Fields", syllabus_level: "HL" },
  "TOPIC_10_4": { title: "Potential Gradient", syllabus_level: "HL" }
};

/**
 * Resolves a subtopic code to its database ID, inserting the record if it doesn't already exist.
 */
export async function getSubtopicId(subtopicCode: string): Promise<number | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from("subtopics")
      .select("id")
      .eq("code", subtopicCode)
      .maybeSingle();

    if (!error && data) {
      return data.id;
    }

    // Insert subtopic dynamically if not seeded
    const info = subtopicMapping[subtopicCode] || { title: "Gravity Derivations Module", syllabus_level: "HL" };
    const { data: inserted, error: insertError } = await supabase
      .from("subtopics")
      .insert({
        code: subtopicCode,
        title: info.title,
        syllabus_level: info.syllabus_level
      })
      .select("id")
      .single();

    if (!insertError && inserted) {
      return inserted.id;
    }
  } catch (e) {
    console.warn("[Supabase Client] Error resolving subtopic ID:", e);
  }
  return null;
}

/**
 * 2. Save Scores & Update Intervals
 * Updates the 'student_mastery_ledger'.
 */
export async function saveStudentAssessmentScore(
  subtopicCode: string,
  score: number,
  studentId: string = "student_1"
): Promise<any> {
  const now = new Date();
  let previousIntervalDays = 0;

  console.log(`[Supabase SRS Engine] Processing score: ${score}/3 for ${subtopicCode} (Student: ${studentId})`);

  // Ensure active session & fetch subtopic ID
  let userId: string | null = null;
  let subtopicId: number | null = null;

  if (supabase) {
    try {
      userId = await ensureSession();
      if (userId) {
        // Ensure profile row exists in profiles table
        await supabase
          .from("profiles")
          .upsert({ id: userId }, { onConflict: 'id' });

        subtopicId = await getSubtopicId(subtopicCode);

        if (subtopicId) {
          const { data, error } = await supabase
            .from("student_mastery_ledger")
            .select("current_interval_days")
            .eq("user_id", userId)
            .eq("subtopic_id", subtopicId)
            .maybeSingle();

          if (!error && data) {
            previousIntervalDays = data.current_interval_days || 0;
          }
        }
      }
    } catch (e) {
      console.warn("[Supabase Client] Error querying previous interval, utilizing local fallback.", e);
    }
  }

  // Double check with local storage mock keys if supabase is disabled or returned blank
  if (previousIntervalDays === 0) {
    const localTasks = getStudentReviewTasks();
    const existingTask = localTasks.find(t => t.userId === studentId && t.subtopicId === subtopicCode);
    if (existingTask) {
      previousIntervalDays = existingTask.currentInterval;
    }
  }

  // Calculate new spaced repetition interval days
  let nextInterval = 1;
  let isConceptLeak = false;

  if (score === 3) {
    if (previousIntervalDays === 0) {
      nextInterval = 1;
    } else if (previousIntervalDays === 1) {
      nextInterval = 3;
    } else {
      nextInterval = Math.round(previousIntervalDays * 2.5);
    }
    isConceptLeak = false;
  } else if (score === 2) {
    nextInterval = previousIntervalDays === 0 ? 1 : Math.round(previousIntervalDays * 1.5);
    isConceptLeak = false;
  } else {
    nextInterval = 1;
    isConceptLeak = true;
  }

  const reviewDueDate = new Date();
  reviewDueDate.setDate(reviewDueDate.getDate() + nextInterval);

  // Safe Upsert execute to refresh the row
  if (supabase && userId && subtopicId) {
    try {
      const payload = {
        user_id: userId,
        subtopic_id: subtopicId,
        confidence_level: score === 3 ? 2 : score === 2 ? 1 : 0,
        rubric_score_achieved: score,
        current_interval_days: nextInterval,
        last_reviewed_at: now.toISOString(),
        next_review_due: reviewDueDate.toISOString(),
      };

      const { data, error } = await supabase
        .from("student_mastery_ledger")
        .upsert(payload, { onConflict: "user_id,subtopic_id" })
        .select();

      if (error) {
        throw error;
      }
      console.log("[Supabase Client] Successfully executed .upsert() sync for ledger:", data);
    } catch (err) {
      console.warn("[Supabase Client] Failed remote upsert, syncing locally", err);
    }
  }

  // Always write synchronously back to our localStorage layer to ensure mock works beautifully
  const localTasks = getStudentReviewTasks();
  const taskIndex = localTasks.findIndex(t => t.userId === studentId && t.subtopicId === subtopicCode);
  
  // Provide robust matching fields
  const info = subtopicMapping[subtopicCode] || { title: "Gravity Derivations Module", syllabus_level: "HL" };
  const currentTitle = `Derive ${info.title} parameters and examinership criteria`;
  const currentTopic = `Topic ${subtopicCode.replace('TOPIC_', '').replace('_', '.')}: ${info.title}`;

  const updatedTask: StudentReviewTask = {
    id: taskIndex !== -1 ? localTasks[taskIndex].id : `task_dyn_${Math.random().toString(16).substring(2, 6)}`,
    userId: studentId,
    subtopicId: subtopicCode,
    title: currentTitle,
    topicName: currentTopic,
    rubricScore: score,
    previousInterval: previousIntervalDays,
    currentInterval: nextInterval,
    nextReviewDue: reviewDueDate.toISOString(),
    isConceptLeak,
    lastTested: now.toISOString()
  };

  if (taskIndex !== -1) {
    localTasks[taskIndex] = updatedTask;
  } else {
    localTasks.push(updatedTask);
  }

  saveStudentReviewTasks(localTasks);
  window.dispatchEvent(new Event("srs-db-updated"));

  return updatedTask;
}

/**
 * 3. Fetch Dashboard Timeline
 */
export async function loadStudentDashboard(studentId: string = "student_1"): Promise<StudentReviewTask[]> {
  const now = new Date();
  let dbTasks: any[] = [];

  if (supabase) {
    try {
      const userId = await ensureSession();
      if (userId) {
        const { data, error } = await supabase
          .from("student_mastery_ledger")
          .select(`
            id,
            confidence_level,
            rubric_score_achieved,
            current_interval_days,
            last_reviewed_at,
            next_review_due,
            subtopics (
              id,
              code,
              title,
              syllabus_level
            )
          `)
          .eq("user_id", userId);

        if (!error && data) {
          dbTasks = data;
        } else if (error) {
          console.warn("[Supabase Client] Failed fetching dashboard records:", error);
        }
      }
    } catch (e) {
      console.warn("[Supabase Client] Query load failure, falling back to fully functional Local Storage dashboard.", e);
    }
  }

  // Load from local storage tasks as primary source or fallback
  const fallbackTasks = getStudentReviewTasks();

  // If we fetched remote items, let's map them to of-type StudentReviewTask structure
  if (dbTasks && dbTasks.length > 0) {
    const formattedRecords: StudentReviewTask[] = dbTasks.map(row => {
      const code = row.subtopics?.code || "TOPIC_UNKNOWN";
      const title = row.subtopics?.title || "Derivation Challenge";
      const currentTitle = `Derive ${title} parameters and examinership criteria`;
      const currentTopic = `Topic ${code.replace('TOPIC_', '').replace('_', '.')}: ${title}`;

      return {
        id: `task_db_${code}`,
        userId: studentId,
        subtopicId: code,
        title: currentTitle,
        topicName: currentTopic,
        rubricScore: row.rubric_score_achieved,
        previousInterval: 0,
        currentInterval: row.current_interval_days || 1,
        nextReviewDue: row.next_review_due,
        isConceptLeak: row.confidence_level === 0,
        lastTested: row.last_reviewed_at || now.toISOString()
      };
    });

    const merged = [...fallbackTasks];
    formattedRecords.forEach(rec => {
      const idx = merged.findIndex(i => i.subtopicId === rec.subtopicId);
      if (idx !== -1) {
        merged[idx] = rec;
      } else {
        merged.push(rec);
      }
    });

    return sortTasksByUrgency(merged, now);
  }

  return sortTasksByUrgency(fallbackTasks, now);
}

function sortTasksByUrgency(tasks: StudentReviewTask[], now: Date): StudentReviewTask[] {
  return [...tasks].sort((a, b) => {
    const aDue = new Date(a.nextReviewDue);
    const bDue = new Date(b.nextReviewDue);
    
    const aOverdue = aDue < now;
    const bOverdue = bDue < now;

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    return aDue.getTime() - bDue.getTime();
  });
}

/**
 * 4. Save Student profile parameters
 */
export async function saveStudentProfile(
  level: 'SL' | 'HL',
  startingBand: number,
  studentId: string = "student_1"
): Promise<any> {
  localStorage.setItem(`profile_level_${studentId}`, level);
  localStorage.setItem(`profile_band_${studentId}`, startingBand.toString());

  if (supabase) {
    try {
      const userId = await ensureSession();
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: userId,
            current_estimated_band: startingBand
          })
          .select();
        if (error) throw error;
        console.log("[Supabase Client] Successfully saved student profile to 'profiles' table:", data);
        return data;
      }
    } catch (e) {
      console.warn("[Supabase Client] Failed writing profile to 'profiles' table, using local storage fallback", e);
    }
  }
  return { level, startingBand };
}

/**
 * 5. Load Student profile parameters
 */
export async function loadStudentProfile(
  studentId: string = "student_1"
): Promise<{ level: 'SL' | 'HL'; startingBand: number }> {
  let level = (localStorage.getItem(`profile_level_${studentId}`) || 'HL') as 'SL' | 'HL';
  let startingBand = parseInt(localStorage.getItem(`profile_band_${studentId}`) || '6');

  if (supabase) {
    try {
      const userId = await getCurrentUserId();
      if (userId) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          if (data.current_estimated_band) startingBand = Number(data.current_estimated_band);
        }
      }
    } catch (e) {
      console.warn("[Supabase Client] Error loading profiles table. Falling back to local values.", e);
    }
  }

  return { level, startingBand };
}

// Re-export core Spaced Repetition metrics & timeline operations from databaseAdapter
export { commitMetricsToLedger, loadActiveStudentTimeline } from "./databaseAdapter";
export type { ActiveStudentTimelineRecord } from "./databaseAdapter";

