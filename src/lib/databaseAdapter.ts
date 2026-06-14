/**
 * =========================================================================
 * IB PHYSICS DATABASE ADAPTER & SPACED REPETITION ENGINE (SM2)
 * =========================================================================
 * 
 * ROLE & OBJECTIVE:
 * Expert backend data adapter module interfacing with the Supabase relational schema.
 * Implements a modified SuperMemo-2 (SM2) memory model to calculate exponential
 * spaced recall intervals. Tracks ledger states, raises "concept leaks" warning 
 * flags for prompt intervention, and protects ledger writes against network failures.
 * 
 * CORE SCHEMA MAPPING:
 * - profiles: Tracking current student starting performance bands.
 * - subtopics: Unique syllabus nodes mapping a hierarchical course structure.
 * - student_mastery_ledger: Longitudinal Spaced Retention ledger logs.
 */

import { supabase } from "./supabaseClient";

/**
 * Interface definition for structured return payload from our Spaced Repetition Timeline.
 */
export interface ActiveStudentTimelineRecord {
  id: string | number;
  userId: string;
  subtopicId: number;
  subtopicCode: string;
  subtopicTitle: string;
  syllabusLevel: "SL" | "HL";
  confidenceLevel: number; // 0 = Critical Gap, 1 = Shaky, 2 = Mastery
  rubricScoreAchieved: number; // Raw assessment score out of 3
  currentIntervalDays: number; // Interval days in spaced repetition
  lastReviewedAt: string; // ISO date timestamp
  nextReviewDue: string; // ISO date timestamp
  isOverdue: boolean; // Overdue validation derived from clock state
  concept_leak: boolean; // Flagged when current_interval_days === 1 and overdue is true
}

/**
 * Standard pre-seeded dictionary to auto-provision missing subtopics on demand.
 */
const SUBTOPIC_SEED_DICTIONARY: Record<string, { title: string; syllabus_level: "SL" | "HL" }> = {
  "TOPIC_6_1": { title: "Circular Motion Dynamics", syllabus_level: "SL" },
  "TOPIC_6_2": { title: "Newton's Law of Gravitation", syllabus_level: "SL" },
  "TOPIC_10_1": { title: "Gravitational Potential Boundaries", syllabus_level: "HL" },
  "TOPIC_10_2": { title: "Orbital Mechanics", syllabus_level: "HL" },
  "TOPIC_10_3": { title: "Equipotential Fields", syllabus_level: "HL" },
  "TOPIC_10_4": { title: "Potential Gradient", syllabus_level: "HL" }
};

/**
 * Resolves a unique subtopic code or numeric identifier to its primary BIGINT table ID.
 * Automatically handles dynamic record bootstrapping/seeding to guarantee referential validity.
 * 
 * @param subtopicRef Code string or numeric identifier.
 * @returns Resolved BigInt primary key ID, or null.
 */
async function resolveSubtopicId(subtopicRef: string | number): Promise<number | null> {
  if (!supabase) {
    console.warn("[DB Adapter] Supabase client is not initialized. Skipping DB subtopic resolution.");
    return null;
  }

  // If already a numeric primary key
  if (typeof subtopicRef === "number") {
    return subtopicRef;
  }

  const cleanCode = subtopicRef.trim().toUpperCase();

  try {
    console.log(`[DB Adapter] Querying subtopic table database for code: "${cleanCode}" ...`);
    
    // Fetch unique record
    const { data, error } = await supabase
      .from("subtopics")
      .select("id")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!error && data) {
      console.log(`[DB Adapter] Resolved subtopic code "${cleanCode}" directly to ID ${data.id}`);
      return data.id;
    }

    if (error) {
      console.error(`[DB Adapter] Database error searching for subtopic code "${cleanCode}":`, error);
    }

    // Dynamic bootstrapping/seeding if not yet populated
    console.log(`[DB Adapter] Subtopic "${cleanCode}" not found. Dynamic auto-seeding starting ...`);
    const seedInfo = SUBTOPIC_SEED_DICTIONARY[cleanCode] || { 
      title: `${cleanCode.replace(/_/g, " ")} Derivations and Fields`, 
      syllabus_level: "HL" 
    };

    const { data: insertedRecord, error: insertError } = await supabase
      .from("subtopics")
      .insert({
        code: cleanCode,
        title: seedInfo.title,
        syllabus_level: seedInfo.syllabus_level
      })
      .select("id")
      .single();

    if (insertError) {
      console.error(`[DB Adapter] Failed dynamic seed insertion for "${cleanCode}":`, insertError);
      throw insertError;
    }

    if (insertedRecord) {
      console.log(`[DB Adapter] Successfully bootstrapped new subtopic "${cleanCode}" with live database ID ${insertedRecord.id}`);
      return insertedRecord.id;
    }
  } catch (e) {
    console.error(`[DB Adapter] Unexpected failure during resolveSubtopicId for "${subtopicRef}":`, e);
  }

  return null;
}

/**
 * =========================================================================
 * TASK A: commitMetricsToLedger(userId, subtopicId, score)
 * =========================================================================
 * 
 * Asynchronously calculates Spaced Repetition schedules via live database updates.
 * Implements transactional safeguards to protect progress logs during dropouts.
 * 
 * @param userId Unique identifier (UUID reference mapping to auth.users in profiles table)
 * @param subtopicId Syllabus locator tag (Code string "TOPIC_10_2" or relational BIGINT ID)
 * @param score Raw student score achieved in the handwriting rubric assessment [0 - 3]
 * @returns Saved database ledger row payload
 */
export async function commitMetricsToLedger(
  userId: string,
  subtopicId: string | number,
  score: number
): Promise<any> {
  const now = new Date();
  
  console.log(`[DB Adapter Ledger Write] Commit Triggered: User ID "${userId}", Subtopic locator "${subtopicId}", Score ${score}/3`);

  if (!supabase) {
    console.error("[DB Adapter Write Error] Supabase is unconfigured or failed initialization. Aborting Cloud Synchronization.");
    throw new Error("Supabase is unconfigured. Unable to execute cloud transaction.");
  }

  try {
    // Stage 1: Ensure both the student profile and subtopic record are present to satisfy database foreign keys
    console.log(`[DB Adapter] Handshaking relational preconditions for User ID "${userId}" ...`);
    
    // Explicit profiles check & upsert to prevent foreign key issues
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({ id: userId }, { onConflict: "id" });

    if (profileError) {
      console.warn(`[DB Adapter] Warning during profile verification handshake for UUID "${userId}":`, profileError);
    }

    // Resolve subtopic references to relational BigInt primary key
    const numericalSubtopicId = await resolveSubtopicId(subtopicId);
    if (!numericalSubtopicId) {
      throw new Error(`Could not resolve subtopic reference locator mapping for: "${subtopicId}"`);
    }

    // Stage 2: Retrieve the historical spacing interval to compute memory decay progressions
    console.log(`[DB Adapter] Fetching historical student_mastery_ledger tracking data for user/subtopic key pair ...`);
    
    const { data: previousReview, error: lookupError } = await supabase
      .from("student_mastery_ledger")
      .select("current_interval_days")
      .eq("user_id", userId)
      .eq("subtopic_id", numericalSubtopicId)
      .maybeSingle();

    if (lookupError) {
      console.warn("[DB Adapter] Lookup exception occurred querying previous spacing ledger. Falling back to default baseline (0 days).", lookupError);
    }

    // Historical spacing interval default baseline
    const previousInterval = previousReview ? (previousReview.current_interval_days || 0) : 0;
    console.log(`[DB Adapter] Spaced Repetition Engine history found. Previous Interval Day Count: ${previousInterval} days.`);

    // Stage 3: Evaluate qualitative metrics (confidence flags) based on raw score bounds
    // 3 out of 3 marks -> Confidence level 2 (Mastery)
    // 1 or 2 out of 3 marks -> Confidence level 1 (Shaky)
    // 0 out of 3 marks -> Confidence level 0 (Critical Gap)
    let confidenceLevel = 1;
    if (score === 3) {
      confidenceLevel = 2; // Mastery Anchor
    } else if (score === 0) {
      confidenceLevel = 0; // Critical Conceptual Gap
    } else {
      confidenceLevel = 1; // Shaky Ground
    }

    // Stage 4: Spacing Projection Mathematical algorithm Loop (SM2-inspired Engine)
    let nextInterval = 1; // Falling back to 1 day for low scores and resets

    if (score === 3) {
      // Full Marks / Band 7 Excellence
      if (previousInterval === 0) {
        nextInterval = 1; // Foundation Day 1 review point
      } else if (previousInterval === 1) {
        nextInterval = 3; // Validation Day 3 review step
      } else {
        nextInterval = Math.round(previousInterval * 2.5); // Exponential leap (Multiplier: 2.5)
      }
    } else if (score === 2) {
      // Partial Mastery / Band 4-5 Bounds
      nextInterval = previousInterval === 0 ? 1 : Math.round(previousInterval * 1.5); // Slower, controlled pacing (Multiplier: 1.5)
    } else {
      // Score is 0 or 1 / Critical Conceptual Gap caught
      nextInterval = 1; // Immediate reset to force re-evaluation within 24 hours
    }

    const targetReviewDate = new Date();
    targetReviewDate.setDate(targetReviewDate.getDate() + nextInterval);

    console.log(`[DB Adapter SRS Engine] Spacing calculated. Next interval is: ${nextInterval} days. Review due date: ${targetReviewDate.toISOString()}`);

    // Stage 5: Compile parameters into structured payloads and execute upsert
    const upsertPayload = {
      user_id: userId,
      subtopic_id: numericalSubtopicId,
      confidence_level: confidenceLevel,
      rubric_score_achieved: score,
      current_interval_days: nextInterval,
      last_reviewed_at: now.toISOString(),
      next_review_due: targetReviewDate.toISOString()
    };

    console.log("[DB Adapter] Initiating asynchronous .upsert() transaction to commit changes back to Supabase Cloud...");
    
    const { data: upsertData, error: upsertError } = await supabase
      .from("student_mastery_ledger")
      .upsert(upsertPayload, { onConflict: "user_id,subtopic_id" })
      .select();

    if (upsertError) {
      console.error("[DB Adapter Transaction Failed] Relational upsert rejected by Cloud server:", upsertError);
      throw upsertError;
    }

    console.log(`[DB Adapter Telemetry Success] Successfully synced Spaced Repetition row! Database Response payload count: ${upsertData?.length || 0}`);
    return upsertData;

  } catch (error: any) {
    console.error("[DB Adapter Fatal Fail-Fast Tracking] Transaction failed compile/write block. Error dump: ", error);
    throw error;
  }
}

/**
 * =========================================================================
 * TASK B: loadActiveStudentTimeline(userId)
 * =========================================================================
 * 
 * Retrieves the student's mastery tracker record timeline, sorts items by
 * real-time urgency, and flags any concept decays or leaks requiring testing.
 * 
 * @param userId Unique student user identifier (matches user_id primary key in student_mastery_ledger)
 * @returns Array list containing sorted ActiveStudentTimelineRecord elements
 */
export async function loadActiveStudentTimeline(userId: string): Promise<ActiveStudentTimelineRecord[]> {
  const currentTimeStr = new Date().toISOString();
  console.log(`[DB Adapter Timeline Query] Fetching longitudinal ledger log records of User ID: "${userId}" ...`);

  if (!supabase) {
    console.warn("[DB Adapter Timeline Error] Supabase is offline or unconfigured. Returning fallback empty tracker array.");
    return [];
  }

  try {
    // Query direct student ledger indices, pulling the foreign subtopic code metadata details in a single SQL operation.
    const { data: dbRecords, error: fetchError } = await supabase
      .from("student_mastery_ledger")
      .select(`
        id,
        user_id,
        subtopic_id,
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

    if (fetchError) {
      console.error("[DB Adapter Fetch Failed] Select statement failed on cloud repository:", fetchError);
      throw fetchError;
    }

    if (!dbRecords || dbRecords.length === 0) {
      console.log(`[DB Adapter Timeline Telemetry] Success. Returned 0 active records for User: "${userId}"`);
      return [];
    }

    console.log(`[DB Adapter Timeline Mapping] Successfully loaded ${dbRecords.length} records. Beginning date analysis and urgency evaluation ...`);

    // Perform date comparisons & attribute logic mapping inside iterative parser
    const mappedTimeline: ActiveStudentTimelineRecord[] = dbRecords.map((row: any) => {
      const subtopicObj = row.subtopics;
      const subCode = subtopicObj?.code || "TOPIC_UNKNOWN";
      const subTitle = subtopicObj?.title || "Syllabus Derivation Module";
      const subLvl = (subtopicObj?.syllabus_level || "HL") as "SL" | "HL";

      const nextDue = row.next_review_due;
      const spaceInterval = row.current_interval_days || 0;

      // Realtime validation: is nextReviewDue less than or equal to current system clock?
      const isOverdue = new Date(nextDue).getTime() <= new Date(currentTimeStr).getTime();

      // Flag ACTIVE CONCEPT LEAK if:
      // (1) Overdue is true (due now or in the past)
      // (2) The spaced interval equals exactly 1 (signaling repeated struggle or a recent drop fallback)
      const conceptLeakActive = isOverdue && (spaceInterval === 1);

      return {
        id: row.id,
        userId: row.user_id,
        subtopicId: row.subtopic_id,
        subtopicCode: subCode,
        subtopicTitle: subTitle,
        syllabusLevel: subLvl,
        confidenceLevel: row.confidence_level ?? 1,
        rubricScoreAchieved: row.rubric_score_achieved ?? 0,
        currentIntervalDays: spaceInterval,
        lastReviewedAt: row.last_reviewed_at,
        nextReviewDue: nextDue,
        isOverdue: isOverdue,
        concept_leak: conceptLeakActive
      };
    });

    // Sort timeline by URGENCY: Overdue entries MUST float directly to the top sorted chronologically by most overdue.
    // Future entries are sorted chronologically by when they are due soon.
    const sortedTimeline = mappedTimeline.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1; // Overdue takes precedence
      if (!a.isOverdue && b.isOverdue) return 1;

      // If both are overdue, sort by the one that has been overdue the longest (more negative diff is more overdue)
      const aTime = new Date(a.nextReviewDue).getTime();
      const bTime = new Date(b.nextReviewDue).getTime();

      return aTime - bTime;
    });

    console.log(`[DB Adapter Sorted Telemetry] Pipeline finished sorting. Top task due: "${sortedTimeline[0]?.subtopicCode || "N/A"}" (Overdue: ${sortedTimeline[0]?.isOverdue || false})`);
    return sortedTimeline;

  } catch (err: any) {
    console.error("[DB Adapter Mapped Timeline Failed] Fatal error evaluating database query results:", err);
    return [];
  }
}
