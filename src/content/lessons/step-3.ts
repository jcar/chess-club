// Step 3: Check & Checkmate. Order follows Chess for Children, Part 2 (giving
// and escaping check, giving checkmate) with Rozman's "the ways a game ends"
// framing from How to Win at Chess, ch. 1. All wording here is original.

import { after, board } from "../authoring";
import type { Lesson } from "../types";

const CFC = "Chess for Children, Part 2 (check and checkmate)";
const HTW = "How to Win at Chess, ch. 1 (how games are won)";

export const step3: Lesson[] = [
  {
    id: "s3-check",
    step: 3,
    title: "Check!",
    kidTitle: "Check!",
    goal: "Kids can spot when a king is attacked and give check with any piece.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "Kings can never be captured. When a piece attacks the king, we call it check. It's polite to say 'check' out loud.",
        demo: { fen: board({ K: "g1", R: "e1", k: "e8" }), arrows: [{ from: "e1", to: "e8" }] },
      },
      {
        say: "Any piece can give check, even a little pawn. Here the knight is checking the black king.",
        demo: { fen: board({ K: "g1", N: "d6", k: "e8" }), arrows: [{ from: "d6", to: "e8" }] },
      },
      {
        say: "Your job today: find the checks. Look at every piece and ask, 'Can it attack the king?'",
        demo: { fen: board({ K: "g1", R: "a1", k: "e8" }), arrows: [{ from: "a1", to: "a8" }, { from: "a1", to: "e1" }] },
      },
    ],
    k2Tip: "Call it 'the king is in trouble!' and have kids point to the piece causing the trouble.",
    commonMistakes: ["Missing checks by a knight.", "Not noticing their own king is in check."],
    activity: {
      title: "First Check Wins",
      kidTitle: "First Check Wins",
      minutes: 10,
      setup: "Normal starting position.",
      rules: [
        "Play a normal game.",
        "The first player to give check wins, but only if the checking piece can't be captured right away.",
        "Play best of three, switching colors.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "g1", R: "a1", k: "e8" }),
        goal: "check",
        answers: ["a1a8", "a1e1"],
        prompt: { text: "Give check with the rook.", kid: "Attack the king with the rook!" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "g1", N: "e4", k: "e8" }),
        goal: "check",
        answers: ["e4d6", "e4f6"],
        prompt: { text: "Give check with the knight.", kid: "Attack the king with the horse!" },
        hint: { text: "Which squares does a knight attack from? Count: two, then one to the side.", kid: "Horse hop: two, then one to the side." },
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "g1", B: "f1", k: "e8", p: ["f7", "g7"] }),
        goal: "check",
        answers: ["f1b5"],
        prompt: { text: "Give check with the bishop.", kid: "Attack the king with the bishop!" },
      },
      {
        id: "p4",
        kind: "choice",
        fen: board({ K: "g1", Q: "e2", k: "e8", p: "e5" }),
        prompt: { text: "Is the black king in check?", kid: "Is the black king in check?" },
        options: [{ pic: "👍", text: "Yes" }, { pic: "👎", text: "No" }],
        answer: 1,
        hint: { text: "Something is standing in the way.", kid: "Is something in the way?" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "b1", Q: "d1", k: "h8", p: ["g7", "h7"] }),
        goal: "check",
        answers: ["d1d8"],
        prompt: { text: "Give check with the queen.", kid: "Attack the king with the queen!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "c1", R: "h1", N: "c3", k: "d8", p: ["c7", "d7", "e7"] }),
        goal: "check",
        answers: ["h1h8"],
        prompt: { text: "Find the check.", kid: "Attack the king!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "What is it called when a piece attacks the king?", kid: "When a piece attacks the king, we say…" },
        options: [{ text: "Capture" }, { text: "Check" }, { text: "Castle" }],
        answer: 1,
      },
    ],
    passMark: 2,
    sources: [CFC],
  },

  {
    id: "s3-escape",
    step: 3,
    title: "Getting Out of Check",
    kidTitle: "Escape!",
    goal: "Kids know the three ways out of check: move the king, capture the checker, or block.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "If your king is in check, you must get out of check right away. There are three ways. Way one: move the king to a safe square.",
        demo: { fen: board({ K: "e1", r: "e8", k: "a8" }), arrows: [{ from: "e8", to: "e1" }], highlight: ["d1", "d2", "f1", "f2"] },
      },
      {
        say: "Way two: capture the piece that's giving check. Here the queen came too close and nobody protects her.",
        demo: { fen: board({ K: "h1", q: "g2", k: "a8" }), arrows: [{ from: "h1", to: "g2" }] },
      },
      {
        say: "Way three: block. Put one of your pieces in the way, between the king and the attacker.",
        demo: { fen: board({ K: "a1", P: ["a2", "b2"], R: "d8", r: "e1", k: "h8", p: ["g7", "h7"] }), arrows: [{ from: "d8", to: "d1" }] },
      },
      {
        say: "Move, capture, block. Say it with me! If none of them work, that's checkmate, and the game is over. That's next lesson.",
      },
    ],
    k2Tip: "Act it out: 'Run away! Knock it out! Hide behind a friend!'",
    commonMistakes: ["Making some other move while in check.", "Moving the king to a square that's also attacked."],
    activity: {
      title: "Check Escape Drill",
      kidTitle: "Run, Knock, Hide",
      minutes: 10,
      setup: "One partner sets up a king and a few pieces; the other gives check.",
      rules: [
        "Partner A puts their king and two other pieces anywhere.",
        "Partner B places one attacking piece so it gives check.",
        "Partner A must say which way out they'll use (move, capture or block) and do it.",
        "Swap roles every time.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "e1", r: "e8", k: "a8" }),
        goal: "escape",
        answers: ["e1d1", "e1d2", "e1f1", "e1f2"],
        prompt: { text: "You're in check! Move your king to safety.", kid: "Your king is in trouble! Run away!" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "h1", q: "g2", k: "a8" }),
        goal: "escape",
        answers: ["h1g2"],
        prompt: { text: "Get out of check. Only one move works!", kid: "Get out of trouble!" },
        hint: { text: "Is the queen protected?", kid: "Is anyone guarding the queen?" },
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "a1", P: ["a2", "b2"], R: "d8", r: "e1", k: "h8", p: ["g7", "h7"] }),
        goal: "escape",
        answers: ["d8d1"],
        prompt: { text: "Your king can't move. Block the check.", kid: "Hide behind a friend!" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "choice",
        prompt: { text: "Which of these is NOT a way out of check?", kid: "Which one does NOT get you out of check?" },
        options: [{ pic: "🏃", text: "Move the king", kid: "Move the king" }, { pic: "🛡️", text: "Block" }, { pic: "🎯", text: "Capture a different piece", kid: "Take a different piece" }, { pic: "⚔️", text: "Capture the checker", kid: "Take the attacker" }],
        answer: 2,
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "g1", P: ["f2", "g2", "h2"], N: "c2", r: "e1", k: "g8", p: ["f7", "g7", "h7"] }),
        goal: "escape",
        answers: ["c2e1"],
        prompt: { text: "Get out of check.", kid: "Get out of trouble!" },
      },
      {
        id: "c3",
        kind: "move",
        fen: board({ K: "h1", P: ["g3", "h2"], B: "e2", q: "a8", k: "a1" }),
        goal: "escape",
        answers: ["e2f3", "h1g1"],
        prompt: { text: "Get out of check.", kid: "Get out of trouble!" },
      },
    ],
    passMark: 2,
    sources: [CFC],
  },

  {
    id: "s3-mate",
    step: 3,
    title: "Checkmate!",
    kidTitle: "Checkmate!",
    goal: "Kids can recognize checkmate and find a checkmate in one move.",
    minutes: 20,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "Checkmate means the king is in check and there's no way out: he can't move, nobody can capture the attacker, and nobody can block. Checkmate wins the game!",
        demo: { fen: board({ K: "g1", R: "a8", k: "g8", p: ["f7", "g7", "h7"] }), arrows: [{ from: "a8", to: "g8" }] },
      },
      {
        say: "Look: the black king is stuck behind his own pawns. The rook checks along the back row. He can't move, and nothing can capture or block. Checkmate!",
        demo: { fen: board({ K: "g1", R: "a8", k: "g8", p: ["f7", "g7", "h7"] }), highlight: ["f7", "g7", "h7"] },
      },
      {
        say: "A queen right next to the king can be checkmate, if a friend protects her so the king can't capture her.",
        demo: { fen: board({ K: "f6", Q: "f7", k: "f8" }), highlight: ["f6"] },
      },
      {
        say: "To check if it's mate, ask the three questions: can the king move? Can anyone capture? Can anyone block? Three no's means checkmate.",
      },
    ],
    k2Tip: "Checkmate is 'check, and no escape'. Use the Run, Knock, Hide words from last lesson.",
    commonMistakes: ["Calling any check 'checkmate'.", "Giving check with an unprotected queen right next to the king (the king just takes her)."],
    activity: {
      title: "Mate-in-One Hunt",
      kidTitle: "Checkmate Hunt",
      minutes: 15,
      setup: "Print the practice page and put one copy on each table, or use the iPads.",
      rules: [
        "Pairs set up each position on their board.",
        "Both kids look for the checkmate. The first to find it points without touching.",
        "Check it together with the three questions: move? capture? block?",
        "Then play a normal game and try to finish it with checkmate.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "g1", R: "a1", k: "g8", p: ["f7", "g7", "h7"] }),
        goal: "mate",
        answers: ["a1a8"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
        hint: { text: "The king is stuck behind his pawns.", kid: "The king is stuck behind his pawns!" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "f6", Q: "a7", k: "f8" }),
        goal: "mate",
        answers: ["a7a8", "a7b8", "a7f7"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
        hint: { text: "Your king can protect the queen.", kid: "Your king can guard the queen." },
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "g1", R: ["a7", "b1"], k: "h8" }),
        goal: "mate",
        answers: ["b1b8"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
        hint: { text: "One rook already guards the 7th row.", kid: "One rook already blocks a row. Use the other one!" },
      },
      {
        id: "p4",
        kind: "choice",
        fen: board({ K: "g1", Q: "g7", k: "g8" }),
        prompt: { text: "White's queen gives check. Is it checkmate?", kid: "The queen says check. Is it checkmate?" },
        options: [{ pic: "👍", text: "Yes" }, { pic: "👎", text: "No, the king can capture the queen", kid: "No, the king can take the queen" }],
        answer: 1,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "b6", Q: "c3", k: "a8" }),
        goal: "mate",
        answers: ["c3c8", "c3h8"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "g1", Q: "d1", k: "g8", p: ["f7", "g7", "h7"] }),
        goal: "mate",
        answers: ["d1d8"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
      },
      {
        id: "c3",
        kind: "move",
        fen: after("e4 e5 Qh5 Nc6 Bc4 Nf6"),
        goal: "mate",
        answers: ["h5f7"],
        prompt: { text: "Checkmate in one move.", kid: "Find checkmate!" },
      },
    ],
    passMark: 2,
    sources: [CFC, HTW],
    extra: "mateIn1",
  },
];
