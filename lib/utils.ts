import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Slugify function to convert app names to URL-friendly slugs
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

// Build external app URL with UTM tracking and ref parameters
export function buildTrackedAppUrl(appUrl: string, appName: string): string {
  try {
    const url = new URL(appUrl);
    const appSlug = slugify(appName);
    
    // Add tracking parameters
    url.searchParams.set('ref', 'sportsdeck.io');
    url.searchParams.set('utm_source', 'sportsdeck');
    url.searchParams.set('utm_medium', 'directory');
    url.searchParams.set('utm_campaign', 'discovered_on_sportsdeck');
    url.searchParams.set('utm_content', appSlug);
    
    return url.toString();
  } catch (error) {
    // If URL is invalid, return original with basic ref parameter
    console.error('Invalid URL:', appUrl, error);
    return `${appUrl}${appUrl.includes('?') ? '&' : '?'}ref=sportsdeck.io`;
  }
}

