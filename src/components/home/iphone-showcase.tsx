"use client";

import Image from "next/image";
import { useState } from "react";

const views = [
  { label: "Overview", src: "/images/promotions/iphone-18-pro-max.webp", alt: "Black iPhone 18 Pro Max, front and rear view supplied by Mozillion", width: 817 },
  { label: "Rear view", src: "/images/promotions/iphone-18-pro-max-back.webp", alt: "Rear view of the black iPhone 18 Pro Max supplied by Mozillion", width: 482 },
];

export function IPhoneShowcase() {
  const [selected, setSelected] = useState(0);
  const view = views[selected];
  return (
    <div className="relative flex min-w-0 flex-col items-center px-6 pt-8 pb-7 sm:pt-10 lg:pt-7">
      <div aria-hidden="true" className="iphone-halo" />
      <div className="relative flex h-[290px] w-full items-center justify-center sm:h-[380px] lg:h-[410px]">
        <Image key={view.src} src={view.src} alt={view.alt} width={view.width} height={1000} sizes="(max-width: 640px) 260px, 360px" className="iphone-product relative h-full w-auto max-w-full object-contain" />
      </div>
      <div role="group" aria-label="Choose a product view" className="relative mt-6 flex gap-1 rounded-full border border-white/15 bg-black/20 p-1">
        {views.map((item, index) => <button key={item.label} type="button" aria-pressed={index === selected} onClick={() => setSelected(index)} className={`min-h-10 rounded-full px-5 text-xs font-medium transition-colors ${index === selected ? "bg-white text-[#252624]" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>{item.label}</button>)}
      </div>
      <p className="relative mt-3 text-[10px] tracking-wide text-white/45">Black finish shown · Images supplied by Mozillion</p>
    </div>
  );
}
