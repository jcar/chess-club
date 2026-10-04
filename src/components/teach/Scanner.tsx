"use client";

// Camera QR scanner for the adult's phone (Wrap-up). Uses the camera inside
// this page, so results land in this app's storage even when it runs from
// the Home Screen. jsQR is loaded only when scanning starts.

import { useEffect, useRef, useState } from "react";

export function Scanner({ onText, onClose }: { onText: (text: string) => void; onClose: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const last = useRef<{ text: string; at: number } | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    (async () => {
      try {
        const { default: jsQR } = await import("jsqr");
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (stopped || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        const tick = () => {
          const v = video.current;
          if (stopped || !v || !ctx) return;
          if (v.videoWidth) {
            canvas.width = v.videoWidth;
            canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const code = jsQR(img.data, img.width, img.height, { inversionAttempts: "dontInvert" });
            // The same code stays in view for a while: report it once.
            if (code?.data && (last.current?.text !== code.data || Date.now() - last.current.at > 4000)) {
              last.current = { text: code.data, at: Date.now() };
              onText(code.data);
            }
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setError("Couldn't open the camera. Allow camera access for this site, or open the code with the phone's camera app.");
      }
    })();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onText]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-black/90 p-4" role="dialog" aria-label="Scan a code">
      {error ? <p className="max-w-sm text-center text-lg text-white">{error}</p> : <video ref={video} playsInline muted className="max-h-[70svh] w-full max-w-md rounded-2xl" />}
      <p className="text-center text-white">Point at a pass code or a helper&apos;s code. Keep going: each one is added as it scans.</p>
      <button type="button" onClick={onClose} className="min-h-14 rounded-2xl bg-white px-8 text-xl font-semibold">
        Done scanning
      </button>
    </div>
  );
}
