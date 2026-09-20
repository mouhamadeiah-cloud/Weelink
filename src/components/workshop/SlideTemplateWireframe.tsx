import React from 'react';
import { SlideType } from '../../types';

interface SlideTemplateWireframeProps {
  slideType: SlideType;
  variantId: number;
}

export const SlideTemplateWireframe: React.FC<SlideTemplateWireframeProps> = ({
  slideType,
  variantId,
}) => {
  // EMPTY SLIDE WIREFRAME
  if (slideType === 'empty') {
    return (
      <div className="w-full h-28 bg-[#09152b] rounded-lg p-3 flex flex-col items-center justify-center border-2 border-dashed border-blue-500/30 relative overflow-hidden">
        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-blue-300 font-black text-sm mb-1">
          +
        </div>
        <div className="text-[10px] text-blue-200 font-bold">شريحة فارغة مع زر عائم</div>
      </div>
    );
  }

  // INTRO SLIDE WIREFRAMES
  if (slideType === 'intro') {
    switch (variantId) {
      case 1:
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center justify-between gap-2 border border-white/10 relative overflow-hidden">
            <div className="w-2/5 h-full rounded-md bg-gradient-to-br from-blue-600/30 to-blue-900/40 border border-blue-500/30 flex items-center justify-center relative">
              <div className="w-6 h-6 rounded-full bg-blue-500/40 border border-blue-400/60 flex items-center justify-center text-[8px] font-bold text-blue-200">★</div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-orange-500 text-[8px] text-white flex items-center justify-center font-bold">1</div>
            </div>
            <div className="w-3/5 flex flex-col justify-center gap-1.5 pr-1">
              <div className="w-3/4 h-2.5 rounded bg-white/80" />
              <div className="w-1/2 h-1.5 rounded bg-orange-400/70" />
              <div className="w-5/6 h-1 rounded bg-white/30 mt-0.5" />
              <div className="w-16 h-3 rounded bg-orange-600 mt-1 flex items-center justify-center">
                <div className="w-8 h-1 rounded-full bg-white/90" />
              </div>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg flex border border-white/10 relative overflow-hidden">
            <div className="w-1/2 h-full bg-gradient-to-tr from-cyan-900/60 to-blue-600/40 p-2 flex flex-col justify-between relative border-r border-white/10">
              <div className="w-5 h-5 rounded-full bg-white text-emerald-950 font-black text-[9px] flex items-center justify-center shadow">7</div>
              <div className="w-8 h-1.5 rounded bg-white/50" />
            </div>
            <div className="w-1/2 h-full bg-[#062419] p-2 flex flex-col justify-center gap-1">
              <div className="w-10 h-1.5 rounded bg-emerald-400/70" />
              <div className="w-full h-2.5 rounded bg-white" />
              <div className="w-4/5 h-1 rounded bg-emerald-200/50" />
              <div className="w-14 h-3 rounded bg-emerald-500 mt-1 flex items-center justify-center">
                <div className="w-8 h-1 rounded bg-white" />
              </div>
            </div>
          </div>
        );
      case 3:
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col justify-between border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-white/10 pb-1">
              <div className="flex flex-col gap-1 w-2/3">
                <div className="w-3/4 h-2.5 rounded bg-white" />
                <div className="w-1/2 h-1.5 rounded bg-orange-400/70" />
              </div>
              <div className="w-12 h-3 rounded bg-orange-600 flex items-center justify-center">
                <div className="w-6 h-1 rounded-full bg-white" />
              </div>
            </div>
            <div className="w-full h-12 rounded bg-gradient-to-r from-blue-900/60 via-indigo-800/40 to-cyan-900/60 border border-blue-400/20 flex items-center justify-between px-2 relative">
              <div className="w-12 h-1.5 rounded bg-white/40" />
              <div className="w-5 h-5 rounded-full bg-orange-500 text-white font-bold text-[9px] flex items-center justify-center">2</div>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="w-full h-28 bg-[#061124] rounded-lg p-2 flex items-center relative overflow-hidden border border-white/10">
            <div className="absolute inset-0 bg-gradient-to-l from-blue-950 via-slate-900 to-indigo-950 opacity-80" />
            <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-blue-600/10 border-l border-white/10" />
            <div className="relative z-10 w-2/3 h-full bg-[#0a1835]/95 border border-white/20 rounded-md p-1.5 flex flex-col justify-between shadow-lg">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="w-8 h-1.5 rounded bg-orange-400/80" />
                  <span className="text-[8px] text-white/50">#4</span>
                </div>
                <div className="w-full h-2 rounded bg-white" />
                <div className="w-3/4 h-1 rounded bg-white/40 mt-1" />
              </div>
              <div className="w-14 h-3 rounded bg-orange-600 flex items-center justify-center">
                <div className="w-6 h-1 rounded bg-white" />
              </div>
            </div>
          </div>
        );
      case 5:
      default:
        return (
          <div className="w-full h-28 rounded-lg relative overflow-hidden border border-white/10 flex flex-col items-center justify-center p-2 text-center bg-gradient-to-b from-blue-950/80 via-black/80 to-blue-950/90">
            <div className="w-6 h-6 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-[9px] font-bold text-orange-400 mb-1">5</div>
            <div className="w-2/3 h-2.5 rounded bg-white shadow-sm mb-1" />
            <div className="w-1/2 h-1.5 rounded bg-orange-300/80 mb-2" />
            <div className="w-16 h-3 rounded-full bg-orange-600 flex items-center justify-center shadow">
              <div className="w-8 h-1 rounded-full bg-white" />
            </div>
          </div>
        );
    }
  }

  // VIDEO SLIDE WIREFRAMES
  if (slideType === 'video') {
    switch (variantId) {
      case 1:
        // Central theater
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col items-center justify-between border border-white/10">
            <div className="w-1/2 h-2 rounded bg-white" />
            <div className="w-3/4 h-16 rounded-lg bg-black/80 border border-orange-500/40 flex items-center justify-center relative">
              <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-[9px]">▶</div>
            </div>
          </div>
        );
      case 2:
        // Split screen
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center gap-2 border border-white/10">
            <div className="w-1/2 h-full rounded bg-black/80 border border-white/20 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px]">▶</div>
            </div>
            <div className="w-1/2 flex flex-col gap-1.5">
              <div className="w-3/4 h-2 rounded bg-white" />
              <div className="w-full h-1 rounded bg-white/40" />
              <div className="w-4/5 h-1 rounded bg-white/40" />
              <div className="w-12 h-2.5 rounded bg-orange-600 mt-1" />
            </div>
          </div>
        );
      case 3:
        // Background video + floating card
        return (
          <div className="w-full h-28 rounded-lg p-2 flex items-center justify-center relative overflow-hidden border border-white/10 bg-gradient-to-r from-blue-900 to-indigo-950">
            <div className="absolute inset-0 opacity-40 flex items-center justify-center text-white/20 text-3xl font-bold">▶</div>
            <div className="relative z-10 w-4/5 bg-slate-900/90 border border-white/20 rounded p-1.5 text-center">
              <div className="w-2/3 h-2 rounded bg-white mx-auto mb-1" />
              <div className="w-1/2 h-1 rounded bg-orange-400 mx-auto" />
            </div>
          </div>
        );
      case 4:
        // Studio player + chapters
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1.5 border border-white/10">
            <div className="w-3/5 h-full rounded bg-black/80 flex items-center justify-center border border-white/10">
              <div className="w-5 h-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px]">▶</div>
            </div>
            <div className="w-2/5 flex flex-col justify-between py-1">
              <div className="h-4 rounded bg-white/10 border border-white/10 px-1 flex items-center text-[7px] text-gray-300">01 مقدمة</div>
              <div className="h-4 rounded bg-orange-500/20 border border-orange-500/30 px-1 flex items-center text-[7px] text-orange-200">02 التنفيذ</div>
              <div className="h-4 rounded bg-white/10 border border-white/10 px-1 flex items-center text-[7px] text-gray-300">03 النتيجة</div>
            </div>
          </div>
        );
      case 5:
      default:
        // Modern card with neon glow
        return (
          <div className="w-full h-28 bg-gradient-to-tr from-sky-950 via-slate-900 to-blue-950 rounded-lg p-2 flex flex-col justify-between border-2 border-sky-400/40 shadow-inner">
            <div className="flex justify-between items-center">
              <div className="w-1/2 h-2 rounded bg-white" />
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400 flex items-center justify-center text-sky-300 text-xs">▶</div>
              <div className="flex-1 space-y-1">
                <div className="w-3/4 h-1.5 rounded bg-white/80" />
                <div className="w-1/2 h-1 rounded bg-sky-300/60" />
              </div>
            </div>
          </div>
        );
    }
  }

  // CONTACT SLIDE WIREFRAMES
  if (slideType === 'contact') {
    switch (variantId) {
      case 1:
        // Split form + map
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1.5 border border-white/10">
            <div className="w-1/2 h-full rounded bg-white/5 border border-white/10 p-1 flex flex-col justify-between">
              <div className="w-3/4 h-1.5 rounded bg-white" />
              <div className="w-full h-2.5 rounded bg-white/10" />
              <div className="w-full h-2.5 rounded bg-white/10" />
              <div className="w-10 h-2.5 rounded bg-orange-600" />
            </div>
            <div className="w-1/2 h-full rounded bg-emerald-950/40 border border-emerald-500/20 flex flex-col items-center justify-center text-[7px] text-emerald-300">
              <div className="w-3 h-3 rounded-full bg-emerald-500/30 mb-0.5" />
              <span>خريطة ومعلومات</span>
            </div>
          </div>
        );
      case 2:
        // Top wide map + dual info
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-full h-11 rounded bg-blue-950/60 border border-blue-500/20 flex items-center justify-center text-[8px] text-blue-300">خريطة بانورامية عريضة</div>
            <div className="grid grid-cols-2 gap-1 h-10">
              <div className="rounded bg-white/5 border border-white/10 flex items-center justify-center text-[7px]">استمارة مراسلة</div>
              <div className="rounded bg-white/5 border border-white/10 flex items-center justify-center text-[7px]">بيانات الاتصال</div>
            </div>
          </div>
        );
      case 3:
        // 3 columns
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 grid grid-cols-3 gap-1 border border-white/10">
            <div className="rounded bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[7px] p-1 text-center">أرقام وهواتف</div>
            <div className="rounded bg-orange-500/10 border border-orange-500/30 flex flex-col items-center justify-center text-[7px] p-1 text-center text-orange-200">نموذج مراسلة</div>
            <div className="rounded bg-white/5 border border-white/10 flex flex-col items-center justify-center text-[7px] p-1 text-center">خريطة تفاعلية</div>
          </div>
        );
      case 4:
        // Compact unified card
        return (
          <div className="w-full h-28 bg-[#061124] rounded-lg p-2 flex items-center justify-center border border-white/10">
            <div className="w-5/6 h-full bg-[#0a1835] rounded border border-orange-500/30 p-1.5 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <div className="w-1/2 h-1.5 rounded bg-white" />
                <div className="w-3 h-3 rounded-full bg-orange-500/40" />
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-3 rounded bg-white/10" />
                <div className="h-3 rounded bg-white/10" />
              </div>
              <div className="w-full h-3 rounded bg-orange-600 flex items-center justify-center text-[7px] text-white">إرسال فوري</div>
            </div>
          </div>
        );
      case 5:
      default:
        // Central contact hub
        return (
          <div className="w-full h-28 bg-gradient-to-b from-blue-950 to-slate-950 rounded-lg p-2 flex flex-col items-center justify-between border border-white/10 text-center">
            <div className="w-2/3 h-2 rounded bg-white" />
            <div className="flex gap-2">
              <div className="w-7 h-7 rounded-full bg-emerald-600/30 border border-emerald-400 flex items-center justify-center text-[8px] text-emerald-300">واتساب</div>
              <div className="w-7 h-7 rounded-full bg-blue-600/30 border border-blue-400 flex items-center justify-center text-[8px] text-blue-300">اتصال</div>
              <div className="w-7 h-7 rounded-full bg-orange-600/30 border border-orange-400 flex items-center justify-center text-[8px] text-orange-300">الموقع</div>
            </div>
            <div className="w-16 h-2 rounded bg-white/20" />
          </div>
        );
    }
  }

  // TEAM SLIDE WIREFRAMES
  if (slideType === 'team') {
    switch (variantId) {
      case 1:
        // Circular geometric grid
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col justify-between border border-white/10">
            <div className="w-1/2 h-2 rounded bg-white mx-auto" />
            <div className="flex justify-around items-center">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 border border-white/20" />
                  <div className="w-4 h-1 rounded bg-white/40" />
                </div>
              ))}
            </div>
          </div>
        );
      case 2:
        // Leader prominent + team around
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1.5 border border-white/10">
            <div className="w-2/5 h-full rounded bg-orange-500/20 border border-orange-500/40 p-1 flex flex-col items-center justify-center text-center">
              <div className="w-8 h-8 rounded-full bg-orange-500 mb-1" />
              <div className="w-3/4 h-1.5 rounded bg-white" />
              <span className="text-[6px] text-orange-300 mt-0.5">المدير العام</span>
            </div>
            <div className="w-3/5 grid grid-cols-2 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded bg-white/5 border border-white/10 p-0.5 flex items-center gap-1">
                  <div className="w-4 h-4 rounded-full bg-blue-500/40 shrink-0" />
                  <div className="w-full h-1 rounded bg-white/40" />
                </div>
              ))}
            </div>
          </div>
        );
      case 3:
        // Hexagonal / polygon cards
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-1/3 h-1.5 rounded bg-white" />
            <div className="grid grid-cols-5 gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-gradient-to-b from-indigo-900/40 to-blue-950/60 border border-indigo-400/30 p-1 flex flex-col items-center justify-between">
                  <div className="w-5 h-5 rounded-lg bg-indigo-500/30 rotate-45 mt-1 border border-indigo-300/40" />
                  <div className="w-full h-1 rounded bg-white/50" />
                </div>
              ))}
            </div>
          </div>
        );
      case 4:
        // Horizontal list
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-7 rounded bg-white/5 border border-white/10 px-2 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-blue-600/30" />
                  <div className="w-14 h-1.5 rounded bg-white" />
                </div>
                <div className="w-12 h-1 rounded bg-orange-400/60" />
              </div>
            ))}
          </div>
        );
      case 5:
      default:
        // Modern glow cards
        return (
          <div className="w-full h-28 bg-gradient-to-b from-slate-900 to-blue-950 rounded-lg p-1.5 flex flex-col justify-between border border-sky-400/30">
            <div className="w-1/2 h-2 rounded bg-white mx-auto" />
            <div className="grid grid-cols-3 gap-1 h-16">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg bg-white/10 border border-white/15 p-1 flex flex-col items-center justify-around shadow">
                  <div className="w-6 h-6 rounded-full bg-sky-500/30 border border-sky-400" />
                  <div className="w-3/4 h-1 rounded bg-white" />
                </div>
              ))}
            </div>
          </div>
        );
    }
  }

  // OFFERS SLIDE WIREFRAMES
  if (slideType === 'offers') {
    switch (variantId) {
      case 1:
        // Central spotlight banner
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center justify-center border border-white/10">
            <div className="w-5/6 h-full rounded-xl bg-gradient-to-r from-orange-600/30 to-amber-600/30 border border-orange-500 p-2 flex flex-col items-center justify-around text-center">
              <span className="text-[10px] font-black text-orange-400">خصم 25% حصري</span>
              <div className="w-3/4 h-2 rounded bg-white" />
              <div className="w-16 h-3 rounded bg-orange-500" />
            </div>
          </div>
        );
      case 2:
        // Split card with photo
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1.5 border border-white/10">
            <div className="w-1/2 h-full rounded bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-[8px] text-orange-300">صورة العرض</div>
            <div className="w-1/2 flex flex-col justify-between py-1">
              <div className="w-3/4 h-2 rounded bg-white" />
              <div className="w-full h-1 rounded bg-white/40" />
              <div className="w-12 h-2.5 rounded bg-orange-600" />
            </div>
          </div>
        );
      case 3:
        // Cut voucher coupon
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center justify-center border border-white/10">
            <div className="w-full h-4/5 rounded-lg border-2 border-dashed border-amber-400/60 bg-amber-950/20 p-2 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-bold text-amber-300">قسيمة تخفيض معتمدة</span>
                <div className="w-20 h-2 rounded bg-white" />
              </div>
              <div className="border-r-2 border-dashed border-amber-400/40 h-full mx-1" />
              <div className="w-12 h-5 rounded bg-amber-500 text-[8px] font-black flex items-center justify-center text-black">كود PROMO</div>
            </div>
          </div>
        );
      case 4:
        // Floating glass card + timer
        return (
          <div className="w-full h-28 rounded-lg p-2 flex flex-col justify-between border border-white/10 bg-gradient-to-r from-blue-950 to-indigo-950">
            <div className="flex justify-between items-center">
              <div className="w-1/2 h-2 rounded bg-white" />
              <span className="text-[7px] px-1 rounded bg-rose-500 text-white">مؤقت: 24 ساعة</span>
            </div>
            <div className="w-full h-2 rounded bg-white/30" />
            <div className="w-16 h-3 rounded bg-orange-600" />
          </div>
        );
      case 5:
      default:
        // High contrast typography
        return (
          <div className="w-full h-28 bg-black rounded-lg p-2 flex items-center justify-between border border-white/20">
            <div className="flex flex-col gap-1 w-1/2">
              <span className="text-xl font-black text-orange-500">50%</span>
              <div className="w-full h-2 rounded bg-white" />
            </div>
            <div className="w-16 h-6 rounded bg-white text-black font-bold text-[8px] flex items-center justify-center">احصل الآن</div>
          </div>
        );
    }
  }

  // PRICING SLIDE WIREFRAMES
  if (slideType === 'pricing') {
    switch (variantId) {
      case 1:
        // 3 cards comparison
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-1/3 h-1.5 rounded bg-white mx-auto" />
            <div className="grid grid-cols-3 gap-1 h-18">
              <div className="rounded bg-white/5 border border-white/10 p-1 flex flex-col justify-between"><div className="w-full h-1.5 rounded bg-white/60" /><span className="text-[7px]">100$</span></div>
              <div className="rounded bg-orange-500/20 border border-orange-500 p-1 flex flex-col justify-between"><div className="w-full h-1.5 rounded bg-white" /><span className="text-[7px] text-orange-300 font-bold">200$</span></div>
              <div className="rounded bg-white/5 border border-white/10 p-1 flex flex-col justify-between"><div className="w-full h-1.5 rounded bg-white/60" /><span className="text-[7px]">300$</span></div>
            </div>
          </div>
        );
      case 2:
        // Horizontal table
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-6 rounded bg-white/5 border border-white/10 px-2 flex items-center justify-between">
                <div className="w-20 h-1.5 rounded bg-white" />
                <div className="flex items-center gap-2">
                  <span className="text-[7px] text-emerald-400 font-bold">50$</span>
                  <div className="w-8 h-3 rounded bg-orange-600" />
                </div>
              </div>
            ))}
          </div>
        );
      case 3:
        // Feature cards with price tag
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 grid grid-cols-3 gap-1 border border-white/10">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded bg-white/5 border border-white/10 p-1 flex flex-col justify-between">
                <div className="w-8 h-3 rounded bg-amber-500/30 text-[7px] text-amber-300 flex items-center justify-center font-bold">وسم</div>
                <div className="w-full h-1.5 rounded bg-white" />
                <div className="w-full h-2 rounded bg-orange-600" />
              </div>
            ))}
          </div>
        );
      case 4:
        // Dual comparison
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 grid grid-cols-2 gap-1.5 border border-white/10">
            <div className="rounded bg-white/5 border border-white/10 p-1.5 flex flex-col justify-between"><div className="w-3/4 h-2 rounded bg-white" /><span className="text-[9px] text-gray-300">الأساسية</span></div>
            <div className="rounded bg-blue-600/20 border border-blue-400 p-1.5 flex flex-col justify-between"><div className="w-3/4 h-2 rounded bg-white" /><span className="text-[9px] text-blue-300 font-bold">الشاملة</span></div>
          </div>
        );
      case 5:
      default:
        // Bento layout
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 grid grid-cols-3 gap-1 border border-white/10">
            <div className="col-span-2 rounded bg-white/10 p-1 flex flex-col justify-between"><div className="w-2/3 h-2 rounded bg-white" /><div className="w-12 h-3 rounded bg-orange-600" /></div>
            <div className="rounded bg-emerald-600/20 border border-emerald-500/30 p-1 flex flex-col items-center justify-center text-[7px] text-emerald-300">ضمان الجودة</div>
          </div>
        );
    }
  }

  // BOOKING SLIDE WIREFRAMES
  if (slideType === 'booking') {
    switch (variantId) {
      case 1:
        // Step calendar + slots
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1 border border-white/10">
            <div className="w-1/2 h-full rounded bg-white/5 p-1 flex flex-col justify-between"><span className="text-[7px] text-gray-300">الأيام المتاحة</span><div className="grid grid-cols-3 gap-0.5"><div className="h-2 rounded bg-white/20" /><div className="h-2 rounded bg-orange-500" /><div className="h-2 rounded bg-white/20" /></div></div>
            <div className="w-1/2 h-full rounded bg-white/5 p-1 flex flex-col justify-between"><span className="text-[7px] text-gray-300">الفترات</span><div className="w-full h-3 rounded bg-orange-600" /></div>
          </div>
        );
      case 2:
        // Single row quick booking bar
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col justify-around border border-white/10">
            <div className="w-1/2 h-2 rounded bg-white mx-auto" />
            <div className="h-8 rounded-lg bg-white/10 border border-white/20 p-1 flex items-center justify-between gap-1">
              <div className="w-1/4 h-full rounded bg-white/10" />
              <div className="w-1/4 h-full rounded bg-white/10" />
              <div className="w-1/4 h-full rounded bg-orange-600" />
            </div>
          </div>
        );
      case 3:
        // Consultation card with expert photo
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex gap-1.5 border border-white/10">
            <div className="w-1/3 h-full rounded bg-blue-600/20 border border-blue-500/30 flex flex-col items-center justify-center p-1"><div className="w-6 h-6 rounded-full bg-white/30 mb-1" /><span className="text-[6px]">الخبير</span></div>
            <div className="w-2/3 flex flex-col justify-between py-1"><div className="w-3/4 h-2 rounded bg-white" /><div className="w-full h-3 rounded bg-orange-600" /></div>
          </div>
        );
      case 4:
        // Horizontal chips time slots
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-1/2 h-2 rounded bg-white" />
            <div className="flex gap-1 overflow-hidden">
              {['10:00', '12:00', '14:00', '16:00'].map((t) => (
                <div key={t} className="px-1.5 py-1 rounded-full bg-white/10 text-[7px] shrink-0">{t}</div>
              ))}
            </div>
            <div className="w-full h-3 rounded bg-orange-600" />
          </div>
        );
      case 5:
      default:
        // Executive booking with WhatsApp
        return (
          <div className="w-full h-28 bg-gradient-to-r from-emerald-950 to-slate-950 rounded-lg p-2 flex flex-col justify-between border border-emerald-500/30">
            <div className="flex justify-between items-center"><div className="w-1/2 h-2 rounded bg-white" /><span className="text-[7px] text-emerald-400">تأكيد مباشر</span></div>
            <div className="w-full h-5 rounded bg-emerald-600 text-white font-bold text-[8px] flex items-center justify-center gap-1">حجز واتساب فوري</div>
          </div>
        );
    }
  }

  // TEXT BLOCK SLIDE WIREFRAMES
  if (slideType === 'text_block') {
    switch (variantId) {
      case 1:
        // Centered editorial with divider
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col items-center justify-between border border-white/10 text-center">
            <div className="w-1/2 h-2 rounded bg-white" />
            <div className="w-8 h-0.5 rounded bg-orange-500" />
            <div className="w-4/5 space-y-1">
              <div className="w-full h-1 rounded bg-white/40" />
              <div className="w-5/6 h-1 rounded bg-white/30 mx-auto" />
            </div>
          </div>
        );
      case 2:
        // Newspaper double columns
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-2/3 h-2 rounded bg-white mb-1" />
            <div className="grid grid-cols-2 gap-2 h-16 border-t border-white/10 pt-1">
              <div className="space-y-1"><div className="w-full h-1 rounded bg-white/40" /><div className="w-4/5 h-1 rounded bg-white/30" /></div>
              <div className="space-y-1"><div className="w-full h-1 rounded bg-white/40" /><div className="w-4/5 h-1 rounded bg-white/30" /></div>
            </div>
          </div>
        );
      case 3:
        // Pull quote card
        return (
          <div className="w-full h-28 bg-[#061124] rounded-lg p-2 flex items-center border border-white/10">
            <div className="w-full h-4/5 rounded bg-orange-500/10 border-r-2 border-orange-500 p-2 flex flex-col justify-between">
              <span className="text-[12px] text-orange-400 font-serif leading-none">“</span>
              <div className="w-5/6 h-1.5 rounded bg-white" />
              <div className="w-1/2 h-1 rounded bg-orange-300/60" />
            </div>
          </div>
        );
      case 4:
        // Formal structured documentation
        return (
          <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 flex flex-col justify-between border border-white/10">
            <div className="w-1/2 h-2 rounded bg-white" />
            <div className="space-y-1">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-blue-400" /><div className="w-4/5 h-1 rounded bg-white/40" /></div>
              ))}
            </div>
          </div>
        );
      case 5:
      default:
        // Ultra-modern neon contrast card
        return (
          <div className="w-full h-28 bg-gradient-to-tr from-sky-950 to-[#040814] rounded-lg p-2 flex flex-col justify-between border-2 border-sky-400/40 shadow-md">
            <div className="w-4 h-4 rounded-full bg-sky-400/20 text-sky-400 text-[8px] flex items-center justify-center font-bold">✦</div>
            <div className="w-3/4 h-2 rounded bg-white" />
            <div className="w-full h-1 rounded bg-sky-200/50" />
          </div>
        );
    }
  }

  // EMPTY SLIDE WIREFRAME
  if (slideType === 'empty') {
    return (
      <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col items-center justify-center border-2 border-dashed border-blue-400/40 relative overflow-hidden group">
        <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 mb-1.5 shadow-sm">
          <span className="text-sm font-bold">+</span>
        </div>
        <div className="text-[10px] font-bold text-gray-200">شريحة شبكة حرة Freeform</div>
        <div className="text-[8px] text-gray-400 mt-0.5">سحب وإفلات العناصر بحرية</div>
      </div>
    );
  }

  // Fallback schematic wireframes for other slides
  switch (variantId) {
    case 1:
      return (
        <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center gap-2 border border-white/10">
          <div className="w-1/2 h-full rounded bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-[9px] text-blue-300">عنصر مرئي</div>
          <div className="w-1/2 flex flex-col gap-1.5"><div className="w-3/4 h-2.5 rounded bg-white" /><div className="w-full h-1.5 rounded bg-white/40" /><div className="w-12 h-3 rounded bg-orange-600 mt-1" /></div>
        </div>
      );
    case 2:
      return (
        <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex items-center gap-2 border border-white/10">
          <div className="w-1/2 flex flex-col gap-1.5"><div className="w-3/4 h-2.5 rounded bg-white" /><div className="w-12 h-3 rounded bg-blue-600 mt-1" /></div>
          <div className="w-1/2 h-full rounded bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-[9px] text-emerald-300">عرض مميز</div>
        </div>
      );
    case 3:
      return (
        <div className="w-full h-28 bg-[#061124] rounded-lg p-2 relative overflow-hidden border border-white/10 flex items-center">
          <div className="relative z-10 w-full h-4/5 bg-[#09152e]/90 border border-white/20 rounded p-1.5 flex flex-col justify-between"><div className="w-1/2 h-2 rounded bg-white" /><div className="w-full h-1 rounded bg-white/40" /></div>
        </div>
      );
    case 4:
      return (
        <div className="w-full h-28 bg-[#09152b] rounded-lg p-2 flex flex-col justify-between border border-white/10">
          <div className="text-center flex flex-col items-center gap-1"><div className="w-1/2 h-2.5 rounded bg-white" /></div>
          <div className="grid grid-cols-3 gap-1 h-11"><div className="rounded bg-white/10 flex items-center justify-center text-[7px]">1</div><div className="rounded bg-orange-500/20 flex items-center justify-center text-[7px]">2</div><div className="rounded bg-white/10 flex items-center justify-center text-[7px]">3</div></div>
        </div>
      );
    case 5:
    default:
      return (
        <div className="w-full h-28 bg-[#09152b] rounded-lg p-1.5 grid grid-cols-3 gap-1 border border-white/10">
          <div className="col-span-2 rounded bg-white/10 p-1.5 flex flex-col justify-between"><div className="w-3/4 h-2 rounded bg-white" /><div className="w-10 h-2.5 rounded bg-orange-600" /></div>
          <div className="rounded bg-blue-600/30 border border-blue-500/40 flex flex-col items-center justify-center p-1 text-[8px] text-blue-200 text-center">مميز</div>
        </div>
      );
  }
};
