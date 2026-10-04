// base64url (URL- and QR-safe) for JSON packed into URL fragments. The part
// after "#" never reaches the server, so names in it stay on the devices.

export function toB64Url(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromB64Url(s: string): string {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

/** Short FNV-1a checksum (2 chars) to catch a mangled or hand-edited payload. */
export function check2(s: string): string {
  const A = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let h = 2166136261;
  for (const ch of s) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return A[h % A.length] + A[Math.floor(h / A.length) % A.length];
}
