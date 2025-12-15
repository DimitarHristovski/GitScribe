// Import all 100 section types
import { SectionType100 } from '../lib/section-types-100';

export type SectionType = SectionType100;

// Design Library - Global Theme Tokens
export type ThemeStyle = 'minimal' | 'playful' | 'corporate' | 'elegant' | 'brutalist';
export type ThemeRadius = 'sm' | 'md' | 'lg' | 'xl' | 'full';
export type ThemeDensity = 'comfortable' | 'cozy' | 'compact';

export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  fontFamily: string;
  style?: ThemeStyle;
  radius?: ThemeRadius;
  density?: ThemeDensity;
}

// Base Section Props - Common design properties for all sections
export interface BaseSectionProps {
  designVariant?: string;
  backgroundStyle?: 'solid' | 'soft' | 'gradient' | 'image';
  align?: 'left' | 'center' | 'right';
  emphasis?: 'low' | 'medium' | 'high';
}

// Strict Section Props Interfaces
export interface HeroProps extends BaseSectionProps {
  title: string;
  subtitle: string;
  eyebrow?: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
  imageUrl?: string;
  layout?: 'title-subtitle-cta' | 'title-cta-subtitle' | 'cta-title-subtitle';
}

export interface FeaturesProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  items: { title: string; description: string; icon?: 'star' | 'zap' | 'shield' | 'check' }[];
}

export interface PricingTier {
  name: string;
  price: string;
  period: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

export interface PricingProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  tiers: PricingTier[];
}

export interface TestimonialsProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  items: { name: string; role: string; quote: string; avatarUrl?: string; rating?: number }[];
}

export interface FAQProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  items: { question: string; answer: string }[];
}

export interface CTAProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
}

export interface ContactProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface GalleryItem {
  title?: string;
  description?: string;
  imageUrl: string;
}

export interface GalleryProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  items: GalleryItem[];
}

export interface AboutProps extends BaseSectionProps {
  title: string;
  subtitle?: string;
  content: string;
  imageUrl?: string;
}

export interface FooterLink {
  text: string;
  href: string;
}

export interface FooterProps extends BaseSectionProps {
  companyName: string;
  tagline?: string;
  links: FooterLink[];
  socialLinks?: { platform: string; url: string }[];
}

// Strict mapping of section types to their props
// For the 11 core sections, we have specific types
// For the other 89 sections, we use BaseSectionProps with additional fields
export type SectionPropsMap = {
  navbar: BaseSectionProps;
  hero: HeroProps;
  features: FeaturesProps;
  pricing: PricingProps;
  testimonials: TestimonialsProps;
  gallery: GalleryProps;
  faq: FAQProps;
  contact: ContactProps;
  cta: CTAProps;
  about: AboutProps;
  footer: FooterProps;
  // All other 89 section types use BaseSectionProps with Record<string, any> for extensibility
  [key: string]: BaseSectionProps & Record<string, any>;
};

export interface Section<T extends SectionType = SectionType> {
  id: string;
  page_id: string;
  type: T;
  order: number;
  props: SectionPropsMap[T];
  created_at?: string;
  updated_at?: string;
}

export interface Page {
  id: string;
  project_id: string;
  path: string;
  title: string;
  order: number;
  sections?: Section[];
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string;
  theme: Theme;
  pages?: Page[];
  iconName?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProjectVersion {
  id: string;
  project_id: string;
  snapshot: {
    project: Project;
    pages: Page[];
    sections: Section[];
  };
  created_at: string;
}

export interface GenerationRequest {
  prompt: string;
  businessType?: string;
  colors?: {
    primary?: string;
    secondary?: string;
  };
  tone?: string;
}

export interface BrandProfile {
  niche: string;
  targetAudience: string;
  tone: string;
  mainCTA: string;
  businessType: string;
}

export interface PagePlan {
  path: string;
  title: string;
  description: string;
  order: number;
}

export interface SectionPlan {
  type: SectionType;
  order: number;
  description: string;
}

// Re-export core documentation types
export * from './core';
