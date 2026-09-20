import React, { useState } from 'react';
import {
  Menu,
  X,
  PhoneCall,
  Sparkles,
  ChevronLeft,
  Pencil,
  Home,
  User as UserIcon,
  Briefcase,
  Image as ImageIcon,
  FileText,
  Mail,
  Layers,
  Check
} from 'lucide-react';
import { WebPage, UserRegistrationData, NavbarStyle } from '../../types';

interface UserSiteNavbarProps {
  pages: WebPage[];
  activePageId: string;
  onSelectPage: (pageId: string) => void;
  user: UserRegistrationData;
  isEditMode?: boolean;
  isSelected?: boolean;
  onSelectNavbar?: () => void;
  navbarStyle?: NavbarStyle;
  onUpdateNavbarStyle?: (updates: Partial<NavbarStyle>) => void;
}

// Helper to pick an appropriate contextual icon for a page based on title/slug
const getPageIcon = (title: string, slug: string) => {
  const lower = `${title} ${slug}`.toLowerCase();
  if (lower.includes('رئيس') || lower.includes('home') || lower.includes('main')) return Home;
  if (lower.includes('نحن') || lower.includes('نبذة') || lower.includes('about') || lower.includes('من أنا') || lower.includes('من انا')) return UserIcon;
  if (lower.includes('خدم') || lower.includes('service') || lower.includes('عروض') || lower.includes('مميزات')) return Briefcase;
  if (lower.includes('معرض') || lower.includes('أعمال') || lower.includes('اعمال') || lower.includes('gallery') || lower.includes('portfolio') || lower.includes('صور')) return ImageIcon;
  if (lower.includes('تواصل') || lower.includes('اتصل') || lower.includes('contact') || lower.includes('موقعنا')) return PhoneCall;
  return Sparkles;
};

// Helper to convert hex to rgba with custom alpha
const hexToRgba = (hex: string, alpha: number): string => {
  if (!hex || hex === 'transparent') return 'transparent';
  if (hex.startsWith('rgba')) {
    return hex.replace(/[\d\.]+\)$/g, `${alpha})`);
  }
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  if (c.length === 6) {
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hex;
};

export const UserSiteNavbar: React.FC<UserSiteNavbarProps> = ({
  pages,
  activePageId,
  onSelectPage,
  user,
  isEditMode = false,
  isSelected = false,
  onSelectNavbar,
  navbarStyle = {} as NavbarStyle,
  onUpdateNavbarStyle,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const colorScheme = activePage?.colorScheme;

  const siteBrandTitle =
    user.pageTitle?.trim() ||
    (user.firstName ? `${user.firstName} ${user.lastName}` : 'موقعي المهني');

  const scrollToContact = () => {
    const el = document.getElementById('slide-contact');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Extract layout variant (1 to 10)
  const variant = navbarStyle.layoutVariant || 1;
  const isSticky = navbarStyle.isSticky !== false; // default true

  // Background computation
  const rawBgColor = navbarStyle.backgroundColor || colorScheme?.navbarBg || '#081329';
  const isTransparentBg = navbarStyle.transparent || rawBgColor === 'transparent';
  const bgOpacity = navbarStyle.backgroundOpacity ?? 0.95;
  const computedBgColor = isTransparentBg ? 'transparent' : hexToRgba(rawBgColor, bgOpacity);

  // Backdrop blur
  const backdropBlurClass =
    navbarStyle.backdropBlur === 'none'
      ? ''
      : navbarStyle.backdropBlur === 'sm'
      ? 'backdrop-blur-sm'
      : navbarStyle.backdropBlur === 'lg'
      ? 'backdrop-blur-lg'
      : navbarStyle.backdropBlur === 'xl'
      ? 'backdrop-blur-xl'
      : 'backdrop-blur-md'; // default

  // Border computation
  const borderWidth = navbarStyle.borderWidth ?? (variant === 5 ? 2 : variant === 10 ? 0 : 1);
  const borderStyle = navbarStyle.borderStyle || 'solid';
  const borderColor =
    navbarStyle.borderColor ||
    (colorScheme?.borderColor ? colorScheme.borderColor : 'rgba(255, 255, 255, 0.12)');

  // Border Radius (Corner shapes)
  const borderRadius =
    variant === 2
      ? 9999
      : navbarStyle.borderRadius !== undefined
      ? navbarStyle.borderRadius
      : 0;

  // Lighting Effects
  let lightingClasses = '';
  let lightingStyle: React.CSSProperties = {};
  if (navbarStyle.lightingEffect === 'glow-cyan') {
    lightingStyle = { boxShadow: '0 0 25px rgba(34, 211, 238, 0.35)' };
  } else if (navbarStyle.lightingEffect === 'glow-purple') {
    lightingStyle = { boxShadow: '0 0 25px rgba(168, 85, 247, 0.35)' };
  } else if (navbarStyle.lightingEffect === 'glow-amber') {
    lightingStyle = { boxShadow: '0 0 25px rgba(245, 158, 11, 0.35)' };
  } else if (navbarStyle.lightingEffect === 'neon-border') {
    lightingClasses = 'border-b-2 border-cyan-400';
    lightingStyle = { boxShadow: '0 4px 18px rgba(34, 211, 238, 0.6)' };
  }

  // Shadow Computation
  let shadowClass = '';
  if (navbarStyle.shadow === 'none') {
    shadowClass = 'shadow-none';
  } else if (navbarStyle.shadow === 'medium') {
    shadowClass = 'shadow-[0_12px_30px_rgba(0,0,0,0.35)]';
  } else if (navbarStyle.shadow === 'deep') {
    shadowClass = 'shadow-[0_20px_50px_rgba(0,0,0,0.55)]';
  } else if (navbarStyle.shadow === 'glow') {
    shadowClass = 'shadow-[0_8px_30px_rgba(59,130,246,0.3)]';
  } else {
    shadowClass = 'shadow-md'; // default soft
  }

  // Floating pill layout wrapper adjustments (Variant 2)
  const isPillLayout = variant === 2 || borderRadius >= 50;

  return (
    <div
      id="user-site-navbar-wrapper"
      dir="rtl"
      className={`w-full transition-all duration-300 ${
        isSticky ? 'sticky top-0 z-40' : 'relative z-20'
      } ${isPillLayout ? 'px-3 sm:px-6 py-2.5' : ''}`}
      onClick={() => {
        if (isEditMode) {
          onSelectNavbar?.();
        }
      }}
    >
      <nav
        id="user-site-navbar"
        className={`relative w-full transition-all duration-300 ${
          isPillLayout ? 'max-w-6xl mx-auto' : ''
        } ${backdropBlurClass} ${shadowClass} ${lightingClasses} ${
          isEditMode ? 'cursor-pointer group' : ''
        } ${
          isSelected
            ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-slate-900 shadow-[0_0_20px_rgba(59,130,246,0.4)]'
            : isEditMode
            ? 'hover:ring-2 hover:ring-blue-400/50'
            : ''
        }`}
        style={{
          borderTopWidth: isPillLayout ? `${borderWidth}px` : '0px',
          borderRightWidth: isPillLayout ? `${borderWidth}px` : '0px',
          borderBottomWidth: `${borderWidth}px`,
          borderLeftWidth: isPillLayout ? `${borderWidth}px` : '0px',
          borderStyle: borderStyle,
          borderColor: borderColor,
          borderRadius: isPillLayout ? '9999px' : borderRadius ? `${borderRadius}px` : undefined,
          ...lightingStyle,
        }}
      >
        {/* Isolated Background Layer with Custom Opacity & Image */}
        <div
          id="navbar-background-layer"
          className="absolute inset-0 -z-10 overflow-hidden pointer-events-none transition-all duration-300"
          style={{
            backgroundColor: computedBgColor,
            borderRadius: isPillLayout ? '9999px' : borderRadius ? `${borderRadius}px` : undefined,
          }}
        >
          {navbarStyle.backgroundImage && (
            <div
              className="absolute inset-0 bg-cover bg-center transition-opacity"
              style={{
                backgroundImage: `url(${navbarStyle.backgroundImage})`,
                opacity: navbarStyle.backgroundImageOpacity ?? 0.85,
              }}
            />
          )}
        </div>

        {/* Edit Badge / Hint for user in Edit Mode */}
        {isEditMode && (
          <div
            className={`absolute -top-3.5 right-6 z-50 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-md transition-all ${
              isSelected
                ? 'bg-blue-600 text-white shadow-blue-500/40 ring-1 ring-white/30 scale-105'
                : 'bg-slate-900/90 text-blue-300 border border-blue-500/30 opacity-80 group-hover:opacity-100'
            }`}
          >
            <Pencil className="w-2.5 h-2.5" />
            <span>{isSelected ? 'جارٍ تعديل النافبار ✨' : 'نافبار الموقع (انقر للتعديل)'}</span>
          </div>
        )}

        {/* Navbar Inner Content */}
        <div className={`mx-auto ${isPillLayout ? 'px-4 sm:px-6' : 'max-w-7xl px-4 sm:px-6 lg:px-8'}`}>
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* ================= BRAND / LOGO ================= */}
            {variant === 7 ? (
              // VARIANT 7: Centered Logo -> Right links appear first, logo in center
              <div className="hidden md:flex items-center gap-2 flex-1 justify-start">
                {pages.slice(0, Math.ceil(pages.length / 2)).map((page) => {
                  const isActive = page.id === activePageId;
                  const IconComp = getPageIcon(page.title, page.slug);
                  return (
                    <button
                      key={page.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPage(page.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: colorScheme?.primary || '#2563eb',
                              boxShadow: `0 4px 12px ${colorScheme?.primary || '#2563eb'}55`,
                            }
                          : undefined
                      }
                    >
                      <span>{page.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {/* Standard or Geometric Brand Display */}
            <div
              className={`flex items-center gap-3 ${
                variant === 5
                  ? 'bg-white/5 p-2 rounded-xl border border-white/10'
                  : variant === 7
                  ? 'mx-auto'
                  : ''
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-lg text-lg ${
                  variant === 2 ? 'rounded-full' : variant === 5 ? 'rounded-md' : 'rounded-xl'
                }`}
                style={{
                  background: `linear-gradient(135deg, ${colorScheme?.primary || '#2563eb'}, ${
                    colorScheme?.accent || '#38bdf8'
                  })`,
                }}
              >
                {siteBrandTitle.charAt(0) || 'W'}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight line-clamp-1">
                  {siteBrandTitle}
                </span>
                <span className="text-[11px] text-gray-300 line-clamp-1">
                  {user.specialty || user.professionCategory || 'خدمات تخصصية معتمدة'}
                </span>
              </div>
            </div>

            {/* ================= DESKTOP NAV LINKS ================= */}
            {variant === 7 ? (
              // VARIANT 7: Left Links + CTA
              <div className="hidden md:flex items-center gap-2 flex-1 justify-end">
                {pages.slice(Math.ceil(pages.length / 2)).map((page) => {
                  const isActive = page.id === activePageId;
                  return (
                    <button
                      key={page.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPage(page.id);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'text-white'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: colorScheme?.primary || '#2563eb',
                              boxShadow: `0 4px 12px ${colorScheme?.primary || '#2563eb'}55`,
                            }
                          : undefined
                      }
                    >
                      <span>{page.title}</span>
                    </button>
                  );
                })}
                <button
                  id="user-nav-cta-btn-v7"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToContact();
                  }}
                  className="mr-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer"
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme?.primary || '#2563eb'}, ${
                      colorScheme?.accent || '#38bdf8'
                    })`,
                  }}
                >
                  <PhoneCall className="w-3 h-3" />
                  <span>اتصل بنا</span>
                </button>
              </div>
            ) : variant === 4 ? (
              // VARIANT 4: Compact Icon Dock
              <div className="hidden md:flex items-center gap-2 bg-black/20 p-1.5 rounded-full border border-white/10 shadow-inner">
                {pages.map((page) => {
                  const isActive = page.id === activePageId;
                  const IconComp = getPageIcon(page.title, page.slug);
                  return (
                    <button
                      key={page.id}
                      id={`user-nav-dock-${page.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPage(page.id);
                      }}
                      title={page.title}
                      className={`group relative p-2.5 rounded-full transition-all cursor-pointer ${
                        isActive
                          ? 'text-white shadow-md scale-105'
                          : 'text-gray-300 hover:text-white hover:bg-white/10'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: colorScheme?.primary || '#2563eb',
                              boxShadow: `0 4px 14px ${colorScheme?.primary || '#2563eb'}66`,
                            }
                          : undefined
                      }
                    >
                      <IconComp className="w-4 h-4" />
                      {/* Tooltip */}
                      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                        {page.title}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : variant === 9 ? (
              // VARIANT 9: Segmented Control Tabs
              <div className="hidden md:flex items-center bg-black/30 p-1 rounded-2xl border border-white/15 shadow-inner">
                {pages.map((page) => {
                  const isActive = page.id === activePageId;
                  const IconComp = getPageIcon(page.title, page.slug);
                  return (
                    <button
                      key={page.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPage(page.id);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: colorScheme?.primary || '#2563eb',
                              boxShadow: `0 2px 10px ${colorScheme?.primary || '#2563eb'}55`,
                            }
                          : undefined
                      }
                    >
                      <IconComp className="w-3.5 h-3.5 opacity-80" />
                      <span>{page.title}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              // STANDARD / VARIANT 1, 2, 3, 5, 6, 8, 10
              <div className="hidden md:flex items-center gap-1.5 lg:gap-2">
                {pages.map((page) => {
                  const isActive = page.id === activePageId;
                  const IconComp = getPageIcon(page.title, page.slug);
                  const showIcons = variant === 3 || navbarStyle.navItemStyle === 'both' || navbarStyle.navItemStyle === 'icon';

                  return (
                    <button
                      key={page.id}
                      id={`user-nav-link-${page.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPage(page.id);
                      }}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer relative ${
                        isActive
                          ? 'text-white shadow-md'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      } ${variant === 10 ? 'rounded-none hover:bg-transparent' : ''}`}
                      style={
                        isActive && variant !== 10
                          ? {
                              backgroundColor: colorScheme?.primary || '#2563eb',
                              boxShadow: `0 4px 14px ${colorScheme?.primary || '#2563eb'}55`,
                            }
                          : undefined
                      }
                    >
                      {showIcons && <IconComp className="w-4 h-4 opacity-90" />}
                      {navbarStyle.navItemStyle !== 'icon' && <span>{page.title}</span>}

                      {/* Active line indicator for minimal / neon variants */}
                      {isActive && (
                        <span
                          className={`absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full ${
                            variant === 6
                              ? 'w-full h-0.5 bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                              : variant === 10
                              ? 'w-6 h-0.5 bg-blue-500'
                              : 'w-3 h-1'
                          }`}
                          style={{
                            backgroundColor:
                              variant === 6
                                ? undefined
                                : colorScheme?.accent || '#38bdf8',
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* ================= CTA BUTTON & MOBILE TOGGLE ================= */}
            {variant !== 7 && (
              <div className="flex items-center gap-2.5">
                <button
                  id="user-nav-cta-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    scrollToContact();
                  }}
                  className={`hidden sm:inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white shadow-lg transition-transform active:scale-95 cursor-pointer ${
                    isPillLayout ? 'rounded-full' : variant === 5 ? 'rounded-md' : 'rounded-xl'
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${colorScheme?.primary || '#2563eb'}, ${
                      colorScheme?.accent || '#38bdf8'
                    })`,
                  }}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>تواصل معنا</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  id="user-nav-mobile-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMobileMenuOpen(!mobileMenuOpen);
                  }}
                  className="md:hidden p-2 rounded-xl bg-white/5 text-gray-200 hover:text-white border border-white/10"
                  aria-label="القائمة"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t px-4 py-4 space-y-2 backdrop-blur-xl shadow-2xl"
            style={{
              backgroundColor: computedBgColor || 'rgba(6, 14, 32, 0.98)',
              borderColor: borderColor,
            }}
          >
            <div className="text-xs font-bold text-gray-400 mb-2 px-2">صفحات الموقع:</div>
            {pages.map((page) => {
              const isActive = page.id === activePageId;
              const IconComp = getPageIcon(page.title, page.slug);
              return (
                <button
                  key={page.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPage(page.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isActive ? 'text-white' : 'text-gray-300 hover:bg-white/5'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: colorScheme?.primary || '#2563eb' }
                      : undefined
                  }
                >
                  <div className="flex items-center gap-2">
                    <IconComp className="w-4 h-4 opacity-80" />
                    <span>{page.title}</span>
                  </div>
                  {isActive && <ChevronLeft className="w-4 h-4" />}
                </button>
              );
            })}
            <div className="pt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  scrollToContact();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${colorScheme?.primary || '#2563eb'}, ${
                    colorScheme?.accent || '#38bdf8'
                  })`,
                }}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>تواصل معنا مباشرة</span>
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
};
