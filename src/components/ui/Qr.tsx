"use client";

// A QR code as crisp SVG (prints sharp at any size). Generated on the device:
// nothing is sent anywhere.

import qrcode from "qrcode-generator";
import { useMemo } from "react";

export function Qr({ text, size = 240, label, className = "" }: { text: string; size?: number; label: string; className?: string }) {
  const { n, path } = useMemo(() => {
    const qr = qrcode(0, "L");
    qr.addData(text, "Byte");
    qr.make();
    const n = qr.getModuleCount();
    let path = "";
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c + 4} ${r + 4}h1v1h-1z`;
    return { n, path };
  }, [text]);
  return (
    <svg viewBox={`0 0 ${n + 8} ${n + 8}`} width={size} height={size} role="img" aria-label={label} className={`bg-white ${className}`} shapeRendering="crispEdges" data-qr={text}>
      <rect width={n + 8} height={n + 8} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  );
}
