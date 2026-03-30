import posthog from 'posthog-js';

// Helper functions for tracking custom events
export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  if (typeof window !== 'undefined') {
    posthog.capture(eventName, properties);
  }
};

// Common event tracking functions
export const trackAppClick = (appId: string, appName: string) => {
  trackEvent('app_clicked', {
    app_id: appId,
    app_name: appName,
  });
};

export const trackAppVisit = (appId: string, appName: string) => {
  trackEvent('app_visit_website', {
    app_id: appId,
    app_name: appName,
  });
};

export const trackSearch = (searchQuery: string, resultsCount: number) => {
  trackEvent('search_performed', {
    query: searchQuery,
    results_count: resultsCount,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

export const trackAppSubmit = (appName: string) => {
  trackEvent('app_submitted', {
    app_name: appName,
  });
};

export default posthog;
