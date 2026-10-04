// Five-minute whole-group warm-ups: get the wiggles out and review a move or
// an idea before the lesson. They work for any age; `older` is a harder
// version for kids who already know the pieces. All original.

export interface Warmup {
  id: string;
  title: string;
  /** Short name kids hear. */
  kidTitle?: string;
  minutes: number;
  /** What it practises, for the planner. */
  focus: string;
  materials: string[];
  /** What the adult says/does, step by step. */
  steps: string[];
  older?: string;
}

export const WARMUPS: Warmup[] = [
  {
    id: "statues",
    title: "Piece Statues",
    minutes: 5,
    focus: "How each piece moves",
    materials: ["None"],
    steps: [
      "Everyone stands up with room to move.",
      "Call out a piece. Kids freeze in its shape: rook = arms straight up, bishop = arms in an X, queen = arms up AND an X, king = hands on head like a crown, knight = one hand like a horse head, pawn = small and crouched.",
      "Then call 'Move!' and kids take one step the way that piece moves: straight, slanty, any way, one small step, an L-hop, or one step forward.",
      "Speed up. Call two pieces in a row.",
    ],
    older: "Call a square instead ('knight to f3!') and kids point which way their piece would go.",
  },
  {
    id: "knight-hopscotch",
    title: "Knight Hopscotch",
    minutes: 5,
    focus: "The knight's L-shaped jump",
    materials: ["Masking tape: a 4×4 grid of big squares on the floor (or chalk outside)"],
    steps: [
      "Kids line up at one corner of the tape grid.",
      "Each kid hops the knight's L: two squares straight, then one to the side. Everyone counts out loud: 'One, two, turn!'",
      "Put a beanbag (or shoe) on a square. Can they hop to it in two jumps?",
    ],
    older: "Find a square the knight can't reach in two jumps from the corner.",
  },
  {
    id: "simon-squares",
    title: "Simon Says Squares",
    minutes: 5,
    focus: "The board: rows, columns, diagonals, light and dark",
    materials: ["One board per pair"],
    steps: [
      "Kids sit at their boards.",
      "'Simon says touch a light square.' 'Simon says trace a straight line up the board.' 'Simon says trace a slanty line.'",
      "Leave out 'Simon says' now and then. Anyone who moves sits for one turn.",
    ],
    older: "Use square names: 'Simon says touch e4.'",
  },
  {
    id: "mystery-piece",
    title: "Mystery Piece",
    minutes: 5,
    focus: "Piece names and values",
    materials: ["A cloth bag or sock", "One set of pieces"],
    steps: [
      "Put one piece in the bag without anyone seeing.",
      "A kid reaches in, feels it without looking, and guesses. Everyone helps with clues: 'Does it have a crown? A horse head?'",
      "When it comes out, everyone shows how it moves with their arms.",
    ],
    older: "Before pulling it out, the kid says how many points it's worth.",
  },
  {
    id: "pawn-line",
    title: "Pawn Line Race",
    minutes: 5,
    focus: "Pawns move forward and capture diagonally",
    materials: ["None (a hallway or open floor)"],
    steps: [
      "Two lines of kids face each other across the room: they are pawns.",
      "On 'Go', each pawn takes one step forward. On their first move they may take two steps.",
      "If two pawns end up face to face, they're stuck! A pawn can only 'capture' by stepping diagonally next to someone.",
      "First pawn to reach the far wall becomes a queen and does a twirl.",
    ],
  },
  {
    id: "cca-freeze",
    title: "CCA Freeze",
    minutes: 5,
    focus: "The Checks, Captures, Attacks habit",
    materials: ["Demo board or projector"],
    steps: [
      "Show a position. Everyone stands.",
      "Call 'Checks!': kids point to a piece that could give check, or shrug if none. 'Captures!': point to a capture. 'Attacks!': point to an attack.",
      "Anyone who points to a good one gets to sit down first.",
    ],
    older: "Do it for the opponent's side too.",
  },
  {
    id: "setup-race",
    title: "Setup Race",
    minutes: 5,
    focus: "Setting up the board",
    materials: ["One board and set per pair"],
    steps: [
      "Pieces start in a pile beside the board.",
      "On 'Go', partners set up the board together. Sing it: 'Light on the right, queen on her color, tower, horse, bishop, queen, king…'",
      "First pair to finish (correctly!) raises hands. An adult checks the queens and the light corner.",
    ],
    older: "Race solo, then check your partner's board for mistakes.",
  },
  {
    id: "king-tag",
    title: "King Tag",
    minutes: 5,
    focus: "The king moves one step; kings can't stand next to each other",
    materials: ["Masking tape grid, or a carpet with squares"],
    steps: [
      "Two kids are kings on the floor grid. Everyone else watches and counts.",
      "Kings take turns stepping one square in any direction.",
      "The rule: kings can never stand right next to each other. Kids shout 'Too close!' if they do.",
      "Swap in new kings every minute.",
    ],
    older: "Add a 'pawn' kid who walks forward; can a king catch it before it reaches the wall?",
  },
  {
    id: "check-or-not",
    title: "Check or Not?",
    minutes: 5,
    focus: "Seeing check",
    materials: ["Demo board or projector"],
    steps: [
      "Show a position with a king in it.",
      "Kids stand up if the king is in check, and sit down if it's safe.",
      "Ask one kid to show which piece gives the check.",
    ],
    older: "Then ask: what are the three ways out of this check?",
  },
  {
    id: "point-count",
    title: "Point Count",
    minutes: 5,
    focus: "Piece values",
    materials: ["None"],
    steps: [
      "Teach the hand signals: pawn = 1 finger, knight and bishop = 3, rook = 5, queen = 9 (two hands), king = hands on head (priceless!).",
      "Call a piece. Kids hold up its points.",
      "Then add: 'A rook and a pawn!' (6). 'Two knights!' (6).",
    ],
    older: "Call a trade: 'My knight for your rook: good or bad?' Thumbs up or down.",
  },
  {
    id: "mirror",
    title: "Mirror Moves",
    minutes: 5,
    focus: "Moving pieces correctly, taking turns",
    materials: ["One board and set per pair"],
    steps: [
      "Partners set up only kings and pawns.",
      "One kid makes a move. The partner must copy it exactly, like a mirror.",
      "After five moves each, swap who leads.",
    ],
  },
  {
    id: "freeze-dance",
    title: "Freeze-Dance Board",
    minutes: 5,
    focus: "Light and dark squares, energy release",
    materials: ["Music", "Tape grid or a checkered rug (optional)"],
    steps: [
      "Play music. Kids dance.",
      "Stop the music and call 'Light!' or 'Dark!'. Kids freeze on (or point to) a square of that color.",
      "Then call a piece: everyone freezes in its statue shape.",
    ],
  },
];

export function getWarmup(id: string | undefined): Warmup | undefined {
  return WARMUPS.find((w) => w.id === id);
}
