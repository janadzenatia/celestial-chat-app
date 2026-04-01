/**
 * Strip markdown formatting from AI-generated text.
 * Removes bold, italic, headers, strikethrough, code blocks, etc.
 */
export function stripMarkdown(text: string | null | undefined): string {
  if (!text) return text || "";
  return text
    .replace(/#{1,6}\s*/g, "")           // headers
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1") // bold+italic
    .replace(/\*\*(.*?)\*\*/g, "$1")     // bold
    .replace(/(?<!\w)\*(.*?)\*(?!\w)/g, "$1") // italic (avoid breaking words with asterisks)
    .replace(/__(.*?)__/g, "$1")         // underline bold
    .replace(/(?<!\w)_(.*?)_(?!\w)/g, "$1") // underline italic
    .replace(/~~(.*?)~~/g, "$1")         // strikethrough
    .replace(/`{3}[\s\S]*?`{3}/g, "")   // code blocks
    .replace(/`(.*?)`/g, "$1")           // inline code
    .replace(/^[-*+]\s/gm, "• ")         // bullet lists → clean bullets
    .trim();
}

/**
 * Recursively strip markdown from all string values in an object.
 */
export function stripMarkdownDeep(obj: any): any {
  if (typeof obj === "string") return stripMarkdown(obj);
  if (Array.isArray(obj)) return obj.map(stripMarkdownDeep);
  if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      result[key] = stripMarkdownDeep(value);
    }
    return result;
  }
  return obj;
}
