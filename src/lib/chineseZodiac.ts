/**
 * Chinese Zodiac utility — purely visual, NOT passed to AI functions.
 */

export interface ChineseZodiac {
  animal: string;
  emoji: string;
}

const animals: ChineseZodiac[] = [
  { animal: "Rat", emoji: "🐀" },
  { animal: "Ox", emoji: "🐂" },
  { animal: "Tiger", emoji: "🐅" },
  { animal: "Rabbit", emoji: "🐇" },
  { animal: "Dragon", emoji: "🐉" },
  { animal: "Snake", emoji: "🐍" },
  { animal: "Horse", emoji: "🐴" },
  { animal: "Goat", emoji: "🐐" },
  { animal: "Monkey", emoji: "🐒" },
  { animal: "Rooster", emoji: "🐓" },
  { animal: "Dog", emoji: "🐕" },
  { animal: "Pig", emoji: "🐖" },
];

/**
 * Get Chinese Zodiac animal from a birth year or YYYY-MM-DD date string.
 */
export function getChineseZodiac(dateOrYear: string | number): ChineseZodiac {
  const year = typeof dateOrYear === "number"
    ? dateOrYear
    : new Date(dateOrYear + (String(dateOrYear).length === 4 ? "-06-15" : "")).getFullYear();
  // Rat cycle reference: 2020 is Year of the Rat
  const index = ((year - 2020) % 12 + 12) % 12;
  return animals[index];
}
