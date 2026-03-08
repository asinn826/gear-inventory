// Order matters: more specific patterns must come before general ones
const GEAR_EMOJI_MAP: Array<[RegExp, string]> = [

  // ── Holiday: Halloween (before any generic pattern) ──────────────
  [/cobweb|spider/i, '🕷️'],
  [/trick.?or.?treat/i, '🎃'],
  [/halloween|pumpkin/i, '🎃'],

  // ── Holiday: Christmas (before mug/cup/bag etc.) ─────────────────
  [/xmas|christmas|santa|\belf\b/i, '🎄'],
  [/snowflake/i, '❄️'],

  // ── Seasonal ─────────────────────────────────────────────────────
  [/autumn|wreath|garland/i, '🍂'],

  // ── Coffee & hot drinks ──────────────────────────────────────────
  [/v60|dripper|pour.?over|chemex|aeropress/i, '☕'],
  [/cold.?brew|carafe/i, '☕'],
  [/coffee|espresso|latte|cappuccino/i, '☕'],
  [/tea(?!\s*cup|pot)/i, '🍵'],   // "tea" but not "teacup/teapot" (those stay as ☕/🥤)
  [/moscow.?mule/i, '🍺'],        // before "mug"
  [/thermos|mug|tumbler/i, '☕'],

  // ── Drinkware ────────────────────────────────────────────────────
  [/wine/i, '🍷'],
  [/blender|shaker/i, '🥤'],
  [/glass|cup(?!board)/i, '🥤'],

  // ── Water containers (specific first) ───────────────────────────
  [/hydro.?flask|nalgene/i, '💧'],
  [/water.?bottle|water.?jug|water.?sack|water.?reservoir/i, '💧'],
  [/bottle|flask/i, '💧'],

  // ── Shelter ──────────────────────────────────────────────────────
  [/tent|shelter/i, '⛺'],
  [/tarp/i, '⛺'],
  [/hammock/i, '🌿'],

  // ── Sleep ────────────────────────────────────────────────────────
  [/sleeping.?bag|bivy/i, '🛏️'],
  [/sleeping.?pad|sleep/i, '🛏️'],
  [/pillow/i, '😴'],

  // ── Bags (specific before general) ──────────────────────────────
  [/kill.?bag/i, '🎣'],
  [/ski.?bag|gear.?bag/i, '🎿'],
  [/cooler.?bag/i, '🧊'],
  [/dry.?bag/i, '💧'],
  [/gift.*bag|treat.*bag|paper.*bag/i, '🎁'],
  [/backpack|daypack/i, '🎒'],
  [/pack(?!age)/i, '🎒'],
  [/duffel/i, '🎒'],

  // ── Camp kitchen: utensils ───────────────────────────────────────
  [/chopstick/i, '🥢'],
  [/spork|utensil/i, '🍴'],
  [/bowl/i, '🥣'],
  [/plate(?!au)/i, '🍽️'],
  [/cutting.?board/i, '🍽️'],
  [/oven.?mitt/i, '🧤'],

  // ── Camp kitchen: heat & cookware ───────────────────────────────
  [/stove|burner/i, '🍳'],
  [/cook(?!ie)|pot(?!tery)|pan(?!ts)/i, '🍳'],

  // ── Fire & fuel ──────────────────────────────────────────────────
  [/fuel|propane|isobutane|butane/i, '🔥'],
  [/lighter|flame|roast/i, '🔥'],

  // ── Fishing & water sports ───────────────────────────────────────
  [/crab/i, '🦀'],
  [/fishing|salmon|\bfish\b/i, '🎣'],
  [/wader/i, '🎣'],
  [/net(?!work)/i, '🎣'],
  [/kayak|canoe/i, '🛶'],
  [/paddleboard/i, '🏄'],
  [/life.?jacket|life.?vest/i, '🛟'],

  // ── Storage & containers ─────────────────────────────────────────
  [/cooler/i, '🧊'],
  [/bucket/i, '🪣'],
  [/basin|wash\b/i, '🪣'],

  // ── Clothing & footwear (specific first) ─────────────────────────
  [/goggle/i, '🥽'],
  [/ski.?glove/i, '🧤'],
  [/glove|mitten/i, '🧤'],
  [/life.?jacket/i, '🛟'],        // belt-and-suspenders for jacket → not 🧥
  [/ski.?bib|ski.?pant|ski.?jacket/i, '🎿'],
  [/ski|snowboard/i, '🎿'],
  [/jacket|coat|shell|rain|wind|fleece/i, '🧥'],
  [/boot|shoe|sandal/i, '👟'],
  [/\bsock/i, '🧦'],
  [/headband/i, '💆'],
  [/hat|cap|beanie|helmet/i, '🧢'],

  // ── Lighting & navigation ────────────────────────────────────────
  [/headlamp|lantern|torch/i, '🔦'],
  [/\blight(?!er)/i, '🔦'],       // "light" but not "lighter"
  [/map|compass|gps|navigation/i, '🧭'],

  // ── Safety ───────────────────────────────────────────────────────
  [/emergency.?blanket|hi.?viz/i, '🚨'],
  [/first.?aid|medical/i, '🩹'],
  [/hand.?warmer/i, '🤲'],
  [/wipes?/i, '🧻'],

  // ── Pests & candles ──────────────────────────────────────────────
  [/citronella/i, '🦟'],
  [/insect|mosquito/i, '🦟'],
  [/candle/i, '🕯️'],

  // ── Security ─────────────────────────────────────────────────────
  [/lock|deadbolt/i, '🔐'],

  // ── Outdoor furniture ────────────────────────────────────────────
  [/chair/i, '🪑'],
  [/hiking.?pole|trekking.?pole/i, '🥾'],

  // ── Climbing & cordage ───────────────────────────────────────────
  [/rope|sling|anchor|belay|harness|carabiner|climb/i, '🧗'],
  [/bungee|bungie|cord/i, '🔗'],

  // ── Tools ────────────────────────────────────────────────────────
  [/knife|blade|axe|hatchet|saw|machete/i, '🔪'],

  // ── Vehicle / home ───────────────────────────────────────────────
  [/jeep|floor.?mat/i, '🚗'],

  // ── Garden ───────────────────────────────────────────────────────
  [/plant|garden|tomato/i, '🌱'],

  // ── Games ────────────────────────────────────────────────────────
  [/jenga|\bgame\b/i, '🎲'],

  // ── Gifts & wrapping ─────────────────────────────────────────────
  [/wrapping|present|gift.?box/i, '🎁'],
  [/cookie.?tin|cookie.?cutter|gingerbread/i, '🍪'],
  [/\bcookie/i, '🍪'],
  [/cupcake/i, '🧁'],
  [/candy|mold(?!ing)/i, '🍬'],

  // ── Beach ────────────────────────────────────────────────────────
  [/beach.?ball/i, '🏐'],
  [/beach/i, '🏖️'],
  [/towel/i, '🏖️'],

  // ── General bag fallback ─────────────────────────────────────────
  [/bag/i, '🎒'],

  // ── Bear ─────────────────────────────────────────────────────────
  [/bear/i, '🐻'],

  // ── Water (general fallback) ─────────────────────────────────────
  [/water/i, '💧'],

  // ── Electronics ──────────────────────────────────────────────────
  [/phone|radio|satellite/i, '📡'],
  [/camera|photo/i, '📷'],
  [/sunscreen|sunglasses/i, '🕶️'],
  [/bike|bicycle|cycle/i, '🚴'],
];

export function getGearEmoji(name: string): string {
  for (const [pattern, emoji] of GEAR_EMOJI_MAP) {
    if (pattern.test(name)) return emoji;
  }
  return '🎒';
}
