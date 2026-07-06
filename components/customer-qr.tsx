"use client";

import { QRCodeSVG } from "qrcode.react";

export function CustomerQr({ value }: { value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3">
      <QRCodeSVG value={value} size={112} />
    </div>
  );
}
