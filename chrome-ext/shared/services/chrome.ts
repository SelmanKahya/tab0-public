export const getBookmarkTree = (): Promise<chrome.bookmarks.BookmarkTreeNode[]> =>
  new Promise(resolve => {
    chrome.bookmarks.getTree(tree => {
      resolve(tree);
    });
  });

export const getTabData = (): Promise<{
  windows: chrome.windows.Window[];
  groups: chrome.tabGroups.TabGroup[];
}> =>
  new Promise(resolve => {
    chrome.windows.getAll({ populate: true }, windows => {
      chrome.tabGroups.query({}, groups => {
        resolve({ windows, groups });
      });
    });
  });

export const closeTabs = (tabIds: number[]) =>
  new Promise(resolve => {
    chrome.tabs.remove(tabIds, () => {
      resolve(true);
    });
  });

export const deleteBookmark = (id: string) =>
  new Promise(resolve => {
    chrome.bookmarks.remove(id, () => {
      resolve(true);
    });
  });
