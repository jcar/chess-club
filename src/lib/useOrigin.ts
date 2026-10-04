"use client";

import { useSyncExternalStore } from "react";
import { withBasePath } from "./basePath";

const noop = () => () => {};

/** This site's origin ("" while prerendering), for absolute links inside QR codes. */
export function useOrigin(): string {
  return useSyncExternalStore(noop, () => window.location.origin, () => "");
}

/** Absolute URL for an app path, e.g. appUrl(origin, "/student/go/") + "#s=…". */
export function appUrl(origin: string, path: string): string {
  return `${origin}${withBasePath(path)}`;
}
