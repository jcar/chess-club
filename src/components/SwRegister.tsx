"use client";

// Registers the service worker in production so the app opens instantly and
// works offline after the first visit.

import { useEffect } from "react";
import { withBasePath } from "@/lib/basePath";

export function SwRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register(withBasePath("/sw.js"), { scope: withBasePath("/") }).catch(() => {
      /* offline support is a nicety; never break the app over it */
    });
  }, []);
  return null;
}
