// Step 2: Capture & Count. Order follows Chess for Children, Part 2 (piece
// values, practicing moves and captures, notation) with the "piece vision"
// framing from How to Win at Chess, ch. 7 (what attacks what, what defends
// what). All wording here is original.

import { board, START_FEN, EMPTY_FEN } from "../authoring";
import type { Lesson } from "../types";

const CFC = "Chess for Children, Part 2 (topic order)";
const HTW = "How to Win at Chess, ch. 7 (attacking and defending)";

export const step2: Lesson[] = [
  {
    id: "s2-values",
    step: 2,
    title: "What Pieces Are Worth",
    kidTitle: "Piece Points",
    goal: "Kids know the point values (pawn 1, knight 3, bishop 3, rook 5, queen 9) and grab the biggest capture.",
    minutes: 15,
    materials: ["One board and set per pair", "Optional: a points poster (print the answer key's game card)"],
    script: [
      {
        say: "Some pieces are stronger than others, so we give them points. A pawn is worth 1 point. A knight is worth 3, and so is a bishop.",
        demo: { fen: board({ P: "b4", N: "d4", B: "f4" }) },
      },
      {
        say: "A rook is worth 5 points. The queen is worth 9: almost two rooks!",
        demo: { fen: board({ R: "c4", Q: "f4" }) },
      },
      {
        say: "The king has no points, because you can never trade him. If he's trapped, the game is over.",
        demo: { fen: board({ K: "e4" }) },
      },
      {
        say: "When you can capture more than one piece, count the points and take the biggest. Which piece should this knight take?",
        do: "Let kids shout answers. The rook on f5 is worth the most.",
        demo: { fen: board({ K: "g1", N: "d4", k: "g8", p: "b5", b: "e6", r: "f5" }), highlight: ["b5", "e6", "f5"] },
      },
    ],
    k2Tip: "Use cookies: a pawn is 1 cookie, a queen is 9 cookies. Which pile would you rather have?",
    commonMistakes: ["Thinking the knight is worth more than the bishop (they're about equal).", "Taking the first capture they see instead of the biggest."],
    activity: {
      title: "Points Race",
      kidTitle: "Points Race",
      minutes: 15,
      setup: "Normal starting position. Each player needs paper to keep score, or a pile for captured pieces.",
      rules: [
        "Play a normal game, but don't worry about checkmate.",
        "Every time you capture, add up the points of the piece you took.",
        "The first player to reach 15 points wins.",
        "Kings can't be captured. If a king is in check, it must get out.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "choice",
        prompt: { text: "How many points is a rook worth?", kid: "A rook is worth how many points?" },
        options: [{ text: "1" }, { text: "3" }, { text: "5" }, { text: "9" }],
        answer: 2,
      },
      {
        id: "p2",
        kind: "choice",
        prompt: { text: "Which is worth more: a knight or a rook?", kid: "Which is worth more: the horse or the rook?" },
        options: [{ pic: "♞", text: "Knight" }, { pic: "♜", text: "Rook" }, { pic: "🟰", text: "They're the same", kid: "The same" }],
        answer: 1,
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "g1", N: "d4", k: "g8", p: "b5", b: "e6", r: "f5" }),
        goal: "capture",
        answers: ["d4f5"],
        strict: true,
        prompt: { text: "Capture the piece worth the most points.", kid: "Take the piece with the most points!" },
        hint: { text: "Pawn 1, bishop 3, rook 5.", kid: "Pawn 1. Bishop 3. Rook 5." },
      },
      {
        id: "p4",
        kind: "choice",
        prompt: { text: "How many pawns is a queen worth?", kid: "How many pawns is a queen worth?" },
        options: [{ text: "3" }, { text: "5" }, { text: "9" }],
        answer: 2,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "choice",
        prompt: { text: "How many points is a bishop worth?", kid: "How many points is a bishop worth?" },
        options: [{ text: "1" }, { text: "3" }, { text: "5" }, { text: "9" }],
        answer: 1,
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "Which piece is worth the most points?", kid: "Which piece is worth the most?" },
        options: [{ pic: "♜", text: "Rook" }, { pic: "♛", text: "Queen" }, { pic: "♞", text: "Knight" }],
        answer: 1,
      },
      {
        id: "c3",
        kind: "move",
        fen: board({ K: "a1", P: "d4", k: "h8", r: "e5", b: "c5", p: "d6" }),
        goal: "capture",
        answers: ["d4e5"],
        strict: true,
        prompt: { text: "Your pawn can capture two pieces. Take the one worth more.", kid: "Take the piece with more points!" },
      },
    ],
    passMark: 2,
    sources: [CFC],
  },

  {
    id: "s2-free",
    step: 2,
    title: "Free Pieces",
    kidTitle: "Free Pieces",
    goal: "Kids can tell a protected piece from an unprotected one and capture only what's free.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "A piece is protected when a friend could capture back if it gets taken. This black knight is protected by the pawn next to it.",
        demo: { fen: board({ K: "g1", R: "d1", k: "g8", n: "d6", p: "e7", b: "a1" }), highlight: ["d6", "e7"] },
      },
      {
        say: "If our rook takes the knight, the pawn takes our rook. We win 3 points but lose 5. That's a bad deal!",
        demo: { fen: board({ K: "g1", R: "d1", k: "g8", n: "d6", p: "e7", b: "a1" }), arrows: [{ from: "d1", to: "d6" }, { from: "e7", to: "d6" }] },
      },
      {
        say: "But the bishop in the corner has no friends nearby. Nobody can capture back. We call that a free piece. Take free pieces!",
        demo: { fen: board({ K: "g1", R: "d1", k: "g8", n: "d6", p: "e7", b: "a1" }), arrows: [{ from: "d1", to: "a1" }] },
      },
      {
        say: "Before every capture, ask: can they take back? Before every move, ask: can they take my piece for free?",
        do: "Make this the club's question. Repeat it all year.",
      },
    ],
    k2Tip: "Protected pieces have a 'bodyguard'. Point to the bodyguard before capturing.",
    commonMistakes: ["Grabbing a protected piece with the queen.", "Leaving their own pieces unprotected right after moving."],
    activity: {
      title: "Free Piece Hunt",
      kidTitle: "Bodyguards",
      minutes: 10,
      setup: "Play a normal game.",
      rules: [
        "Before each move, say out loud whether your opponent left anything free.",
        "If you find a free piece and take it, you get a bonus point.",
        "If you leave one of your own pieces free and your partner takes it, they get a bonus point.",
        "Most bonus points after 10 minutes wins.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "g1", R: "d1", k: "g8", n: "d6", p: "e7", b: "a1" }),
        goal: "capture",
        answers: ["d1a1"],
        strict: true,
        prompt: { text: "Capture the free piece. Watch out for the protected one!", kid: "Take the piece with no bodyguard!" },
        hint: { text: "The pawn on e7 guards the knight.", kid: "A pawn guards the horse. Look for something nobody guards." },
      },
      {
        id: "p2",
        kind: "choice",
        fen: board({ K: "g1", Q: "d1", k: "g8", n: "d5", p: "e6" }),
        prompt: { text: "Is it a good idea for the queen to take the knight?", kid: "Should the queen take the horse?" },
        options: [{ pic: "👍", text: "Yes, it's free", kid: "Yes, it's free" }, { pic: "👎", text: "No, the pawn takes back", kid: "No, a pawn takes back" }],
        answer: 1,
        hint: { text: "Look at the pawn on e6.", kid: "Look at the black pawn next to it." },
      },
      {
        id: "p3",
        kind: "move",
        fen: board({ K: "g1", Q: "d1", k: "g8", r: ["a8", "d8"], n: "a4", p: "b5", b: "g4" }),
        goal: "capture",
        answers: ["d1g4"],
        strict: true,
        prompt: { text: "Your queen can capture three pieces, but only one is free. Find it.", kid: "Only one is free. Take it!" },
        hint: { text: "The rook on a8 guards d8. The pawn on b5 guards a4.", kid: "Two pieces are guarded. One is free!" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "a2", R: "e1", k: "b8", b: "e5", p: "d6", n: "h1" }),
        goal: "capture",
        answers: ["e1h1"],
        strict: true,
        prompt: { text: "Capture the free piece.", kid: "Take the piece with no bodyguard!" },
      },
      {
        id: "c2",
        kind: "choice",
        fen: board({ K: "g1", B: "c4", k: "g8", r: "f7", p: "g6" }),
        prompt: { text: "Can the bishop take the rook for free?", kid: "Is the rook free?" },
        options: [{ pic: "👍", text: "Yes" }, { pic: "👎", text: "No" }],
        answer: 1,
        hint: { text: "Who guards f7?", kid: "Is it guarded?" },
      },
      {
        id: "c3",
        kind: "move",
        fen: board({ K: "a1", N: "c3", k: "h8", b: "b5", p: ["a6", "e7"], r: "e4" }),
        goal: "capture",
        answers: ["c3e4"],
        strict: true,
        prompt: { text: "Capture the free piece with your knight.", kid: "Take the free piece!" },
      },
    ],
    passMark: 2,
    sources: [CFC, HTW],
    extra: "hangingPiece",
  },

  {
    id: "s2-trades",
    step: 2,
    title: "Good Trades, Bad Trades",
    kidTitle: "Good Trade or Bad Trade?",
    goal: "Kids can count a trade and decide whether it wins or loses points.",
    minutes: 15,
    materials: ["One board and set per pair"],
    script: [
      {
        say: "A trade is when you capture a piece and they capture one of yours back. To know if it's good, count the points.",
      },
      {
        say: "If our pawn takes this knight and their pawn takes back, we gave 1 point and got 3. That's a good trade!",
        demo: { fen: board({ K: "g1", P: "d4", k: "g8", n: "e5", p: "f6" }), arrows: [{ from: "d4", to: "e5" }, { from: "f6", to: "e5" }] },
      },
      {
        say: "If our rook takes a pawn and gets taken back, we gave 5 and got 1. Bad trade!",
        demo: { fen: board({ K: "g1", R: "d1", k: "g8", p: ["d6", "e7"] }), arrows: [{ from: "d1", to: "d6" }, { from: "e7", to: "d6" }] },
      },
      {
        say: "Trading a knight for a bishop, 3 for 3, is an even trade. That's fine, but it doesn't win anything.",
      },
    ],
    k2Tip: "Use fingers: hold up what you give on one hand and what you get on the other. More on the 'get' hand means good trade.",
    activity: {
      title: "Trade Detective",
      minutes: 10,
      setup: "Play a normal game in pairs, with a third kid (or the teacher) as detective if possible.",
      rules: [
        "Whenever a capture happens, both players say the points out loud: 'I gave 3, I got 5.'",
        "The detective writes down each trade as good, bad or even.",
        "After the game, count who made more good trades.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "choice",
        prompt: { text: "You take a rook (5) with your knight (3), and they take your knight back. Good or bad trade?", kid: "Your horse (3) takes a rook (5). They take your horse. Good or bad?" },
        options: [{ pic: "😀", text: "Good" }, { pic: "😟", text: "Bad" }, { pic: "😐", text: "Even" }],
        answer: 0,
      },
      {
        id: "p2",
        kind: "choice",
        prompt: { text: "You take a pawn (1) with your queen (9), and they take your queen. Good or bad?", kid: "Your queen (9) takes a pawn (1). They take your queen. Good or bad?" },
        options: [{ pic: "😀", text: "Good" }, { pic: "😟", text: "Bad" }, { pic: "😐", text: "Even" }],
        answer: 1,
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "You trade a bishop for a knight. Good, bad or even?", kid: "Bishop for horse. Good, bad, or even?" },
        options: [{ pic: "😀", text: "Good" }, { pic: "😟", text: "Bad" }, { pic: "😐", text: "Even" }],
        answer: 2,
      },
      {
        id: "p4",
        kind: "move",
        fen: board({ K: "g1", P: "c4", R: "a1", k: "g8", q: "d5", p: ["e6", "a7"] }),
        goal: "capture",
        answers: ["c4d5"],
        strict: true,
        prompt: { text: "Make the best trade you can.", kid: "Make the best trade!" },
        hint: { text: "A pawn for a queen is a great deal, even if they take back.", kid: "A pawn for a queen is a great deal!" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "choice",
        prompt: { text: "Your rook (5) takes a bishop (3). They take your rook back. What was that?", kid: "Your rook (5) takes a bishop (3). They take your rook. Good or bad?" },
        options: [{ pic: "😀", text: "Good trade" }, { pic: "😟", text: "Bad trade" }, { pic: "😐", text: "Even trade" }],
        answer: 1,
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "Your pawn (1) takes a knight (3). They take your pawn back. What was that?", kid: "Your pawn (1) takes a horse (3). They take your pawn. Good or bad?" },
        options: [{ pic: "😀", text: "Good trade" }, { pic: "😟", text: "Bad trade" }, { pic: "😐", text: "Even trade" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "move",
        fen: board({ K: "g1", N: "e4", Q: "a4", k: "g8", r: "d6", p: ["c7", "a6"] }),
        goal: "capture",
        answers: ["e4d6"],
        strict: true,
        prompt: { text: "Make the best trade you can.", kid: "Make the best trade!" },
      },
    ],
    passMark: 2,
    readingHeavy: "On paper, read each trade question aloud and let kids answer with thumbs up/down. On iPads, easy reading reads the questions and answers out loud.",
    sources: [CFC, HTW],
  },

  {
    id: "s2-notation",
    step: 2,
    title: "Reading and Writing Moves",
    kidTitle: "Square Names",
    goal: "Kids can name any square and read simple moves like Nf3 and Bxc6. (Early readers can stick to square names.)",
    minutes: 15,
    materials: ["One board per pair", "Blank scoresheets (print a lesson worksheet's back, or any lined paper)"],
    script: [
      {
        say: "Every square has a name: its column letter, a to h, and its row number, 1 to 8. White's queen starts on d1.",
        demo: { fen: START_FEN, highlight: ["d1"] },
      },
      {
        say: "Each piece has a letter: K for king, Q for queen, R for rook, B for bishop, and N for knight, because K is already taken. Pawns have no letter.",
      },
      {
        say: "To write a move, put the piece letter, then the square it lands on. The knight going to f3 is written N f 3. A pawn going to e4 is just e4.",
        demo: { fen: START_FEN, arrows: [{ from: "g1", to: "f3" }] },
      },
      {
        say: "An x means capture. Bxc6 means 'the bishop captures on c6'. A plus sign means check.",
      },
    ],
    k2Tip: "Skip piece letters. Play 'Captain Coordinates': call out a square and kids race to put a pawn on it.",
    commonMistakes: ["Writing K for the knight.", "Reading the number first ('4e')."],
    activity: {
      title: "Write-It-Down Game",
      kidTitle: "Captain Coordinates",
      minutes: 10,
      setup: "Pairs, a normal game, and a scoresheet each. Early readers: an empty board and a few pawns.",
      rules: [
        "Play slowly. After every move, both players write it down.",
        "After 10 moves, swap scoresheets and check each other's.",
        "Early readers: one kid calls a square name, the other puts a pawn on it. Swap after five.",
      ],
    },
    practice: [
      { id: "p1", kind: "tap", fen: EMPTY_FEN, prompt: { text: "Tap the square c5.", kid: "Find c5. Letters go along the bottom, numbers go up the side." }, answers: ["c5"], hint: { text: "Column c, then up to row 5.", kid: "Find the letter c at the bottom, then go up to 5." } },
      { id: "p2", kind: "tap", fen: EMPTY_FEN, prompt: { text: "Tap the square g2.", kid: "Find g2." }, answers: ["g2"] },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Which letter stands for the knight?", kid: "Which letter means the horse?" },
        options: [{ text: "K" }, { text: "N" }, { text: "Kn" }],
        answer: 1,
      },
      {
        id: "p4",
        kind: "choice",
        fen: START_FEN,
        prompt: { text: "White moves the knight from g1 to f3. How do we write that?", kid: "The horse jumps to f3. How do we write it?" },
        options: [{ text: "Kf3" }, { text: "Nf3" }, { text: "f3" }],
        answer: 1,
      },
      {
        id: "p5",
        kind: "choice",
        prompt: { text: "What does the x mean in Bxc6?", kid: "What does the x mean?" },
        options: [{ text: "Check" }, { text: "Capture" }, { text: "A mistake" }],
        answer: 1,
      },
    ],
    check: [
      { id: "c1", kind: "tap", fen: EMPTY_FEN, prompt: { text: "Tap the square f6.", kid: "Find f6." }, answers: ["f6"] },
      { id: "c2", kind: "tap", fen: EMPTY_FEN, prompt: { text: "Tap the square b3.", kid: "Find b3." }, answers: ["b3"] },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "How do we write 'the rook captures on d8'?", kid: "How do we write 'the rook takes on d8'?" },
        options: [{ text: "Rd8" }, { text: "Rxd8" }, { text: "d8R" }],
        answer: 1,
      },
      {
        id: "c4",
        kind: "choice",
        prompt: { text: "A pawn moves from e2 to e4. How do we write that?", kid: "A pawn moves to e4. How do we write it?" },
        options: [{ text: "Pe4" }, { text: "e4" }, { text: "e2" }],
        answer: 1,
      },
    ],
    passMark: 3,
    readingHeavy: "Square names and move notation need letters. Play Captain Coordinates out loud with a demo board (kids point, you say the name), skip the written moves, and tick the pass by hand in Wrap-up when they can find squares you call out.",
    sources: [CFC],
  },
];
