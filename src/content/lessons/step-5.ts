// Step 5: Finish the Game. Order follows Chess for Children, Part 4
// ("Winning Your First Games": mate with two rooks, queen, queen and rook) and
// How to Win at Chess, ch. 4–5 (ladder mate, king and queen, king and rook).
// All wording here is original.

import { board } from "../authoring";
import type { Lesson } from "../types";

const CFC = "Chess for Children, Part 4 (winning your first games)";
const HTW4 = "How to Win at Chess, ch. 4 (ladder, king-and-queen and king-and-rook mates)";
const HTW5 = "How to Win at Chess, ch. 5 (checkmating with pieces working together)";

export const step5: Lesson[] = [
  {
    id: "s5-ladder",
    step: 5,
    title: "The Ladder Mate",
    kidTitle: "Climb the Ladder",
    goal: "Kids can checkmate a lone king with two rooks (or a queen and rook) by taking turns, like climbing a ladder.",
    minutes: 15,
    materials: ["One board per pair", "Two rooks and two kings per pair"],
    script: [
      {
        say: "When you have two rooks and your opponent has only a king, you can win without even using your king. It's called the ladder mate.",
        demo: { fen: board({ K: "a1", R: ["a4", "b3"], k: "e5" }) },
      },
      {
        say: "One rook makes a wall the king can't cross. The other rook gives check on the next row, pushing the king back one step.",
        demo: { fen: board({ K: "a1", R: ["a4", "b5"], k: "e5" }), arrows: [{ from: "b5", to: "e5" }], highlight: ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"] },
      },
      {
        say: "Now the rooks take turns: the back rook jumps ahead and gives check, then the other one does. Step, step, step, like climbing a ladder, until the king is on the edge.",
        demo: { fen: board({ K: "a1", R: ["a6", "b5"], k: "e7" }), arrows: [{ from: "b5", to: "b7" }] },
      },
      {
        say: "On the edge, one rook guards the second-to-last row and the other checks on the last row. Checkmate!",
        demo: { fen: board({ K: "a1", R: ["a7", "h8"], k: "e8" }), arrows: [{ from: "h8", to: "e8" }] },
      },
      {
        say: "One danger: if the king walks up next to a rook, move that rook far away along its row, to the other side of the board. Then keep climbing.",
        do: "Show a rook being attacked by the king and sliding to the far end.",
      },
    ],
    k2Tip: "Climb it together: say 'wall... check... wall... check...' as the rooks take turns.",
    commonMistakes: ["Letting the king capture a rook.", "Moving the wall rook, so the king escapes back."],
    activity: {
      title: "Two Rooks vs. King",
      kidTitle: "Climb the Ladder",
      minutes: 10,
      setup: "White: king a1, rooks a4 and b3. Black: king e5.",
      rules: [
        "White tries to checkmate using the ladder.",
        "Black moves the king and tries to catch a rook.",
        "If White gets checkmate in 15 moves or fewer, White wins. Otherwise, Black wins.",
        "Swap roles each game.",
      ],
      fen: board({ K: "a1", R: ["a4", "b3"], k: "e5" }),
      game: { win: "mate", youPlay: "white" },
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "a1", R: ["a7", "h1"], k: "e8" }),
        goal: "mate",
        answers: ["h1h8"],
        prompt: { text: "Finish the ladder: checkmate in one.", kid: "Top of the ladder. Checkmate!" },
        hint: { text: "One rook already guards the 7th row." },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "a8", R: ["g1", "a2"], k: "h5" }),
        goal: "mate",
        answers: ["a2h2"],
        prompt: { text: "The ladder works sideways too. Checkmate in one.", kid: "Checkmate on the side!" },
        hint: { text: "The g1 rook is the wall." },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "In the ladder mate, what does the rook that isn't giving check do?" },
        options: [{ text: "It makes a wall the king can't cross" }, { text: "It chases the king" }, { text: "It rests" }],
        answer: 0,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "h1", R: ["b8", "h2"], k: "a4" }),
        goal: "mate",
        answers: ["h2a2"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "g1", R: ["a7", "b1"], k: "h8" }),
        goal: "mate",
        answers: ["b1b8"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "The lone king walks up next to one of your rooks. What should you do?" },
        options: [{ text: "Leave it, the king can't capture" }, { text: "Move that rook far away along its row" }, { text: "Give up the rook" }],
        answer: 1,
      },
    ],
    passMark: 2,
    sources: [CFC, HTW4],
  },

  {
    id: "s5-king-queen",
    step: 5,
    title: "King and Queen Checkmate",
    kidTitle: "Queen Makes a Box",
    goal: "Kids can checkmate with king and queen against a lone king without stalemating.",
    minutes: 20,
    materials: ["One board per pair", "A queen and two kings per pair"],
    script: [
      {
        say: "With only a queen and king, the ladder doesn't work: you need your king to help. First, use the queen to build a box around the enemy king.",
        demo: { fen: board({ K: "e1", Q: "c3", k: "e5" }), highlight: ["d4", "d5", "d6", "e4", "f4", "g4", "h4"] },
      },
      {
        say: "A handy trick: put the queen a knight's move away from the king. The box gets smaller and the king isn't in check.",
        demo: { fen: board({ K: "e1", Q: "d3", k: "e5" }), highlight: ["d3", "e5"] },
      },
      {
        say: "Keep shrinking the box until the king is stuck on the edge. Then stop! Walk your own king over to help.",
        demo: { fen: board({ K: "e1", Q: "b7", k: "g8" }), arrows: [{ from: "e1", to: "f6" }] },
      },
      {
        say: "When your king is close, give checkmate: the queen checks on the edge, protected by your king or covering every escape.",
        demo: { fen: board({ K: "g6", Q: "f8", k: "h8" }), highlight: ["g6"] },
      },
      {
        say: "The trap: every time you move the queen, ask 'does the king still have a move?' If not, and it's not check, that's stalemate, a draw!",
        demo: { fen: board({ K: "g6", Q: "f7", k: "h8" }, "b"), highlight: ["h8"] },
      },
    ],
    k2Tip: "Make the box with a rubber band or string on a real board, and make it smaller each move.",
    commonMistakes: ["Checking over and over with the queen alone (the king just walks away).", "Stalemating by taking away the last square.", "Putting the queen next to the king without protection."],
    activity: {
      title: "King and Queen vs. King",
      kidTitle: "Queen Makes a Box",
      minutes: 15,
      setup: "White: king e1, queen d1. Black: king e5.",
      rules: [
        "White tries to checkmate. Black tries to survive.",
        "Stalemate is only a draw, not a win. Try again and checkmate!",
        "Can White checkmate in 20 moves or fewer?",
        "Swap roles each game.",
      ],
      fen: board({ K: "e1", Q: "d1", k: "e5" }),
      game: { win: "mate", youPlay: "white" },
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "g6", Q: "f2", k: "h8" }),
        goal: "mate",
        answers: ["f2f8"],
        prompt: { text: "Checkmate in one. Careful: one queen move is stalemate!", kid: "Checkmate, but don't get stuck!" },
        hint: { text: "Check on the back row." },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "e6", Q: "h4", k: "e8" }),
        goal: "mate",
        answers: ["h4e7", "h4h8"],
        prompt: { text: "Checkmate in one. There are two ways!", kid: "Checkmate!" },
      },
      {
        id: "p3",
        kind: "choice",
        fen: board({ K: "g6", Q: "f2", k: "h8" }),
        prompt: { text: "White to move. Which queen move is stalemate?" },
        options: [{ text: "Qf8" }, { text: "Qf7" }, { text: "Qh2" }],
        answer: 1,
        hint: { text: "Which move leaves the black king with no moves but not in check?" },
      },
      {
        id: "p4",
        kind: "choice",
        prompt: { text: "Can a queen checkmate a lone king without help from her own king?" },
        options: [{ text: "Yes, easily" }, { text: "No, the king has to help" }],
        answer: 1,
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "f3", Q: "b2", k: "h1" }),
        goal: "mate",
        answers: ["b2g2"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "c3", Q: "e2", k: "a1" }),
        goal: "mate",
        answers: ["e2b2"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "Where is a good spot for the queen when you're building the box?" },
        options: [{ text: "Right next to the enemy king" }, { text: "A knight's move away from the enemy king" }, { text: "In a corner" }],
        answer: 1,
      },
    ],
    passMark: 2,
    sources: [CFC, HTW4],
  },

  {
    id: "s5-king-rook",
    step: 5,
    title: "King and Rook Checkmate",
    kidTitle: "Rook and King Team Up",
    goal: "Kids can checkmate with king and rook: cut the king off, bring your king, and check when the kings face each other.",
    minutes: 20,
    materials: ["One board per pair", "A rook and two kings per pair"],
    script: [
      {
        say: "King and rook can checkmate too, but it takes teamwork. Step one: use the rook to make a wall that cuts the enemy king off.",
        demo: { fen: board({ K: "e1", R: "a4", k: "e6" }), highlight: ["a4", "b4", "c4", "d4", "e4", "f4", "g4", "h4"] },
      },
      {
        say: "Step two: walk your king up toward the enemy king, staying behind the wall.",
        demo: { fen: board({ K: "e3", R: "a4", k: "e6" }), arrows: [{ from: "e3", to: "e5" }] },
      },
      {
        say: "Step three, the key idea: when the two kings stand face to face, with one square between them, check with the rook. The enemy king has to step back one row.",
        demo: { fen: board({ K: "e5", R: "h4", k: "e7" }), arrows: [{ from: "h4", to: "h7" }] },
      },
      {
        say: "If the kings aren't facing each other, make a quiet rook move along the wall, a waiting move, and let the enemy king walk into position.",
      },
      {
        say: "Keep going until the enemy king is on the edge. When the kings face each other there, check on the edge. Checkmate!",
        demo: { fen: board({ K: "e6", R: "a8", k: "e8" }), arrows: [{ from: "a8", to: "e8" }] },
      },
    ],
    k2Tip: "This one is hard for K–2. Let them try the rook-and-king checkmates in one, and save the full method for older kids.",
    commonMistakes: ["Checking when the kings aren't facing each other (the king just steps sideways).", "Leaving the rook where the enemy king can take it.", "Stalemate in the corner."],
    activity: {
      title: "King and Rook vs. King",
      kidTitle: "Rook and King Team Up",
      minutes: 15,
      setup: "White: king e1, rook a1. Black: king e5.",
      rules: [
        "White tries to checkmate. Black tries to survive or capture the rook.",
        "Stalemate is only a draw, not a win. Try again and checkmate!",
        "This takes practice! Count your moves and try to beat your record.",
        "Swap roles each game.",
      ],
      fen: board({ K: "e1", R: "a1", k: "e5" }),
      game: { win: "mate", youPlay: "white" },
    },
    practice: [
      {
        id: "p1",
        kind: "move",
        fen: board({ K: "e6", R: "a1", k: "e8" }),
        goal: "mate",
        answers: ["a1a8"],
        prompt: { text: "The kings are face to face. Checkmate in one.", kid: "Checkmate with the rook!" },
      },
      {
        id: "p2",
        kind: "move",
        fen: board({ K: "f4", R: "a1", k: "h4" }),
        goal: "mate",
        answers: ["a1h1"],
        prompt: { text: "Checkmate in one on the side of the board.", kid: "Checkmate!" },
      },
      {
        id: "p3",
        kind: "choice",
        prompt: { text: "When is the best time to check with the rook?" },
        options: [{ text: "Whenever you can" }, { text: "When the two kings face each other" }, { text: "Never" }],
        answer: 1,
      },
      {
        id: "p4",
        kind: "move",
        fen: board({ K: "b3", R: "h8", k: "a1" }),
        goal: "mate",
        answers: ["h8h1"],
        prompt: { text: "Checkmate the king in the corner.", kid: "Checkmate in the corner!" },
      },
    ],
    check: [
      {
        id: "c1",
        kind: "move",
        fen: board({ K: "d6", R: "h7", k: "d8" }),
        goal: "mate",
        answers: ["h7h8"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c2",
        kind: "move",
        fen: board({ K: "f3", R: "a2", k: "f1" }),
        goal: "mate",
        answers: ["a2a1"],
        prompt: { text: "Checkmate in one.", kid: "Checkmate!" },
      },
      {
        id: "c3",
        kind: "choice",
        prompt: { text: "The kings aren't facing each other yet. What should you do?" },
        options: [{ text: "Check with the rook anyway" }, { text: "Make a waiting move with the rook along its wall" }, { text: "Move the rook next to the enemy king" }],
        answer: 1,
      },
    ],
    passMark: 2,
    sources: [CFC, HTW4, HTW5],
  },
];
