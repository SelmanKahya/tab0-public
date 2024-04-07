import { closeTabs, deleteBookmark } from '@root/src/shared/services/chrome';
import { supabase } from '@root/src/shared/services/supabase';

const getActiveTab = async (): Promise<chrome.tabs.Tab> => {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0]);
    });
  });
};

const insertBookmarks = async (userId: string, type: 'bookmark' | 'tab', tabs: { id: string; url: string }[]) => {
  const bookmarks = tabs.map((tab, index) => ({
    url: tab.url,
    user_id: userId,
    // 1 month from now, adding index so that they don't have the same expires_at
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30 + index).toISOString(),
  }));
  const { error } = await supabase.from('bookmarks').insert(bookmarks);
  if (error) {
    alert(`Error occurred while moving ${type}(s), please try again.`);
    return;
  }
  if (type === 'bookmark') await Promise.all(tabs.map(tab => deleteBookmark(tab.id)));
  else if (type === 'tab') await closeTabs(tabs.map(tab => parseInt(tab.id)));
};

export const insertBookmarksBatch = async (
  userId: string,
  type: 'bookmark' | 'tab',
  tabs: { id: string; url: string }[],
) => {
  // don't close the active tab
  const activeTab = await getActiveTab();
  const skippedTab = tabs.find(tab => tab.id === String(activeTab.id));
  const filteredTabs = tabs.filter(tab => tab.id !== String(activeTab.id));
  const batch = 10;
  for (let i = 0; i < filteredTabs.length; i += batch) {
    await insertBookmarks(userId, type, filteredTabs.slice(i, i + batch));
    await new Promise(resolve => setTimeout(resolve, 4000));
  }

  if (skippedTab) {
    await insertBookmarks(userId, type, [skippedTab]);
  }
};
