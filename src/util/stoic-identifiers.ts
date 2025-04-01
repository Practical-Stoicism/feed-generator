/**
 * ===== STOIC FEED CONFIGURATION =====
 * *
 *  * This file controls what posts appear in the Stoic feed.
 *  *
 *  * To add new keywords:
 *  * 1. Add them to the stoicKeywords list below
 *  * 2. Make sure to put them in quotes and add a comma
 *  * 3. For single words, use the pattern: '\\bword\\b'
 *  * 4. For phrases, just use normal quotes: 'two words'
 *  *
 *  * Examples for adding keywords:
 *  * - Single word: '\\bstoic\\b'         (matches: "stoic" but not "stoicism")
 *  * - Phrase: 'marcus aurelius'          (matches the whole phrase)
 *  */

// Specific location exclusions for common false positives
const locationExclusions = [
  'park',
  'falls',
  'lake',
  'county',
  'river',
  'ny',
  'new york'
] as const;


function removeUrls(text: string | null | undefined): string {
  if (!text) return '';
  return text.replace(/(?:https?:\/\/|www\.)[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*/g, '')
}

// All single words must use word boundaries (\\b)
// Multi-word phrases should be converted to regex patterns
const stoicKeywords = [
  '\\bstoic\\b',              // Only matches: "stoic", "Stoic"
  '\\bstoicism\\b',           // Only matches: "stoicism", "Stoicism"
  '\\bmarcus\\s+aurelius\\b', // Only matches: "Marcus Aurelius", "marcus aurelius"
  '\\bepictetus\\b',          // Only matches: "epictetus", "Epictetus"
  '\\bmeditations\\b',        // Only matches: "meditations", "Meditations"
  '\\bmusonius\\s+rufus\\b',  // Only matches: "Musonius Rufus", "musonius rufus"
  '\\bchrysippus\\b',         // Only matches: "chrysippus", "Chrysippus"
  '\\bcleanthes\\b',          // Only matches: "cleanthes", "Cleanthes"
  '\\bzeno\\b',               // Only matches: "zeno", "Zeno"
  // Special case for Seneca to exclude location names
  '(?<!\\w)seneca(?!\\s+(?:' + locationExclusions.join('|') + '))\\b'
] as const;

// Words that, when appearing together, should cause the post to be excluded
const exclusionPairs = [
  ['\\bzeno\\b', '\\bparadox\\b'],     // Excludes posts about Zeno's paradox
  ['\\bzeno\\b', '\\bxenophobia\\b'],  // Excludes posts about xenophobia
] as const;


export function isStoicContent(text: string | null | undefined): boolean {
  if (!text) return false;

  // Remove URLs first
  const textWithoutUrls = removeUrls(text)
  const normalizedText = textWithoutUrls.toLowerCase()

  // Check exclusions first - using regex patterns for word boundaries
  const hasExclusion = exclusionPairs.some(([word1, word2]) => {
    const regex1 = new RegExp(word1, 'i')
    const regex2 = new RegExp(word2, 'i')
    return regex1.test(normalizedText) && regex2.test(normalizedText)
  })
  if (hasExclusion) {
    return false
  }

  // Check for keywords
  return stoicKeywords.some(pattern => {
    const regex = new RegExp(pattern, 'i')
    return regex.test(normalizedText)
  })
}
