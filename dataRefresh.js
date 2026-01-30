// src/utils/dataRefresh.js
export const forceGlobalRefresh = (type = 'all') => {
  // Dispatch custom event for immediate refresh
  window.dispatchEvent(new CustomEvent('forceDataRefresh', { 
    detail: { type } 
  }));
  
  // Also dispatch specific events
  if (type === 'all' || type === 'records') {
    window.dispatchEvent(new CustomEvent('refreshRecords'));
  }
  
  if (type === 'all' || type === 'requests') {
    window.dispatchEvent(new CustomEvent('refreshRequests'));
  }
  
  // Force a page refresh after a short delay to ensure data is visible
  setTimeout(() => {
    console.log('Forcing page refresh to show updated data');
    window.location.reload();
  }, 2000);
};

export const refreshWithoutReload = (type = 'all') => {
  // Just dispatch events without page reload
  window.dispatchEvent(new CustomEvent('forceDataRefresh', { 
    detail: { type } 
  }));
  
  if (type === 'all' || type === 'records') {
    window.dispatchEvent(new CustomEvent('refreshRecords'));
  }
  
  if (type === 'all' || type === 'requests') {
    window.dispatchEvent(new CustomEvent('refreshRequests'));
  }
};