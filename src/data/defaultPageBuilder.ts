import { UserRegistrationData, WebPage, Slide, SlideType } from '../types';
import { DEFAULT_COLOR_SCHEME } from './colorSchemes';

/**
 * Builds a clean, modular WebPage for the user starting with an empty Canva-style canvas slide.
 */
export function buildDefaultPageForUser(user: UserRegistrationData): WebPage {
  const pageTitle =
    user.pageTitle?.trim() ||
    (user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : 'صفحتي الشخصية');

  const initialEmptySlide: Slide = {
    id: `slide-empty-${Date.now()}`,
    type: 'empty',
    name: 'شريحة رئيسية',
    elements: [],
    layoutVariant: 1,
  };

  return {
    id: 'page-main',
    title: pageTitle,
    slug: 'home',
    colorScheme: DEFAULT_COLOR_SCHEME,
    arrangement: 'straight',
    slides: [initialEmptySlide],
  };
}

/**
 * Creates a new clean, empty modular slide for the user.
 */
export function createDefaultSlide(
  type: SlideType = 'empty',
  _user?: UserRegistrationData,
  layoutVariant: number = 1
): Slide {
  const timestamp = Date.now();
  return {
    id: `slide-${type}-${timestamp}`,
    type: 'empty',
    name: 'شريحة جديدة',
    elements: [],
    layoutVariant: typeof layoutVariant === 'number' ? layoutVariant : 1,
  };
}
