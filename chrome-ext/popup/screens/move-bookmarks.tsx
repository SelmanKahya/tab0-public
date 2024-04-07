import React from 'react';
import Tree from '../components/tree';
import { getBookmarkTree } from '@root/src/shared/services/chrome';

const convertBookmarksToTree = (tree: chrome.bookmarks.BookmarkTreeNode[]) =>
  tree
    .map(node => {
      // id: string,
      // name: string,
      // metadata: {
      //   type: 'folder' | 'bookmark',
      //   url?: string,
      // },

      if (!node.url && !node.children?.length) return;

      const nodeData = {
        id: String(node.id),
        name: node.title,
        children: [],
        metadata: {
          type: node.url ? 'tab' : 'group',
          url: node.url,
        },
      };

      if (node.children) {
        nodeData.children = convertBookmarksToTree(node.children);
      }

      return nodeData;
    })
    .filter(Boolean);

const MoveBookmarks = ({
  onMoveSubmit,
}: {
  onMoveSubmit: (urls: { id: string; url: string }[], type: 'bookmark' | 'tab') => Promise<void>;
}) => {
  const [loading, setLoading] = React.useState(true);
  const [bookmarks, setBookmarks] = React.useState([]);

  React.useEffect(() => {
    getBookmarkTree().then(tree => {
      setBookmarks(convertBookmarksToTree(tree[0].children));
      setLoading(false);
    });
  }, []);

  return loading ? <span>Loading..</span> : <Tree data={bookmarks} onMoveSubmit={onMoveSubmit} type="bookmark" />;
};

export default MoveBookmarks;
