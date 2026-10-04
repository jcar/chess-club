// Step 9: Advanced Track. Topic order follows How to Reassess Your Chess
// (imbalances; minor pieces; pawn structure; files; weak squares; space). The
// scripts are written so a coach who doesn't play can read them aloud with the
// demo board. All wording and positions are original.
//
// Judgement questions are "choice" or "tap" with one clear, factual answer.
// Moves are "best" and Stockfish-checked (npm run validate).

import { after, board } from "../authoring";
import type { Lesson } from "../types";

const SIL_IMB = "How to Reassess Your Chess, Part 2 (imbalances)";
const SIL_MINOR = "How to Reassess Your Chess, Parts 4–5 (bishops and knights)";
const SIL_PAWNS = "How to Reassess Your Chess, Parts 8–9 (pawn structure)";
const SIL_FILES = "How to Reassess Your Chess, Part 7 (open files, 7th rank)";
const SIL_SQ = "How to Reassess Your Chess, Part 6 (weak squares)";
const SIL_SPACE = "How to Reassess Your Chess, Part 10 (space)";

const BISHOPS_V_KNIGHTS = board({ K: "g1", B: ["c4", "e3"], P: ["a2", "b2", "c2", "f2", "g2", "h2"], k: "g8", n: ["c6", "f6"], p: ["a7", "b7", "c7", "f7", "g7", "h7"] });
const ROOK_V_MINORS = board({ K: "g1", R: "d1", P: ["a2", "b2", "f2", "g2", "h2"], k: "g8", b: "e6", n: "c6", p: ["a7", "b7", "f7", "g7", "h7"] });
const BEHIND = after("e4 a6 Nf3 h6 Bc4 a5 O-O h5");
const OPEN_C = board({ K: "g1", R: ["a1", "f1"], P: ["a2", "b2", "d4", "e3", "f2", "g2", "h2"], k: "g8", r: ["a8", "f8"], p: ["a7", "b7", "d5", "e6", "f7", "g7", "h7"] });
// Locked center; Black's light bishop is hemmed in by its own pawns.
const LOCKED = board({ K: "g1", N: "d2", P: ["a2", "b2", "c3", "d4", "e5", "f4", "g2", "h2"], k: "g8", b: ["c8", "e7"], p: ["a7", "b7", "c6", "d5", "e6", "f5", "g7", "h7"] });
// d5 is a hole for Black (no c-pawn, and the e-pawn is past it). Nd5 is the only good move.
const OUTPOST = board({ K: "g1", N: "f4", B: "e2", R: "d1", P: ["a2", "b2", "c4", "e4", "f2", "g2", "h2"], k: "g8", b: "e7", r: "d8", n: "f6", p: ["a7", "b7", "d6", "e5", "f7", "g7", "h7"] });
const FRENCH = after("e4 e6 d4 d5 e5");
const FRENCH_2 = after("e4 e6 d4 d5 e5 c5 c3 Nc6 Nf3");
const PASSER = board({ K: "g1", P: ["a2", "b2", "d5", "g2", "h2"], k: "g8", p: ["a7", "b7", "g7", "h7"] });
const SEVENTH = board({ K: "g1", R: ["a1", "d1"], P: ["a2", "b2", "f2", "g2", "h2"], k: "g8", r: ["c8", "f8"], p: ["a7", "b7", "f7", "g7", "h7"] });
const SEVENTH_B = board({ K: "g1", R: ["c1", "f1"], P: ["a2", "b2", "f2", "g2", "h2"], k: "g8", r: ["a8", "d8"], p: ["a7", "b7", "f7", "g7", "h7"] }, "b");
const OPEN_E = board({ K: "g1", R: ["a1", "f1"], P: ["a2", "b2", "c3", "d4", "f2", "g2", "h2"], k: "g8", r: ["a8", "f8"], p: ["a7", "b7", "c6", "d5", "f7", "g7", "h7"] });
const HOLE_B = board({ K: "g1", N: "c3", B: "e2", P: ["a2", "b2", "c2", "e4", "f2", "g2", "h2"], k: "g8", n: "f6", b: "e7", p: ["a7", "b7", "d6", "e5", "f7", "g7", "h7"] });
const HOLE_W = board({ K: "g1", N: "f3", B: "e2", P: ["a2", "b2", "d3", "e4", "f2", "g2", "h2"], k: "g8", n: "c6", b: "e7", p: ["a7", "b7", "c5", "d6", "f7", "g7", "h7"] });
const BIG_CENTER = after("d4 Nf6 c4 g6 Nc3 Bg7 e4 d6 f4");
const CARO = after("e4 c6 d4 d5 e5");
const CARO_2 = after("e4 c6 d4 d5 e5 Bf5 Nf3 e6 Be2");

const file = (f: string) => [1, 2, 3, 4, 5, 6, 7, 8].map((r) => `${f}${r}`);

export const step9: Lesson[] = [
  {
    id: "s9-imbalances",
    step: 9,
    title: "Imbalances: What's Different?",
    kidTitle: "Spot the Difference",
    goal: "Kids can list the differences between the two sides (material, minor pieces, structure, space, development, files, king safety) and use them to choose a plan.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair", "The imbalance list written up for kids to copy"],
    script: [
      {
        say: "Strong players don't just look for moves. They first ask: 'What is different about the two sides?' Those differences are called imbalances, and your plan comes from them.",
      },
      {
        say: "Here's the list. Write it down. One: material, who has more points. Two: minor pieces, bishops or knights. Three: pawn structure, weak or strong pawns. Four: space. Five: development. Six: open files. Seven: king safety.",
        do: "Write the seven imbalances on the board.",
      },
      {
        say: "Look at this position. The pawns are the same and the material is equal. The difference: White has two bishops and Black has two knights. White wants to open the position for the bishops. Black wants to keep it closed.",
        demo: { fen: BISHOPS_V_KNIGHTS, highlight: ["c4", "e3", "c6", "f6"] },
      },
      {
        say: "Here the difference is development. White has castled and brought out two pieces. Black has only moved edge pawns. White should open lines quickly, before Black catches up.",
        demo: { fen: BEHIND },
      },
      {
        say: "From now on, when it's not a tactics moment, go down the list. Find the differences that help you, and make a plan to use them.",
      },
    ],
    k2Tip: "Play 'spot the difference' like the picture puzzles: kids take turns naming one difference between the two sides.",
    commonMistakes: ["Only counting material and missing everything else.", "Seeing an imbalance but making moves that don't use it."],
    activity: {
      title: "Imbalance Hunt",
      kidTitle: "Spot the Difference",
      minutes: 10,
      setup: "In pairs, normal game.",
      rules: [
        "After 12 moves each, stop. Each player writes down as many imbalances as they can find.",
        "Compare lists. One point for each correct imbalance.",
        "Then each player says one plan that uses an imbalance, and keeps playing.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "choice",
        fen: BISHOPS_V_KNIGHTS,
        prompt: { text: "Material and pawns are equal. What is the main imbalance?" },
        options: [{ text: "White has two bishops, Black has two knights" }, { text: "White is a pawn ahead" }, { text: "Black's king is unsafe" }],
        answer: 0,
      },
      {
        id: "p2",
        kind: "choice",
        fen: ROOK_V_MINORS,
        prompt: { text: "Count the material (rook 5, bishop 3, knight 3). Who is ahead?" },
        options: [{ text: "Black, by 1 point" }, { text: "White, by 2 points" }, { text: "It's equal" }],
        answer: 0,
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Which of these is an imbalance?" },
        options: [{ text: "One side has more space" }, { text: "Both sides have a king" }, { text: "It's White's turn" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "choice",
        fen: BEHIND,
        prompt: { text: "What is the biggest imbalance here?" },
        options: [{ text: "White is far ahead in development" }, { text: "Black has more space" }, { text: "White is ahead in material" }],
        answer: 0,
      },
      {
        id: "c2",
        kind: "tap",
        fen: OPEN_C,
        answers: file("c"),
        prompt: { text: "One imbalance is open files. Tap any square on the open file." },
        hint: { text: "An open file has no pawns of either color." },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "You've listed the imbalances. What do you do next?" },
        options: [{ text: "Make a plan that uses the ones that help you" }, { text: "Trade all the pieces" }, { text: "Push all your pawns" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_IMB],
  },

  {
    id: "s9-minors",
    step: 9,
    title: "Bishops vs. Knights",
    kidTitle: "Bishop or Knight?",
    goal: "Kids know when bishops or knights are better, what a 'bad' bishop is, and how to use an outpost.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Bishops and knights are both worth about 3 points, but they're good at different things. Bishops love open positions with long diagonals and pawns on both sides of the board.",
      },
      {
        say: "Knights love closed positions, where pawns are locked together and long lines are blocked. A knight can jump over the traffic jam.",
        demo: { fen: LOCKED, highlight: ["d2"] },
      },
      {
        say: "Look at Black's bishop on c8. Black's pawns are on light squares: d5, e6, f5 and c6. The light-squared bishop is stuck behind them. That's called a bad bishop. The dark-squared bishop on e7 is the good one.",
        demo: { fen: LOCKED, highlight: ["c8", "c6", "d5", "e6", "f5"] },
      },
      {
        say: "Knights need outposts: a square in the enemy half where no enemy pawn can chase them away. Here d5 is perfect. Black has no c-pawn, and the e-pawn has already gone past. A knight on d5 can never be kicked out by a pawn.",
        demo: { fen: OUTPOST, arrows: [{ from: "f4", to: "d5" }], highlight: ["d5"] },
      },
      {
        say: "So: keep bishops if the position is opening up. Keep knights, and find them outposts, if it's closed. And put your pawns on the opposite color from your own bishop.",
      },
    ],
    k2Tip: "Bishops are 'race cars' that need open roads. Knights are 'jumping horses' that don't mind traffic.",
    commonMistakes: ["Trading a good bishop for a knight in an open position.", "Putting all your pawns on the same color as your bishop.", "Putting a knight on a square a pawn can attack next move."],
    activity: {
      title: "Minor Piece Battle",
      kidTitle: "Bishop vs Knight",
      minutes: 10,
      setup: "In pairs. Each side: king, five pawns, and ONE minor piece. White gets a bishop, Black a knight.",
      rules: [
        "Set up the pawns on both wings for an open game. Play it out.",
        "Then set it up with locked pawns in the middle and play again.",
        "Swap colors. Which piece did better in which position?",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "choice",
        fen: LOCKED,
        prompt: { text: "The center is locked. Which minor piece is better here?" },
        options: [{ text: "White's knight" }, { text: "Black's bishop on c8" }],
        answer: 0,
      },
      {
        id: "p2",
        kind: "move",
        fen: OUTPOST,
        goal: "best",
        answers: ["f4d5"],
        prompt: { text: "Your knight is attacked. Put it on the best square: an outpost.", kid: "Jump the horse to the perfect square!" },
        hint: { text: "Find a square in Black's half that no black pawn can attack." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Bishops are usually happiest when the position is…" },
        options: [{ text: "open, with long diagonals" }, { text: "closed, with locked pawns" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "tap",
        fen: LOCKED,
        answers: ["c8"],
        prompt: { text: "Tap Black's bad bishop." },
        hint: { text: "Which bishop is blocked by its own pawns on its color?" },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "What is an outpost?" },
        options: [{ text: "A square no enemy pawn can attack, where your piece is safe" }, { text: "Any square in the center" }, { text: "The square in front of your king" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Your bishop is light-squared. Where should most of your pawns go?" },
        options: [{ text: "On dark squares" }, { text: "On light squares" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_MINOR],
  },

  {
    id: "s9-structure",
    step: 9,
    title: "Pawn Chains and Passed Pawns",
    kidTitle: "Pawn Chains",
    goal: "Kids can find the base of a pawn chain and attack it, and spot and create passed pawns.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "A pawn chain is a diagonal line of pawns, each one protecting the next. Here White's chain is d4 and e5. The front pawn, e5, is protected by d4. But nothing protects d4 with a pawn. The pawn at the back is called the base.",
        demo: { fen: FRENCH, highlight: ["d4", "e5"] },
      },
      {
        say: "The rule: attack a chain at its base. If the base falls, the whole chain is weak. That's why Black plays c5 here, hitting d4.",
        demo: { fen: FRENCH, arrows: [{ from: "c7", to: "c5" }, { from: "c5", to: "d4" }] },
      },
      {
        say: "Then Black piles up on d4 with pieces: the knight from c6 and the queen from b6.",
        demo: { fen: FRENCH_2, arrows: [{ from: "c6", to: "d4" }, { from: "d8", to: "b6" }] },
      },
      {
        say: "A passed pawn has no enemy pawns in front of it or on the files next door. Nothing but pieces can stop it. If you have more pawns on one side of the board, that's a majority, and a majority can make a passed pawn.",
        demo: { fen: PASSER, highlight: ["d5"] },
      },
    ],
    k2Tip: "A pawn chain is a ladder: knock out the bottom rung and the ladder falls.",
    commonMistakes: ["Attacking the front of the chain, where it's strongest.", "Forgetting to push a passed pawn (passed pawns must be pushed!)."],
    activity: {
      title: "Chain Breakers",
      kidTitle: "Chain Breakers",
      minutes: 10,
      setup: "In pairs. Start from the French position (1.e4 e6 2.d4 d5 3.e5).",
      rules: [
        "Black's job: attack the base of the chain (d4) with pawns and pieces.",
        "White's job: keep d4 protected.",
        "Play 10 moves each, then see whether d4 is still standing. Swap colors.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "tap",
        fen: FRENCH,
        answers: ["d4"],
        prompt: { text: "Tap the base of White's pawn chain." },
        hint: { text: "The base is the back pawn of the chain, the one no pawn protects." },
      },
      {
        id: "p2",
        kind: "move",
        fen: FRENCH,
        goal: "best",
        strict: true,
        answers: ["c7c5"],
        orientation: "black",
        prompt: { text: "Black: attack the base of White's chain with a pawn." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "What is a passed pawn?" },
        options: [{ text: "A pawn with no enemy pawns in front of it or on the files next to it" }, { text: "A pawn that has moved past the middle" }, { text: "A pawn that was just captured" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: FRENCH_2,
        goal: "best",
        strict: true,
        answers: ["d8b6"],
        orientation: "black",
        prompt: { text: "Black: add another piece to the attack on d4, the base of the chain." },
        hint: { text: "Which piece can attack d4 from b6?" },
      },
      {
        id: "c2",
        kind: "tap",
        fen: PASSER,
        answers: ["d5"],
        prompt: { text: "Tap White's passed pawn." },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Where should you attack a pawn chain?" },
        options: [{ text: "At its base" }, { text: "At its front" }, { text: "Anywhere" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_PAWNS],
  },

  {
    id: "s9-files",
    step: 9,
    title: "Open Files and the Seventh Rank",
    kidTitle: "Rook Highways",
    goal: "Kids put rooks on open and half-open files and invade the seventh rank.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Rooks need open files: highways with no pawns. A half-open file has only an enemy pawn on it. That's good too, because your rook attacks that pawn.",
        demo: { fen: OPEN_E, highlight: file("e") },
      },
      {
        say: "Once a rook controls an open file, it can drive down it to the seventh rank, the opponent's second row. There it attacks pawns that haven't moved, and it can trap the enemy king on the back row.",
        demo: { fen: SEVENTH, arrows: [{ from: "d1", to: "d7" }], highlight: ["a7", "b7", "f7", "g7", "h7"] },
      },
      {
        say: "Two rooks on the seventh rank are so strong that players call them 'pigs', because they gobble up pawns.",
      },
      {
        say: "To win the fight for a file, double your rooks: put one behind the other on the same file. Then the opponent can't challenge it.",
      },
    ],
    k2Tip: "Open files are highways, and the seventh rank is the 'enemy's backyard'. Rooks drive the highway into the backyard.",
    commonMistakes: ["Leaving rooks on closed files behind their own pawns.", "Going to the seventh rank when the rook can just be trapped or traded off."],
    activity: {
      title: "Highway Race",
      kidTitle: "Highway Race",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "Bonus point for the first rook onto an open file, and two for the first rook onto the seventh rank.",
        "Doubling rooks on a file scores a bonus point too.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: SEVENTH,
        goal: "best",
        strict: true,
        answers: ["d1d7"],
        prompt: { text: "Use the open file to get a rook to the seventh rank." },
        hint: { text: "The d-file is open all the way to d7." },
      },
      {
        id: "p2",
        kind: "choice",
        prompt: { text: "Why is a rook strong on the seventh rank?" },
        options: [{ text: "It attacks pawns that haven't moved and can trap the king" }, { text: "It can promote" }, { text: "It can't be attacked there" }],
        answer: 0,
      },
      {
        id: "p3",
        kind: "tap",
        fen: OPEN_E,
        answers: file("e"),
        prompt: { text: "Tap any square on the open file." },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: SEVENTH_B,
        goal: "best",
        strict: true,
        answers: ["d8d2"],
        orientation: "black",
        prompt: { text: "Black: take your rook down the open file to White's second rank." },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "What is a half-open file?" },
        options: [{ text: "A file with only the opponent's pawn on it" }, { text: "A file with one pawn of each color" }, { text: "A file half the board long" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "What does 'doubling your rooks' mean?" },
        options: [{ text: "Putting both rooks on the same file" }, { text: "Trading a rook for two pieces" }, { text: "Moving a rook twice in a row" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_FILES],
  },

  {
    id: "s9-squares",
    step: 9,
    title: "Weak Squares and Holes",
    kidTitle: "Holes",
    goal: "Kids can find a hole (a square no enemy pawn can attack) and plan to put a piece there.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "A hole is a square that the enemy can never attack with a pawn again. Pawns only move forward, so once the pawns that could guard a square have moved past it, or are gone, that square is weak forever.",
      },
      {
        say: "Here d5 is a hole for Black. There's no black c-pawn, and the e-pawn is already on e5, past d5. A white piece on d5 can only be chased by pieces.",
        demo: { fen: HOLE_B, highlight: ["d5"], arrows: [{ from: "c3", to: "d5" }] },
      },
      {
        say: "The plan writes itself: bring a piece to the hole, usually a knight. A knight on a hole in the enemy camp is like a spy that can't be caught.",
      },
      {
        say: "And for your own pawns: every push leaves squares behind that the pawn can never guard again. Before you push, ask: 'What square am I giving away?'",
      },
    ],
    k2Tip: "A hole is a 'secret base' in the enemy camp. Kids hunt for secret bases and send a knight there.",
    commonMistakes: ["Pushing pawns in front of your king and creating holes.", "Finding a hole but not bringing a piece to it."],
    activity: {
      title: "Secret Base",
      kidTitle: "Secret Base",
      minutes: 10,
      setup: "Normal game in pairs.",
      rules: [
        "When you spot a hole in your opponent's position, say 'Secret base!' and point to it.",
        "Getting a piece onto it scores two bonus points.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "tap",
        fen: HOLE_B,
        answers: ["d5"],
        prompt: { text: "Tap the hole in Black's position, in the center." },
        hint: { text: "Which central square can no black pawn ever attack?" },
      },
      {
        id: "p2",
        kind: "choice",
        prompt: { text: "What is a hole?" },
        options: [{ text: "A square no enemy pawn can ever attack" }, { text: "An empty square" }, { text: "A square next to the king" }],
        answer: 0,
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "Which piece loves a hole in the enemy camp most?" },
        options: [{ text: "A knight" }, { text: "The king" }, { text: "A pawn" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "tap",
        fen: HOLE_W,
        answers: ["d4"],
        prompt: { text: "Tap the hole in White's position, in the center." },
        hint: { text: "White has no c-pawn, and the e-pawn is already on e4." },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "Why should you think before pushing a pawn?" },
        options: [{ text: "It can never come back to guard the squares it leaves" }, { text: "Pawns can only move once" }, { text: "Pushing pawns is slow" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "choice",
        fen: HOLE_B,
        prompt: { text: "White's best plan here is to…" },
        options: [{ text: "Bring a knight to d5" }, { text: "Push the h-pawn" }, { text: "Trade all the pieces" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_SQ],
  },

  {
    id: "s9-space",
    step: 9,
    title: "Space and Pawn Breaks",
    kidTitle: "Room to Move",
    goal: "Kids can tell who has more space, and know the cramped side should trade pieces and play pawn breaks.",
    minutes: 20,
    materials: ["Demo board", "One board and set per pair"],
    script: [
      {
        say: "Space is how much of the board your pawns control. Count how far forward your pawns are. More space means your pieces have more room to move, and the opponent's pieces get in each other's way.",
        demo: { fen: BIG_CENTER, highlight: ["c4", "d4", "e4", "f4"] },
      },
      {
        say: "If you have more space, don't trade pieces. Every trade gives the cramped side more room. Keep them squeezed.",
      },
      {
        say: "If you're cramped, do the opposite: trade pieces, and play a pawn break. A pawn break is a pawn move that hits the enemy pawns to open lines. In this position Black first develops the bishop to f5, outside the pawns, and then breaks with c5.",
        demo: { fen: CARO, orientation: "black", arrows: [{ from: "c8", to: "f5" }, { from: "c6", to: "c5" }] },
      },
      {
        say: "So when you look at the imbalances, ask about space. If you have more, squeeze. If you have less, trade and break.",
      },
    ],
    k2Tip: "A cramped position is a crowded elevator. Get some people out (trade pieces) or open the doors (pawn break).",
    commonMistakes: ["Trading pieces when you have more space.", "Staying cramped and passive instead of playing a pawn break."],
    activity: {
      title: "Squeeze or Break",
      kidTitle: "Squeeze or Break",
      minutes: 10,
      setup: "In pairs, normal game.",
      rules: [
        "After 10 moves each, stop and decide together who has more space.",
        "The side with more space says one way to squeeze. The other side names a pawn break.",
        "Keep playing and try your plans.",
      ],
    },
    practice: [
      {
        id: "p1",
        kind: "choice",
        fen: BIG_CENTER,
        prompt: { text: "Who has more space?" },
        options: [{ text: "White" }, { text: "Black" }, { text: "It's equal" }],
        answer: 0,
      },
      {
        id: "p2",
        kind: "move",
        fen: CARO,
        goal: "best",
        strict: true,
        answers: ["c8f5"],
        orientation: "black",
        prompt: { text: "Black: get your light-squared bishop outside the pawn chain before you play e6." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "You have less space. What usually helps?" },
        options: [{ text: "Trading pieces" }, { text: "Avoiding all trades" }, { text: "Moving your king forward" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: CARO_2,
        goal: "best",
        strict: true,
        answers: ["c6c5"],
        orientation: "black",
        prompt: { text: "Black: play the pawn break that attacks the base of White's chain." },
        hint: { text: "The base of White's chain (d4, e5) is d4." },
      },
      {
        id: "c2",
        kind: "choice",
        prompt: { text: "You have more space. Should you trade pieces?" },
        options: [{ text: "Usually not: keep the opponent squeezed" }, { text: "Yes, trade everything" }],
        answer: 0,
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "What is a pawn break?" },
        options: [{ text: "A pawn move that attacks enemy pawns to open lines" }, { text: "A pawn that is captured" }, { text: "Taking a break from moving pawns" }],
        answer: 0,
      },
    ],
    passMark: 2,
    sources: [SIL_SPACE],
  },
];
