import { getTabData } from '@root/src/shared/services/chrome';
import React from 'react';
import Tree from '../components/tree';

const convertTabsToTree = (windows: chrome.windows.Window[], groups: chrome.tabGroups.TabGroup[]) =>
  windows.map((window, index) => {
    const windowNode = {
      id: String(window.id),
      name: `Window ${index + 1}`,
      children: [],
      metadata: {
        type: 'window',
      },
    };

    const groupsInWindow = groups.filter(group => group.windowId === window.id);

    if (groupsInWindow.length === 0) {
      // no groups in this window
      windowNode.children = window.tabs
        .map(tab =>
          tab.url.startsWith('http')
            ? {
                id: String(tab.id),
                name: tab.title,
                metadata: {
                  type: 'tab',
                  url: tab.url,
                },
              }
            : null,
        )
        .filter(Boolean);
    } else {
      // groups in this window
      windowNode.children = groupsInWindow.map(group => {
        const groupNode = {
          id: String(group.id),
          name: group.title,
          children: [],
          metadata: {
            type: 'group',
            color: group.color,
          },
        };

        groupNode.children = window.tabs
          .filter(t => t.groupId === group.id)
          .map(tab =>
            tab.url.startsWith('http')
              ? {
                  id: String(tab.id),
                  name: tab.title,
                  metadata: {
                    type: 'tab',
                    url: tab.url,
                  },
                }
              : null,
          )
          .filter(Boolean);

        return groupNode;
      });

      // some tabs may not be in groups
      windowNode.children.push(
        ...window.tabs
          .filter(t => t.groupId === -1)
          .map(tab =>
            tab.url.startsWith('http')
              ? {
                  id: String(tab.id),
                  name: tab.title,
                  metadata: {
                    type: 'tab',
                    url: tab.url,
                  },
                }
              : null,
          )
          .filter(Boolean),
      );
    }

    return windowNode;
  });

const MoveTabs = ({
  onMoveSubmit,
}: {
  onMoveSubmit: (urls: { id: string; url: string }[], type: 'bookmark' | 'tab') => Promise<void>;
}) => {
  const [loading, setLoading] = React.useState(true);
  const [groups, setGroups] = React.useState([]);

  React.useEffect(() => {
    getTabData().then(({ groups, windows }) => {
      setGroups(convertTabsToTree(windows, groups));
      setLoading(false);
    });
  }, []);

  return loading ? <span>Loading..</span> : <Tree data={groups} onMoveSubmit={onMoveSubmit} type="tab" />;
};

export default MoveTabs;
