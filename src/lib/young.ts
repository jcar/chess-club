// Easy-reading mode (simpler wording, star marks, read-aloud) is about reading
// ability, not age or chess level. A kid's own setting wins; otherwise K–2 is
// a first guess the teacher can change; otherwise the device's setting.

export function isEarlyReader(kid: { grade?: string; earlyReader?: boolean } | null | undefined, deviceDefault: boolean): boolean {
  if (!kid) return deviceDefault;
  if (kid.earlyReader !== undefined) return kid.earlyReader;
  if (kid.grade && ["K", "1", "2"].includes(kid.grade.toUpperCase())) return true;
  return deviceDefault;
}
