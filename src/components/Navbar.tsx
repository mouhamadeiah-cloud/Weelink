import React from 'react';
import { Cloud, Loader2, Monitor, Tablet, Smartphone, Eye, Pen } from 'lucide-react';
import { AppPage } from '../types';

interface NavbarProps {
  currentPage: AppPage;
  onNavigate: (page: AppPage) => void;
  workshopControls?: {
    viewport: 'desktop' | 'tablet' | 'mobile';
    setViewport: (v: 'desktop' | 'tablet' | 'mobile') => void;
    isCloudSaving: boolean;
    lastCloudSavedAt: Date | null;
    handleSaveToCloud: () => Promise<void> | void;
    isPageEditMode: boolean;
    togglePageEditMode: () => void;
  } | null;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPage, onNavigate, workshopControls }) => {
  return (
    <header
      id="main-navbar"
      className="w-full h-[68px] sticky top-0 z-50 px-6 py-3 md:px-12 flex items-center justify-between border-b border-white/5 bg-[#060b19]/95 backdrop-blur-md"
    >
      {/* Right side: Platform Logo / Brand Name & Viewport/Save Controls */}
      <div className="flex items-center gap-4 sm:gap-6">
        <button
          id="navbar-brand-btn"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg p-1"
          aria-label="منصة weelink - الصفحة الرئيسية"
        >
          <span className="text-2xl md:text-3xl font-black tracking-tight text-white font-['Tajawal',sans-serif] lowercase">
            weelink
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_10px_#f97316] group-hover:scale-125 transition-transform" />
        </button>

        {/* Viewport Switcher & Cloud Sync moved to main top bar */}
        {currentPage === 'workshop' && workshopControls && (
          <div className="hidden md:flex items-center gap-3 border-r border-white/10 pr-4 sm:pr-6 mr-2 sm:mr-4">
            {/* Toggle Edit/Preview Mode */}
            <button
              type="button"
              id="navbar-toggle-edit-mode-btn"
              onClick={workshopControls.togglePageEditMode}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none active:scale-95 ${
                workshopControls.isPageEditMode
                  ? 'bg-blue-600 border-blue-500 text-white hover:bg-blue-500 shadow-sm'
                  : 'bg-orange-500 border-orange-400 text-white hover:bg-orange-400 shadow-sm shadow-orange-500/20'
              }`}
              title={
                workshopControls.isPageEditMode
                  ? 'انقر للمعاينة الكاملة للموقع (Preview)'
                  : 'العودة لوضع التعديل وتحرير العناصر (Edit)'
              }
            >
              {workshopControls.isPageEditMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 text-white" />
                  <span>معاينة الموقع</span>
                </>
              ) : (
                <>
                  <Pen className="w-3.5 h-3.5 text-white animate-pulse" />
                  <span>الرجوع للتعديل</span>
                </>
              )}
            </button>

            {/* Cloud Save Button */}
            <button
              type="button"
              id="navbar-cloud-save-btn"
              onClick={workshopControls.handleSaveToCloud}
              disabled={workshopControls.isCloudSaving}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                workshopControls.lastCloudSavedAt
                  ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              title={
                workshopControls.lastCloudSavedAt
                  ? `محفوظ في السحابة (${workshopControls.lastCloudSavedAt.toLocaleTimeString('ar-SY')})`
                  : 'حفظ المشروع في Firebase Firestore'
              }
            >
              {workshopControls.isCloudSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                  <span>جارِ الحفظ...</span>
                </>
              ) : workshopControls.lastCloudSavedAt ? (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                  <span>محفوظ</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-gray-400" />
                  <span>حفظ</span>
                </>
              )}
            </button>

            {/* Viewport switcher */}
            <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10">
              <button
                onClick={() => workshopControls.setViewport('desktop')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  workshopControls.viewport === 'desktop'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="عرض كمبيوتر (سطح المكتب)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => workshopControls.setViewport('tablet')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  workshopControls.viewport === 'tablet'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="عرض جهاز لوحي (تابلت)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => workshopControls.setViewport('mobile')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  workshopControls.viewport === 'mobile'
                    ? 'bg-orange-600 text-white shadow'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
                title="عرض هاتف محمول"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Links: "الرئيسية" and "ورشة العمل" only */}
      <div className="flex items-center gap-3">
        {/* Mobile-only compact Viewport Switcher & Save (to make sure it works on all viewports) */}
        {currentPage === 'workshop' && workshopControls && (
          <div className="flex md:hidden items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/10">
            {/* Mobile Toggle Edit/Preview Mode */}
            <button
              onClick={workshopControls.togglePageEditMode}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                workshopControls.isPageEditMode ? 'text-blue-400' : 'text-orange-400 animate-pulse'
              }`}
              title={workshopControls.isPageEditMode ? 'معاينة الموقع' : 'الرجوع للتعديل'}
            >
              {workshopControls.isPageEditMode ? (
                <Eye className="w-4 h-4" />
              ) : (
                <Pen className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={workshopControls.handleSaveToCloud}
              disabled={workshopControls.isCloudSaving}
              className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                workshopControls.lastCloudSavedAt ? 'text-emerald-400' : 'text-gray-400'
              }`}
            >
              {workshopControls.isCloudSaving ? (
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
              ) : (
                <Cloud className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => {
                const next: Record<'desktop' | 'tablet' | 'mobile', 'desktop' | 'tablet' | 'mobile'> = {
                  desktop: 'tablet',
                  tablet: 'mobile',
                  mobile: 'desktop',
                };
                workshopControls.setViewport(next[workshopControls.viewport]);
              }}
              className="p-1.5 rounded-lg text-xs text-orange-400 transition-all cursor-pointer"
              title="تغيير حجم المعاينة"
            >
              {workshopControls.viewport === 'desktop' ? (
                <Monitor className="w-4 h-4" />
              ) : workshopControls.viewport === 'tablet' ? (
                <Tablet className="w-4 h-4" />
              ) : (
                <Smartphone className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        <nav id="navbar-links" className="flex items-center gap-2 sm:gap-4 md:gap-6">
          <button
            id="nav-link-home"
            onClick={() => onNavigate('home')}
            className={`px-4 py-2 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === 'home'
                ? 'bg-white/10 text-white shadow-sm border border-white/10'
                : 'text-gray-300 hover:text-white hover:bg-white/5'
            }`}
          >
            الرئيسية
          </button>

          <button
            id="nav-link-workshop"
            onClick={() => onNavigate('workshop')}
            className={`px-4 py-2 rounded-xl text-sm md:text-base font-semibold transition-all duration-200 cursor-pointer ${
              currentPage === 'workshop'
                ? 'bg-orange-600/30 text-orange-200 border border-orange-500/40'
                : 'text-gray-300 hover:text-orange-300 hover:bg-white/5'
            }`}
          >
            ورشة العمل
          </button>
        </nav>
      </div>
    </header>
  );
};
