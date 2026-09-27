// Step 6: Tactics I + CCA. Order follows Chess for Children, Part 5 (forks,
// pins, skewers) with the Checks-Captures-Attacks thinking habit from How to
// Win at Chess, ch. 7 and ch. 14. All wording here is original; extra practice
// comes from the Lichess puzzle database (CC0).
//
// "win" exercises are verified by a material search (lib/chess/tactics): the
// validator proves each answer wins material and that no other winning move
// is missing from the key.

import { board } from "../authoring";
import type { Lesson } from "../types";

const CFC = "Chess for Children, Part 5 (basic tactics)";
const HTW7 = "How to Win at Chess, ch. 7 (piece vision, tactics)";
const HTW14 = "How to Win at Chess, ch. 14 (the CCA habit)";

// Positions shared between a script demo and an exercise.
const CCA_DEMO = board({ K: "g1", R: "d1", B: "c4", P: ["f2", "g2", "h2"], k: "g8", q: "d6", p: ["f7", "g7", "h7"] });
const FORK_KQ = board({ K: "g1", N: "d5", P: ["f2", "g2", "h2"], k: "g8", q: "c8", p: ["f7", "g7", "h7"] });
const PIN_TAP = board({ K: "g1", R: "e1", B: "g2", k: "e8", b: "e7", n: "c6", p: ["a7", "h7"] });
const SKEWER_R = board({ K: "g1", R: "a1", P: ["f2", "g2", "h2"], k: "d6", q: "h6" });

export const step6: Lesson[] = [
  {
    id: "s6-cca",
    step: 6,
    title: "Checks, Captures, Attacks",
    kidTitle: "The CCA Habit",
    goal: "Before every move, kids look for checks, captures and attacks, for both players.",
    minutes: 15,
    materials: ["One board and set per pair", "Optional: a 'CCA' sign for each table"],
    script: [
      {
        say: "Strong players have a habit. Before every move they ask three questions, in this order. C: what checks can I give? C: what can I capture? A: what can I attack?",
        do: "Write C – C – A big on the board or a sign.",
      },
      {
        say: "Let's try it. Checks: the bishop can check on f7. Captures: the rook can take the queen on d6! Attacks: we don't even need to look further.",
        demo: { fen: CCA_DEMO, arrows: [{ from: "d1", to: "d6" }, { from: "c4", to: "f7" }] },
      },
      {
        say: "Here's the other half: ask the same questions for your opponent. What checks, captures and attacks could they make after your move? That's how you stop leaving pieces free.",
      },
      {
        say: "From today, every game: CCA before you touch a piece. It feels slow at first. Soon you'll do it without thinking.",
      },
    ],
    k2Tip: "Make it a chant with hand motions: 'Check? (point to the king) Capture? (grab) Attack? (point)'.",
    commonMistakes: ["Only looking at their own moves, not the opponent's.", "Seeing a capture and grabbing it without checking whether it's protected."],
    activity: {
      title: "CCA Out Loud",
      kidTitle: "Say It Out Loud",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "Before every move, say your checks, captures and attacks out loud, even if there are none ('No checks, no captures, I can attack the bishop').",
        "Your partner can remind you if you forget.",
        "After 10 minutes, keep playing but switch to whispering it.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: CCA_DEMO,
        goal: "win",
        answers: ["c4f7", "d1d6"],
        prompt: { text: "Use CCA: checks, captures, attacks. Find the move that wins material.", kid: "Check, capture, attack! Find the winning move." },
        hint: { text: "Look at every capture. Is anything unprotected?" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "g1", Q: "d1", P: ["f2", "g2", "h2"], k: "g8", r: "a5", p: ["g7", "h7"] }),
        goal: "check",
        answers: ["d1b3", "d1d5", "d1d8"],
        prompt: { text: "The first C: find a check. (There are three!)", kid: "Find a check!" },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "What does CCA stand for?" },
        options: [{ text: "Castle, Capture, Attack" }, { text: "Checks, Captures, Attacks" }, { text: "Center, Castle, Attack" }],
        answer: 1,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "g1", Q: "d2", P: ["f2", "g2", "h2"], k: "g8", n: "a5", p: ["f7", "g7", "h7"] }),
        goal: "win",
        answers: ["d2a5", "d2d5", "d2d8", "d2e1"],
        prompt: { text: "Use CCA. Find a move that wins material.", kid: "Check, capture, attack! Find a winning move." },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "When should you use CCA?" },
        options: [{ text: "Only when you're losing" }, { text: "Before every move" }, { text: "Only in the opening" }],
        answer: 1,
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Besides your own moves, whose checks, captures and attacks should you look at?" },
        options: [{ text: "Your opponent's" }, { text: "Nobody else's" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW7, HTW14],
    extra: "hangingPiece",
  },

  {
    id: "s6-fork",
    step: 6,
    title: "Forks",
    kidTitle: "Forks: Two at Once",
    goal: "Kids can spot and play a fork: one piece attacking two enemy pieces at once.",
    minutes: 15,
    materials: ["One board and set per pair", "Optional: a real fork from the cafeteria for the demo"],
    script: [
      {
        say: "A fork is when one piece attacks two enemy pieces at the same time. Your opponent can only save one, so you win the other.",
        do: "Hold up a real fork: one handle, two points.",
      },
      {
        say: "Knights are the best forkers. Here the knight jumps to e7: it checks the king AND attacks the queen. The king must move, and the queen is lost.",
        demo: { fen: FORK_KQ, arrows: [{ from: "d5", to: "e7" }, { from: "e7", to: "g8" }, { from: "e7", to: "c8" }] },
      },
      {
        say: "Any piece can fork, even a pawn. A pawn stepping between two pieces attacks both of them.",
        demo: { fen: board({ K: "g1", P: ["e2", "g2", "h2"], k: "g8", n: "d5", r: "f5", p: ["g7", "h7"] }), arrows: [{ from: "e2", to: "e4" }] },
      },
      {
        say: "Forks with check are the strongest, because the king has to move first. Look for squares where your piece attacks the king and something big.",
      },
    ],
    k2Tip: "Two targets, one attacker. Have kids name both targets out loud before they make the move.",
    commonMistakes: ["Forking with a piece that can simply be captured.", "Missing the opponent's fork threats (use CCA for them too)."],
    activity: {
      title: "Fork Hunt",
      kidTitle: "Fork Hunt",
      minutes: 10,
      setup: "Normal game in pairs, or the extra puzzles from this lesson.",
      rules: [
        "Play a normal game. Every fork you make scores a bonus point, even if it doesn't win anything.",
        "A knight fork scores two bonus points.",
        "Say 'Fork!' when you make one.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: FORK_KQ,
        goal: "win",
        answers: ["d5e7"],
        prompt: { text: "Find the knight fork.", kid: "Jump the horse to attack two things!" },
        hint: { text: "Look for a square where the knight checks the king." },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "g1", P: ["e2", "g2", "h2"], k: "g8", n: "d5", r: "f5", p: ["g7", "h7"] }),
        goal: "win",
        answers: ["e2e4"],
        prompt: { text: "Find the pawn fork.", kid: "Use a pawn to attack two pieces!" },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "What is a fork?" },
        options: [{ text: "Two pieces attacking one" }, { text: "One piece attacking two" }, { text: "A special pawn move" }],
        answer: 1,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "g1", N: "b5", P: ["f2", "g2", "h2"], k: "e8", r: "a8", p: ["f7", "g7", "h7"] }),
        goal: "win",
        answers: ["b5c7"],
        prompt: { text: "Find the fork.", kid: "Attack two things at once!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "g1", Q: "d1", P: ["f2", "g2", "h2"], k: "g8", r: "a5", p: ["g7", "h7"] }),
        goal: "win",
        answers: ["d1d8"],
        prompt: { text: "Find the queen fork.", kid: "Attack two things with the queen!" },
        hint: { text: "Check the king in a way that also attacks the rook." },
      },
      {
        id: "c3",
        kind: "move",
        fen: board({ K: "g1", Q: "d1", P: ["d4", "g2"], k: "g8", n: ["c6", "e6"], p: ["g7"] }),
        goal: "win",
        answers: ["d4d5"],
        prompt: { text: "Find the fork.", kid: "Attack two things at once!" },
      },
    ],
    passMark: 2,
    sources: [CFC, HTW7],
    extra: "fork",
  },

  {
    id: "s6-pin",
    step: 6,
    title: "Pins",
    kidTitle: "Pins: Stuck in Place",
    goal: "Kids can see a pinned piece, make a pin, and win a pinned piece by attacking it.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "A pin is when a piece can't move, or shouldn't, because a more important piece is hiding behind it. Here the black bishop can't move: the king is behind it, and moving would put the king in check.",
        demo: { fen: PIN_TAP, arrows: [{ from: "e1", to: "e8" }], highlight: ["e7"] },
      },
      {
        say: "Only bishops, rooks and queens can pin, because they attack along lines.",
      },
      {
        say: "Pinned pieces are easy targets. Attack one with a pawn and it can't run away!",
        demo: { fen: board({ K: "g1", R: "e1", P: ["d2", "f2", "g2"], k: "e8", n: "e5", p: ["d6", "a7", "h7"] }), arrows: [{ from: "e1", to: "e8" }, { from: "d2", to: "d4" }] },
      },
      {
        say: "Use CCA on pins too: if one of your pieces is pinned, protect it or get out of the pin before your opponent piles on.",
      },
    ],
    k2Tip: "The pinned piece is 'stuck with glue'. Put a sticky note on it on the demo board.",
    commonMistakes: ["Moving a piece that's pinned to the king (that's illegal).", "Pinning a piece that's well protected and thinking it wins something."],
    activity: {
      title: "Pin Spotters",
      kidTitle: "Stuck Pieces",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "Play a normal game.",
        "Whenever a piece gets pinned, either player can call out 'Pin!' for a bonus point.",
        "If you win a pinned piece, that's two bonus points.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "tap",
        fen: PIN_TAP,
        answers: ["e7"],
        prompt: { text: "Tap the black piece that is pinned.", kid: "Tap the stuck black piece." },
        hint: { text: "Which black piece is standing between an attacker and its king?" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "g1", B: "f1", P: ["a2", "h2"], k: "e8", n: "c6", p: ["a7", "h7"] }),
        goal: "any",
        answers: ["f1b5"],
        prompt: { text: "Pin the black knight to its king.", kid: "Make the black horse stuck!" },
        hint: { text: "Put the bishop on the same diagonal as the knight and the king." },
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "g1", R: "e1", P: ["d2", "f2", "g2"], k: "e8", n: "e5", p: ["d6", "a7", "h7"] }),
        goal: "win",
        answers: ["d2d4", "f2f4"],
        prompt: { text: "The knight is pinned. Win it!", kid: "The horse is stuck. Attack it with a pawn!" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "f2", R: "a1", P: ["a2", "h2"], k: "e8", q: "e6", p: ["a7", "h7"] }),
        goal: "win",
        answers: ["a1e1"],
        prompt: { text: "Use a pin to win the queen.", kid: "Make the queen stuck!" },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "Which pieces can make a pin?" },
        options: [{ text: "Knights and pawns" }, { text: "Bishops, rooks and queens" }, { text: "Only the king" }],
        answer: 1,
      },
      {
        id: "c3",
        kind: "choice",
        fen: PIN_TAP,
        prompt: { text: "Why can't the black bishop on e7 move?" },
        options: [{ text: "It would put its own king in check" }, { text: "Bishops can't move backward" }, { text: "It's Black's first move" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [CFC],
    extra: "pin",
  },

  {
    id: "s6-skewer",
    step: 6,
    title: "Skewers",
    kidTitle: "Skewers: Through the Middle",
    goal: "Kids can play a skewer: attack a big piece so it moves and uncovers the piece behind it.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "A skewer is like a pin turned around. You attack a big piece in front, it has to move, and then you capture the piece behind it.",
        demo: { fen: SKEWER_R, arrows: [{ from: "a1", to: "a6" }] },
      },
      {
        say: "Here: rook to a6 is check. The king has to step off the row, and then the rook captures the queen on h6.",
        demo: { fen: SKEWER_R, arrows: [{ from: "a6", to: "h6" }], highlight: ["d6", "h6"] },
      },
      {
        say: "Skewers work best with check, because the king must move. Look for a king and a big piece standing on the same line.",
      },
    ],
    k2Tip: "A skewer is a shish kebab: the stick goes through the first piece and gets the one behind it.",
    commonMistakes: ["Skewering with a piece the king can capture.", "Confusing pins (small piece in front) with skewers (big piece in front)."],
    activity: {
      title: "Line-Up Hunt",
      kidTitle: "Line-Up Hunt",
      minutes: 10,
      setup: "Normal game in pairs, or this lesson's extra puzzles.",
      rules: [
        "During the game, look for two enemy pieces standing on the same line.",
        "If you can attack the front one with a bishop, rook or queen, it's a pin or a skewer!",
        "Say which one it is. Bonus point if you're right.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "g1", R: "h2", P: ["f2", "g2"], k: "e7", r: "a7", p: ["f6"] }),
        goal: "win",
        answers: ["h2h7"],
        prompt: { text: "Find the rook skewer.", kid: "Attack the king so you can get the rook behind!" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "h1", B: "f1", P: ["b3", "h2"], k: "d5", r: "g8" }),
        goal: "win",
        answers: ["f1c4"],
        prompt: { text: "Find the bishop skewer.", kid: "Attack the king with the bishop!" },
        hint: { text: "The king and rook are on the same diagonal." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "In a skewer, which piece is in front?" },
        options: [{ text: "The more valuable piece" }, { text: "The less valuable piece" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: SKEWER_R,
        goal: "win",
        answers: ["a1a6"],
        prompt: { text: "Find the skewer.", kid: "Find the skewer!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "a8", B: "g8", k: "f5", q: "b1" }),
        goal: "win",
        answers: ["g8h7"],
        prompt: { text: "Find the skewer.", kid: "Find the skewer!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "What's the difference between a pin and a skewer?" },
        options: [{ text: "There's no difference" }, { text: "In a pin the smaller piece is in front; in a skewer the bigger piece is in front" }, { text: "Only queens can skewer" }],
        answer: 1,
      },
    ],
    passMark: 2,
    sources: [CFC],
    extra: "skewer",
  },
];
