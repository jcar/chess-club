// The content model. A lesson is written once as data; three renderers turn it
// into the teacher's demo (present mode), the kid's iPad screens (student mode)
// and a worksheet (print). Nothing here may depend on React or the browser, so
// the validator and the tests can load every lesson in plain Node.

export type Square = string; // "e4"
export type Uci = string; // "e2e4", "e7e8q"
export type Orientation = "white" | "black";
export type GradeBand = "K-2" | "3-5" | "6-8" | "9-12";

/** Wording that can differ for the youngest kids. `kid` falls back to `text`. */
export interface Words {
  text: string;
  /** K–2 wording: short, concrete, read aloud. */
  kid?: string;
}

interface ExerciseBase {
  id: string;
  /** Position. Step 1 uses "sandbox" positions with no kings (see lib/chess/rules). */
  fen: string;
  prompt: Words;
  hint?: Words;
  orientation?: Orientation;
  /** Star marks shown only in K–2 mode, to help non-readers (e.g. "tap the star"). */
  kidMarks?: Square[];
}

/** Tap every square the piece on `square` can move to. The answer is derived from the rules. */
export interface ReachExercise extends ExerciseBase {
  kind: "reach";
  square: Square;
}

/** Move the piece on `square` to collect every star. Answer: the fewest moves, derived. */
export interface StarsExercise extends ExerciseBase {
  kind: "stars";
  square: Square;
  stars: Square[];
}

export type MoveGoal = "capture" | "check" | "mate" | "escape" | "any";

/**
 * Play one move. `answers` lists every accepted move. The validator proves each
 * one is legal and meets `goal`, and that no move meeting the goal is missing
 * (unless `strict`), so the printed answer key is complete.
 */
export interface MoveExercise extends ExerciseBase {
  kind: "move";
  goal: MoveGoal;
  answers: Uci[];
  /**
   * The answers are deliberately fewer than all moves meeting the goal (e.g.
   * "capture the piece that is NOT protected"). Without this, the validator
   * requires every capture/check/mate to be accepted.
   */
  strict?: boolean;
}

/** Tap one of the answer squares (e.g. "Tap e4", "Where does the queen start?"). */
export interface TapExercise extends ExerciseBase {
  kind: "tap";
  answers: Square[];
}

/** Multiple choice, optionally about the position shown. */
export interface ChoiceExercise extends Omit<ExerciseBase, "fen"> {
  kind: "choice";
  fen?: string;
  options: Words[];
  answer: number;
}

export type Exercise = ReachExercise | StarsExercise | MoveExercise | TapExercise | ChoiceExercise;
export type ExerciseKind = Exercise["kind"];

/** One beat of the teacher's script: what to say, what to do, what to show. */
export interface ScriptBeat {
  say: string;
  /** Stage direction for the teacher, e.g. "Hold up a rook." */
  do?: string;
  demo?: Demo;
}

export interface Demo {
  fen: string;
  arrows?: { from: Square; to: Square }[];
  highlight?: Square[];
  orientation?: Orientation;
}

/** The at-the-table activity: kids in pairs on physical boards, or vs. the iPad bot. */
export interface Activity {
  title: string;
  kidTitle?: string;
  minutes: number;
  setup: string;
  rules: string[];
  /** Starting position for the on-screen version. */
  fen?: string;
  /** Which rule-based bot the iPad version plays against, if any. */
  game?: MiniGame;
}

export interface MiniGame {
  /**
   * promote: first pawn to the far side wins. captureAll: take every enemy
   * piece. mate: a real ending (e.g. king and queen vs. king), where stalemate is a draw.
   */
  win: "promote" | "captureAll" | "mate";
  youPlay: "white" | "black";
}

export interface Lesson {
  id: string; // unique across the curriculum, e.g. "s1-rook"
  step: number;
  title: string;
  kidTitle?: string;
  /** "By the end, kids can …" */
  goal: string;
  minutes: number;
  /** Things the teacher needs on the table. */
  materials: string[];
  script: ScriptBeat[];
  /** Adjustments for the youngest kids. */
  k2Tip?: string;
  /** What to watch for and how to fix it. */
  commonMistakes?: string[];
  activity: Activity;
  practice: Exercise[];
  check: Exercise[];
  /** How many of `check` a kid must get right on the first try. */
  passMark: number;
  /** Where the author took the teaching order from (titles/chapters only, never text). */
  sources: string[];
}

export interface Step {
  n: number;
  title: string;
  kidTitle: string;
  grades: string;
  summary: string;
  lessons: Lesson[];
  /** Planned but not yet written. */
  comingSoon?: boolean;
}
