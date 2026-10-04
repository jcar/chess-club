// Step 8: Club Player. Order follows How to Win at Chess, Part Two (ch. 9–15:
// more tactics, king-and-pawn and rook endings, strategy) with the endgame
// basics from How to Reassess Your Chess, Parts 1 and 3. All wording and
// positions are original; extra practice comes from Lichess (CC0).
//
// Tactics use "win" (proved by the material search). Endgames use "best" with
// `keeps`, so Stockfish proves the key is exactly the moves that keep the win
// (or the draw).

import { after, board } from "../authoring";
import type { Lesson } from "../types";

const HTW9 = "How to Win at Chess, ch. 9–11 (intermediate tactics)";
const HTW12 = "How to Win at Chess, ch. 12–13 (king-and-pawn and rook endings)";
const HTW15 = "How to Win at Chess, ch. 15 (strategy)";
const SIL1 = "How to Reassess Your Chess, Part 1 (endgame basics)";
const SIL3 = "How to Reassess Your Chess, Part 3 (pawn structure basics)";

// Tactics.
const DISC_KNIGHT = board({ K: "g1", R: "e1", N: "e5", P: ["d2", "f2", "g2", "h2"], k: "e8", q: "a5", p: ["a7", "b7", "f7", "g7", "h7"] });
const DISC_BLACK = board({ K: "e1", Q: "a4", P: ["a2", "b2", "f2", "g2", "h2"], k: "g8", r: "e8", n: "e4", p: ["a7", "d7", "f7", "g7", "h7"] }, "b");
const DISC_BISHOP = board({ K: "g1", R: "d1", B: "d3", P: ["a2", "b2", "f2", "g2", "h2"], k: "g8", q: "d8", p: ["a7", "b7", "f7", "g7", "h7"] });
const GUARD_KNIGHT = board({ K: "g1", R: "e1", B: "b5", P: ["a2", "b2", "g2", "h2"], k: "e8", n: "c6", b: "e5", p: ["a7", "b7", "c7", "d7", "f7", "g7", "h7"] });
const GUARD_KNIGHT_2 = board({ K: "g1", R: "d1", B: "b5", P: ["a2", "g2", "h2"], k: "d8", b: "d6", n: "e8", p: ["a7", "g7", "h7"] });
const OVERLOAD = board({ K: "g1", R: ["e1", "d1"], P: ["a2", "f2", "g2", "h2"], k: "g8", r: "d8", n: "d5", p: ["a7", "f7", "g7", "h7"] });
const OVERLOAD_B = board({ K: "g1", R: "d1", N: "d4", P: ["a2", "f2", "g2", "h2"], k: "g8", r: ["d8", "e8"], p: ["a7", "f7", "g7", "h7"] }, "b");
// Black just took White's queen. Check first!
const MATE_FIRST = board({ K: "h2", R: ["a1", "e1"], P: ["f2", "g2", "h3"], k: "g8", q: "d1", r: "e8", p: ["f7", "g7", "h7"] });
const LEGAL = after("e4 e5 Nf3 d6 Bc4 Bg4 Nc3 g6 Nxe5 Bxd1");
const ELEPHANT = after("d4 d5 c4 e6 Nc3 Nf6 Bg5 Nbd7 cxd5 exd5 Nxd5 Nxd5 Bxd8");

// Endgames (Stockfish-proved with `keeps`).
const SQUARE_A4 = ["a4", "b4", "c4", "d4", "e4", "a5", "b5", "c5", "d5", "e5", "a6", "b6", "c6", "d6", "e6", "a7", "b7", "c7", "d7", "e7", "a8", "b8", "c8", "d8", "e8"];
const CATCH_A = board({ K: "h1", P: "a4", k: "f5" }, "b");
const CATCH_H = board({ K: "a1", P: "h4", k: "c5" }, "b");
const RUN_B = board({ K: "h1", P: "b4", k: "g5" });
const RUN_G = board({ K: "a8", P: "g4", k: "b5" });
const KP_AHEAD = board({ K: "e3", P: "e2", k: "e6" });
const KP_HOLD = board({ K: "d5", P: "e4", k: "e7" }, "b");
const KP_HOLD_2 = board({ K: "e5", P: "d4", k: "d7" }, "b");
const KP_SIXTH = board({ K: "d6", P: "d5", k: "d8" });
// Rook endings (principles; Stockfish can't settle these quickly enough).
const ROOK_BEHIND = board({ K: "g1", R: "h1", P: "a5", k: "g7", r: "b8" });
const ROOK_CUT = board({ K: "d2", R: "e1", P: "d3", k: "g5", r: "b8" });
const ROOK_THEIR_PAWN = board({ K: "g2", R: "f8", k: "e5", p: "b4", r: "h3" });
// Pawn weaknesses.
const ISOLATED_W = board({ K: "g1", R: "c1", P: ["a2", "b2", "d4", "f2", "g2", "h2"], k: "g8", r: "c8", p: ["a7", "b7", "e6", "f7", "g7", "h7"] });
const DOUBLED_W = board({ K: "g1", R: "d1", P: ["a2", "b2", "c2", "c3", "f2", "g2", "h2"], k: "g8", r: "d8", p: ["a7", "b7", "c7", "f7", "g7", "h7"] });
const ISOLATED_B = board({ K: "g1", R: "d1", P: ["a2", "b2", "e3", "f2", "g2", "h2"], k: "g8", r: "d8", p: ["a7", "b7", "d5", "f7", "g7", "h7"] });
const DOUBLED_B = board({ K: "g1", R: "e1", P: ["a2", "b2", "c2", "f2", "g2", "h2"], k: "g8", r: "e8", p: ["a7", "b7", "c7", "f7", "f6", "h7"] });

export const step8: Lesson[] = [
  {
    id: "s8-discovered",
    step: 8,
    title: "Discovered Attacks",
    kidTitle: "Surprise Attacks",
    goal: "Kids can move one piece out of the way to uncover an attack by another, and know what a double check is.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "A discovered attack is a hidden attack. One piece stands in front of another, like a curtain. When the front piece moves, the piece behind suddenly attacks.",
        demo: { fen: DISC_KNIGHT, arrows: [{ from: "e1", to: "e8" }], highlight: ["e5"] },
      },
      {
        say: "Here the knight is the curtain. If it moves, the rook gives check. So the knight can go anywhere it likes, and Black must deal with the check first. Knight to c6 attacks the queen, and next move the knight takes it.",
        demo: { fen: DISC_KNIGHT, arrows: [{ from: "e5", to: "c6" }, { from: "c6", to: "a5" }] },
      },
      {
        say: "The best discovered attacks come with check, because the opponent has no time to save the other piece. That's two attacks in one move.",
      },
      {
        say: "If the front piece ALSO gives check, it's a double check. Two pieces check the king at once. You can't block two checks or capture two pieces, so the king must move.",
      },
    ],
    k2Tip: "Play peek-a-boo: the front piece 'hides' the rook. When it moves away, 'Boo!' the rook attacks.",
    commonMistakes: ["Moving the front piece to a square where it gets captured, when another square also attacks something.", "Missing the opponent's discovered attacks (use CCA: look at lined-up pieces)."],
    activity: {
      title: "Curtain Call",
      kidTitle: "Peek-a-Boo",
      minutes: 10,
      setup: "Normal game in pairs, or this lesson's extra puzzles.",
      rules: [
        "Play a normal game. When you set up a 'curtain' (your piece in front of your rook, bishop or queen, aiming at an enemy piece), say 'Curtain!'.",
        "A discovered attack you actually play scores a bonus point. A discovered CHECK scores two.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: DISC_KNIGHT,
        goal: "win",
        answers: ["e5c6", "e5c4"],
        prompt: { text: "Move the knight to uncover a check AND attack the queen.", kid: "Move the horse so the rook checks, and attack the queen!" },
        hint: { text: "The knight can go anywhere: the rook gives check. Which knight move attacks a5?" },
      },
      {
        id: "p2",
        kind: "choice",
        prompt: { text: "What is a double check?" },
        options: [{ text: "Two pieces check the king at the same time" }, { text: "Checking the king twice in a row" }, { text: "Checking both kings" }],
        answer: 0,
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "In a double check, what must the king do?" },
        options: [{ text: "Move" }, { text: "Block one of the checks" }, { text: "Capture one of the checkers with another piece" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: DISC_BISHOP,
        goal: "win",
        answers: ["d3h7"],
        prompt: { text: "The bishop is a curtain in front of your rook. Uncover the attack on the queen, with check!", kid: "Move the bishop with check so the rook attacks the queen!" },
        hint: { text: "Which bishop move gives check?" },
      },
      {
        id: "c2",
        kind: "move",
        fen: DISC_BLACK,
        goal: "win",
        answers: ["e4c5", "e4c3"],
        orientation: "black",
        prompt: { text: "Black: find the discovered attack that wins the queen.", kid: "Black: find the surprise attack!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Why is a discovered attack WITH CHECK so strong?" },
        options: [{ text: "The opponent must answer the check, so they can't save the other piece" }, { text: "Checks win the game right away" }, { text: "Only rooks can do it" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW9],
    extra: "discoveredAttack",
  },

  {
    id: "s8-defender",
    step: 8,
    title: "Remove the Defender",
    kidTitle: "Take Away the Guard",
    goal: "Kids can win a piece by capturing (or chasing away) the piece that guards it.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Sometimes the piece you want is guarded. So don't attack it: attack its bodyguard! Take away the guard, and the piece is yours.",
      },
      {
        say: "Here the black bishop on e5 is stuck: it can't move, because the rook would check the king. Only the knight on c6 guards it.",
        demo: { fen: GUARD_KNIGHT, arrows: [{ from: "e1", to: "e5" }, { from: "c6", to: "e5" }] },
      },
      {
        say: "So the bishop takes the knight. Bishop for knight is a fair trade. But now nothing guards e5, and the rook takes the bishop for free.",
        demo: { fen: GUARD_KNIGHT, arrows: [{ from: "b5", to: "c6" }, { from: "e1", to: "e5" }] },
      },
      {
        say: "The question to ask: 'What is guarding that piece, and can I take the guard?'",
      },
    ],
    k2Tip: "Call the defender a 'bodyguard'. Kids point to the target, then to its bodyguard, before they move.",
    commonMistakes: ["Taking the target first and losing the attacker.", "Taking the defender when the target can just run away (it works best when the target is stuck)."],
    activity: {
      title: "Bodyguard Hunt",
      kidTitle: "Bodyguard Hunt",
      minutes: 10,
      setup: "Normal game in pairs, or this lesson's extra puzzles.",
      rules: [
        "Before each move, pick one enemy piece and say who its bodyguard is.",
        "Winning a piece by taking its bodyguard scores two bonus points.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: GUARD_KNIGHT,
        goal: "win",
        answers: ["b5c6"],
        prompt: { text: "Take away the bishop's bodyguard, then win the bishop.", kid: "Take the guard first!" },
        hint: { text: "Which black piece guards e5?" },
      },
      {
        id: "p2",
        kind: "tap",
        fen: GUARD_KNIGHT_2,
        answers: ["e8"],
        prompt: { text: "The black bishop on d6 can't move (the rook would hit the king). Tap the black piece that guards it.", kid: "Tap the piece that guards the black bishop." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "What does 'remove the defender' mean?" },
        options: [{ text: "Capture or chase away the piece that guards your target" }, { text: "Move your own defender away" }, { text: "Trade queens" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: GUARD_KNIGHT_2,
        goal: "win",
        answers: ["b5e8"],
        prompt: { text: "Remove the defender and win a piece.", kid: "Take the guard first!" },
        hint: { text: "The bishop on d6 is stuck. What guards it?" },
      },
      {
        id: "c2",
        kind: "tap",
        fen: GUARD_KNIGHT,
        answers: ["c6"],
        prompt: { text: "Tap the black piece guarding the bishop on e5.", kid: "Tap the bodyguard." },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Removing the defender works best when the target piece…" },
        options: [{ text: "can't move away" }, { text: "is a pawn" }, { text: "is your own piece" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW9],
    extra: "capturingDefender",
  },

  {
    id: "s8-deflect",
    step: 8,
    title: "Overloaded Defenders",
    kidTitle: "Too Many Jobs",
    goal: "Kids can spot a piece with two jobs and win by making it choose one.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Some defenders have two jobs at once. We call them overloaded. A piece can't do two jobs, so make it choose!",
      },
      {
        say: "Look at Black's rook on d8. Job one: guard the knight on d5. Job two: guard the back row, so White's rook can't check on e8.",
        demo: { fen: OVERLOAD, arrows: [{ from: "d8", to: "d5" }, { from: "d8", to: "e8" }] },
      },
      {
        say: "White takes the knight. If the rook takes back, it has left the back row, and White's other rook goes to e8: checkmate! So Black can't take back and is just a knight down.",
        demo: { fen: OVERLOAD, arrows: [{ from: "d1", to: "d5" }, { from: "e1", to: "e8" }] },
      },
      {
        say: "This is also called deflection: you pull a defender away from its job. Ask 'Which enemy piece is doing two things?'",
      },
    ],
    k2Tip: "Act it out: one kid is the 'guard' who must stand by two doors at once. They can't, and the other kid sneaks in.",
    commonMistakes: ["Taking with the wrong piece (use the piece whose capture forces the defender to choose).", "Forgetting to check whether the defender's second job really matters."],
    activity: {
      title: "Two Jobs",
      kidTitle: "Two Jobs",
      minutes: 10,
      setup: "Normal game in pairs, or this lesson's extra puzzles.",
      rules: [
        "When you see an enemy piece guarding two things, say 'Two jobs!' and point at both.",
        "Win something because of it: two bonus points.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: OVERLOAD,
        goal: "win",
        answers: ["d1d5"],
        prompt: { text: "Black's rook has two jobs. Make it choose, and win a piece.", kid: "The black rook has two jobs. Win the horse!" },
        hint: { text: "If the rook takes back on d5, what happens on e8?" },
      },
      {
        id: "p2",
        kind: "tap",
        fen: OVERLOAD,
        answers: ["d8"],
        prompt: { text: "Tap the black piece that has two jobs.", kid: "Tap the black piece with two jobs." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "What is an overloaded piece?" },
        options: [{ text: "A defender with two jobs at once" }, { text: "A piece that has moved too many times" }, { text: "A piece that is pinned" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: OVERLOAD_B,
        goal: "win",
        answers: ["d8d4"],
        orientation: "black",
        prompt: { text: "Black: White's rook has two jobs. Win a piece!", kid: "Black: the white rook has two jobs. Win the horse!" },
      },
      {
        id: "c2",
        kind: "tap",
        fen: OVERLOAD_B,
        answers: ["d1"],
        prompt: { text: "Tap the white piece that has two jobs.", kid: "Tap the white piece with two jobs." },
      },
      {
        id: "c3",
        kind: "choice",
        fen: OVERLOAD,
        prompt: { text: "White plays Rxd5. Why can't Black's rook take back?" },
        options: [{ text: "Then Re8 is checkmate" }, { text: "Rooks can't capture knights" }, { text: "The rook is pinned to the queen" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW9],
    extra: "deflection",
  },

  {
    id: "s8-inbetween",
    step: 8,
    title: "In-Between Moves",
    kidTitle: "Wait! Check First",
    goal: "Kids look for a check or bigger threat before automatically taking back.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "When your opponent captures, you usually take back. But first: CCA! Sometimes there's an even better move to play in between, and you can take back later.",
      },
      {
        say: "This is a real trap. Black just took White's queen. White doesn't take back. Instead: bishop takes f7, check! The king must go to e7, and the knight jumps to d5. Checkmate, with Black still holding White's queen.",
        demo: { fen: LEGAL, arrows: [{ from: "c4", to: "f7" }, { from: "c3", to: "d5" }] },
      },
      {
        say: "Here's a trap for Black. White's bishop just grabbed Black's queen on d8. Taking the bishop back looks natural, but Black plays bishop to b4, check, first! White's only block is the queen. Black takes it, White takes back, and THEN Black takes the bishop on d8. Black ends up a whole piece ahead.",
        demo: { fen: ELEPHANT, orientation: "black", arrows: [{ from: "f8", to: "b4" }] },
      },
      {
        say: "The rule: before you take back, ask 'Do I have a check or a bigger capture first?'",
      },
    ],
    k2Tip: "Make it a call-and-response: the coach says 'They took my piece!' and kids answer 'CCA first!'",
    commonMistakes: ["Recapturing on autopilot.", "Playing an in-between move that isn't forcing, so the opponent saves their piece."],
    activity: {
      title: "Freeze!",
      kidTitle: "Freeze!",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "Whenever your opponent captures, say 'Freeze!' and do CCA out loud before taking back.",
        "If you find an in-between move that's better, score two bonus points.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: MATE_FIRST,
        goal: "mate",
        answers: ["e1e8"],
        prompt: { text: "Black just took your queen. Don't take back yet: checkmate in one!", kid: "Don't take back! Find checkmate!" },
        hint: { text: "Look at Black's back row." },
      },
      {
        id: "p2",
        kind: "move",
        fen: LEGAL,
        goal: "best",
        answers: ["c4f7"],
        prompt: { text: "Black just took your queen. Find the in-between check that leads to checkmate.", kid: "Don't take back! Find the check!" },
        hint: { text: "Which white piece can capture with check?" },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Your opponent just captured one of your pieces. What should you do first?" },
        options: [{ text: "CCA: look for checks and captures before taking back" }, { text: "Always take back right away" }, { text: "Resign" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: ELEPHANT,
        goal: "best",
        answers: ["f8b4"],
        orientation: "black",
        prompt: { text: "Black: White just took your queen. Don't take back yet! Find the in-between check that wins.", kid: "Black: don't take back! Find the check!" },
        hint: { text: "After the check, White must block with the queen." },
      },
      {
        id: "c2",
        kind: "move",
        fen: MATE_FIRST,
        goal: "mate",
        answers: ["e1e8"],
        prompt: { text: "Before taking back the queen: is there something better? Checkmate in one.", kid: "Find checkmate!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "An in-between move works best when it is…" },
        options: [{ text: "a check or a big threat" }, { text: "a quiet pawn move" }, { text: "a king move" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW9],
    extra: "intermezzo",
  },

  {
    id: "s8-square",
    step: 8,
    title: "Pawn Races: the Rule of the Square",
    kidTitle: "Catch the Pawn!",
    goal: "Kids can tell at a glance whether a king can catch a passed pawn, and push or chase correctly.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "A passed pawn has no enemy pawns in its way. In an ending, it wants to run and become a queen. Can the enemy king catch it? There's a trick to know without counting moves.",
      },
      {
        say: "Draw a square from the pawn to the promotion row. This pawn on a4 has four squares to go, so the box is five squares wide: from a4 across to e4 and up to e8.",
        demo: { fen: CATCH_A, highlight: SQUARE_A4 },
      },
      {
        say: "The rule: if the king can step into the square, it catches the pawn. Here it's Black's move, and the king on f5 steps to e5, e6 or e4. It's inside, so it catches the pawn.",
        demo: { fen: CATCH_A, highlight: SQUARE_A4, arrows: [{ from: "f5", to: "e5" }] },
      },
      {
        say: "The square shrinks every time the pawn moves. So if you have the pawn, push it before the king gets in. Remember: a pawn on its starting square can jump two, so draw the box from the square in front of it.",
      },
    ],
    k2Tip: "Use string or four pencils to make the box on a real board. If the king can 'jump into the box', it wins the race.",
    commonMistakes: ["Moving the king toward the pawn instead of straight into the square.", "Forgetting that it matters whose move it is.", "Forgetting the two-square first move of a pawn."],
    activity: {
      title: "Pawn Race",
      kidTitle: "Pawn Race",
      minutes: 10,
      setup: "In pairs. White: king and one pawn. Black: just a king. Set them up anywhere, with the pawn passed.",
      rules: [
        "Before moving, both players predict: can the king catch the pawn? Use the square.",
        "Play it out. White wins by making a queen, Black wins by capturing the pawn.",
        "A correct prediction scores a point. Swap colors each round.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: CATCH_A,
        goal: "best",
        keeps: "draw",
        answers: ["f5e4", "f5e5", "f5e6"],
        orientation: "black",
        prompt: { text: "Black: step into the pawn's square so you can catch it.", kid: "Black: jump into the pawn's box!" },
        hint: { text: "The box goes from a4 to e8. Get onto the e-file." },
      },
      {
        id: "p2",
        kind: "move",
        fen: RUN_B,
        goal: "best",
        keeps: "win",
        answers: ["b4b5"],
        prompt: { text: "Can the black king catch your pawn? Make the move that wins the race.", kid: "Win the race to the end!" },
        hint: { text: "Every king move gives Black time. What shrinks the square?" },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "The defending king can step inside the pawn's square. What happens?" },
        options: [{ text: "It catches the pawn" }, { text: "The pawn still becomes a queen" }, { text: "It's checkmate" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: CATCH_H,
        goal: "best",
        keeps: "draw",
        answers: ["c5d4", "c5d5", "c5d6"],
        orientation: "black",
        prompt: { text: "Black: catch the pawn!", kid: "Black: jump into the box!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: RUN_G,
        goal: "best",
        keeps: "win",
        answers: ["g4g5"],
        prompt: { text: "Win the pawn race.", kid: "Win the race!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "A pawn on a5 needs 3 moves to promote. How wide is its square?" },
        options: [{ text: "4 squares (a5 to d5)" }, { text: "3 squares" }, { text: "8 squares" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW12, SIL1],
  },

  {
    id: "s8-opposition",
    step: 8,
    title: "King and Pawn: the Opposition",
    kidTitle: "King Face-Off",
    goal: "Kids know that the king leads the pawn, and can use the opposition to win or hold king-and-pawn endings.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "King and pawn against king. The big secret: the king goes FIRST, the pawn follows. A pawn pushed alone just gets caught.",
        demo: { fen: KP_AHEAD, arrows: [{ from: "e3", to: "e4" }] },
      },
      {
        say: "When two kings stand face to face with one square between them, that's called the opposition. The player who does NOT have to move 'has the opposition'. The other king must step aside and let you through.",
        demo: { fen: board({ K: "e4", P: "e2", k: "e6" }, "b"), highlight: ["e5"] },
      },
      {
        say: "Here's a magic position. White's king is on the sixth row in front of its pawn. That wins no matter whose move it is: the king walks the pawn home.",
        demo: { fen: KP_SIXTH, highlight: ["d6"] },
      },
      {
        say: "Defending? Stand in front of the pawn and take the opposition whenever you can. If you're pushed back, go straight back, not sideways. And with a pawn on the edge (a- or h-file), the defender draws just by getting the king into the corner in front of it.",
        demo: { fen: KP_HOLD, arrows: [{ from: "e7", to: "d7" }] },
      },
    ],
    k2Tip: "Call the opposition a 'staring contest': the king that has to move first blinks and loses.",
    commonMistakes: ["Pushing the pawn first and letting the king get in front of it.", "Defender stepping to the side instead of straight back.", "Pushing to the 7th row with check and stalemating the king."],
    activity: {
      title: "Face-Off",
      kidTitle: "Staring Contest",
      minutes: 10,
      setup: "In pairs. White: king on e1, pawn on e2. Black: king on e8.",
      rules: [
        "White tries to make a queen. Black tries to draw (capture the pawn or reach stalemate).",
        "Play it out, then swap colors.",
        "Try again with White's king starting in front of the pawn (e3). Who wins now?",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: KP_AHEAD,
        goal: "best",
        keeps: "win",
        answers: ["e3e4", "e3d4", "e3f4"],
        prompt: { text: "King and pawn against king. Find a move that keeps the win.", kid: "King goes first! Find the winning move." },
        hint: { text: "The king leads the pawn. Go forward." },
      },
      {
        id: "p2",
        kind: "move",
        fen: KP_HOLD,
        goal: "best",
        keeps: "draw",
        answers: ["e7d7"],
        orientation: "black",
        prompt: { text: "Black: take the opposition to hold the draw.", kid: "Black: face the white king!" },
        hint: { text: "Stand face to face with White's king, with one square between." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "In a king-and-pawn ending, which goes first?" },
        options: [{ text: "The king, then the pawn follows" }, { text: "The pawn, then the king follows" }, { text: "It doesn't matter" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: KP_SIXTH,
        goal: "best",
        keeps: "win",
        answers: ["d6e6", "d6c6"],
        prompt: { text: "Your king is on the sixth row in front of the pawn. Find a move that keeps the win.", kid: "Find the winning king move!" },
        hint: { text: "Step next to the pawn's path, so the pawn can move up." },
      },
      {
        id: "c2",
        kind: "move",
        fen: KP_HOLD_2,
        goal: "best",
        keeps: "draw",
        answers: ["d7e7"],
        orientation: "black",
        prompt: { text: "Black: hold the draw.", kid: "Black: face the white king!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Two kings face each other with one square between. Who has the opposition?" },
        options: [{ text: "The player who does NOT have to move" }, { text: "The player whose turn it is" }, { text: "The player with the pawn" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW12, SIL1],
    extra: "pawnEndgame",
  },

  {
    id: "s8-rook",
    step: 8,
    title: "First Rook Endings",
    kidTitle: "Rook Endings",
    goal: "Kids know three rook-ending rules: rooks behind passed pawns, active rooks, and cutting off the king.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Rook endings are the most common endings in chess. Three rules will take you a long way.",
      },
      {
        say: "Rule one: rooks belong BEHIND passed pawns. Behind your own pawn, the rook pushes it forward and gets stronger as the pawn moves. Behind the enemy pawn, it chases it.",
        demo: { fen: ROOK_BEHIND, arrows: [{ from: "h1", to: "a1" }] },
      },
      {
        say: "Rule two: keep your rook active. A rook that attacks is worth more than a rook that sits and guards. Don't let it become a babysitter.",
      },
      {
        say: "Rule three: cut off the enemy king. Here White's rook on e1 is a wall. The black king can't cross the e-file to help stop the d-pawn.",
        demo: { fen: ROOK_CUT, highlight: ["e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8"] },
      },
      {
        say: "One more thing: rook endings are often drawn, even a pawn down. If you're behind, keep fighting!",
      },
    ],
    k2Tip: "The rook 'pushes the pawn from behind like a shopping cart'.",
    commonMistakes: ["Putting the rook in front of your own passed pawn, where it blocks it.", "Grabbing a pawn with the rook and letting the enemy rook become active.", "Giving up a drawn rook ending."],
    activity: {
      title: "Rook and Pawn",
      kidTitle: "Rook and Pawn",
      minutes: 10,
      setup: "In pairs. Each side: king and rook. White also has a pawn on the a-file. Set it up so the pawn is passed.",
      rules: [
        "White tries to make a queen; Black tries to stop it.",
        "Before each rook move, ask: is my rook behind the passed pawn? Is it active?",
        "Swap colors after each game.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "tap",
        fen: ROOK_BEHIND,
        answers: ["a1", "a2", "a3", "a4"],
        prompt: { text: "Rooks belong behind passed pawns. Tap a square on the a-file where White's rook should go.", kid: "Tap a square behind the white pawn." },
        hint: { text: "Behind the pawn means between it and White's own side of the board." },
      },
      {
        id: "p2",
        kind: "choice",
        fen: ROOK_CUT,
        prompt: { text: "What is White's rook on e1 doing?" },
        options: [{ text: "Cutting off the black king from the d-pawn" }, { text: "Attacking Black's rook" }, { text: "Giving check" }],
        answer: 0,
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Which rook is usually better?" },
        options: [{ text: "One that attacks" }, { text: "One that only guards a pawn" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "tap",
        fen: ROOK_THEIR_PAWN,
        answers: ["b5", "b6", "b7", "b8"],
        prompt: { text: "Black's passed pawn is on b4. Tap a square behind it where White's rook could chase it.", kid: "Tap a square behind the black pawn." },
        hint: { text: "Black's pawn moves toward row 1, so 'behind' it is toward row 8." },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "Where should a rook go when there's a passed pawn?" },
        options: [{ text: "Behind the pawn" }, { text: "In front of the pawn" }, { text: "In the corner" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "You're one pawn down in a rook ending. What's true?" },
        options: [{ text: "It's often still a draw, so keep fighting" }, { text: "You should resign" }, { text: "Trade rooks right away" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW12, SIL1],
    extra: "rookEndgame",
  },

  {
    id: "s8-pawns",
    step: 8,
    title: "Weak Pawns and Good Trades",
    kidTitle: "Weak Pawns",
    goal: "Kids can spot isolated and doubled pawns, and know to trade pieces (not pawns) when ahead.",
    minutes: 15,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Pawns can't move backward, so a weak pawn stays weak all game. Two kinds to know. An isolated pawn has no friendly pawns on the files next to it, so no pawn can ever protect it.",
        demo: { fen: ISOLATED_W, highlight: ["d4"] },
      },
      {
        say: "Doubled pawns are two pawns of the same color on the same file. They get in each other's way and can't protect each other.",
        demo: { fen: DOUBLED_W, highlight: ["c2", "c3"] },
      },
      {
        say: "Weak pawns are targets. Attack them with your pieces, especially rooks, and pile up until they fall.",
      },
      {
        say: "And when you're ahead in material, trade pieces, not pawns. Every trade makes your extra piece count for more. When you're behind, avoid trades and look for tricks.",
      },
    ],
    k2Tip: "An isolated pawn is 'a pawn with no friends next door'. Doubled pawns are 'standing in line'.",
    commonMistakes: ["Making doubled pawns with a careless capture.", "Trading pawns when you're a piece ahead.", "Ignoring the opponent's weak pawns instead of attacking them."],
    activity: {
      title: "Pawn Detective",
      kidTitle: "Pawn Detective",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "Play 15 moves each, then stop.",
        "Each player points out every isolated or doubled pawn on the board, for both sides.",
        "One point for each one you find. Then keep playing and attack the weak pawns!",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "tap",
        fen: ISOLATED_W,
        answers: ["d4"],
        prompt: { text: "Tap White's isolated pawn.", kid: "Tap the white pawn with no friends next door." },
        hint: { text: "Which white pawn has no white pawns on the files on either side?" },
      },
      {
        id: "p2",
        kind: "tap",
        fen: DOUBLED_W,
        answers: ["c2", "c3"],
        prompt: { text: "Tap one of White's doubled pawns.", kid: "Tap a white pawn standing in line." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "You're a knight ahead. Which trades help you?" },
        options: [{ text: "Trading pieces" }, { text: "Trading pawns" }, { text: "No trades at all" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "tap",
        fen: ISOLATED_B,
        answers: ["d5"],
        prompt: { text: "Tap Black's isolated pawn.", kid: "Tap the black pawn with no friends next door." },
      },
      {
        id: "c2",
        kind: "tap",
        fen: DOUBLED_B,
        answers: ["f7", "f6"],
        prompt: { text: "Tap one of Black's doubled pawns.", kid: "Tap a black pawn standing in line." },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Why is an isolated pawn weak?" },
        options: [{ text: "No other pawn can ever protect it" }, { text: "It can't move" }, { text: "It's worth less than other pawns" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [HTW15, SIL3],
  },
];
