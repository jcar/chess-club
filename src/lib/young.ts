/** K–2 kids get kid wording and read-aloud. Undefined when the grade isn't known. */
export function isYoungGrade(grade: string | undefined): boolean | undefined {
  if (!grade) return undefined;
  return ["K", "1", "2"].includes(grade.toUpperCase());
}
