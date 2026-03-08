const GEAR_EMOJI_MAP: Array<[RegExp, string]> = [
  [/tent|shelter|tarp/i, '⛺'],
  [/sleeping bag|sleep|bivy/i, '🛏️'],
  [/backpack|pack|bag|duffel/i, '🎒'],
  [/water bottle|hydration|bottle|flask|filter/i, '💧'],
  [/stove|cook|pot|pan|fuel|burner/i, '🍳'],
  [/headlamp|lamp|lantern|torch|light/i, '🔦'],
  [/rope|cord|sling|anchor|belay|harness|carabiner|climb/i, '🧗'],
  [/knife|blade|axe|hatchet|saw|machete/i, '🔪'],
  [/map|compass|gps|navigation|navigate/i, '🧭'],
  [/boot|shoe|sandal|footwear|sock/i, '👟'],
  [/jacket|coat|shell|rain|wind|down|fleece|insulation/i, '🧥'],
  [/glove|mitten/i, '🧤'],
  [/hat|cap|beanie|helmet/i, '🧢'],
  [/first.?aid|medical|emergency|kit/i, '🩹'],
  [/camera|photo/i, '📷'],
  [/phone|radio|satellite|communication/i, '📡'],
  [/towel/i, '🏖️'],
  [/sunscreen|sunglasses|sun/i, '🕶️'],
  [/trekking|pole|stick/i, '🥢'],
  [/bike|bicycle|cycle/i, '🚴'],
  [/kayak|paddle|canoe|boat/i, '🛶'],
  [/ski|snowboard|snow/i, '🎿'],
  [/hammock/i, '🌿'],
  [/insect|bug|mosquito/i, '🦟'],
  [/bear|wildlife/i, '🐻'],
];

export function getGearEmoji(name: string): string {
  for (const [pattern, emoji] of GEAR_EMOJI_MAP) {
    if (pattern.test(name)) return emoji;
  }
  return '🎒';
}
