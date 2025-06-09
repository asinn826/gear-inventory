// A set of visually distinct and high-contrast colors that work well on white background
const TAG_COLORS = [
  'red.600', 'orange.600', 'yellow.600', 'green.600', 'teal.600',
  'blue.600', 'cyan.600', 'purple.600', 'pink.600', 'gray.700',
  'red.700', 'orange.700', 'yellow.700', 'green.700', 'teal.700',
  'blue.700', 'purple.700', 'pink.700', 'cyan.700', 'gray.800'
];

// Simple hash function to convert a string to a number
const stringToHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

export const getTagColor = (tag: string): string => {
  const hash = stringToHash(tag);
  const index = hash % TAG_COLORS.length;
  return TAG_COLORS[index];
};

export const getTagColorScheme = (tag: string): string => {
  const color = getTagColor(tag);
  // If the color includes a dot (like 'yellow.400'), return the base color
  const baseColor = color.split('.')[0];
  return baseColor as string;
};
