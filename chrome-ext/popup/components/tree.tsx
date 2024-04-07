/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';

type Node = {
  id: string;
  name: string;
  children?: Node[];
  metadata: {
    type: string;
    url?: string;
  };
};

const Tree = ({
  data,
  onMoveSubmit,
  type,
}: {
  data: Node[];
  onMoveSubmit: (tabs: { id: string; url: string }[], type: 'bookmark' | 'tab') => void;
  type: 'tab' | 'bookmark';
}) => {
  console.log(data);

  const [selectMap, setSelectMap] = React.useState<{ [key: string]: boolean }>({});
  const [expandedMap, setExpandedMap] = React.useState<{ [key: string]: boolean }>({});
  const onItemSelect = (row: Node) => {
    // recursively select all children
    const newSelectedUrlMap = { ...selectMap };
    const select = !newSelectedUrlMap[row.id];
    const selectChildren = (node: Node) => {
      newSelectedUrlMap[node.id] = select;
      node.children?.forEach(selectChildren);
    };
    selectChildren(row);
    setSelectMap(newSelectedUrlMap);
  };
  const updateAllCheckbox = (selected: boolean) => {
    const newSelectedUrlMap = { ...selectMap };
    data.forEach(window => {
      const selectChildren = (node: Node) => {
        newSelectedUrlMap[node.id] = selected;
        node.children?.forEach(selectChildren);
      };
      selectChildren(window);
    });
    setSelectMap(newSelectedUrlMap);
  };
  const getSelectedTabs = React.useMemo(() => {
    const selectedTabs: { id: string; url: string }[] = [];
    data.forEach(window => {
      const selectChildren = (node: Node) => {
        if (selectMap[node.id] && node.metadata.type === 'tab' && node.metadata.url) {
          selectedTabs.push({ id: node.id, url: node.metadata.url });
        }
        node.children?.forEach(selectChildren);
      };
      selectChildren(window);
    });
    return selectedTabs;
  }, [data, selectMap]);

  const renderRow = (row: Node, level: number) => {
    return (
      <>
        <div className={`flex flex-row w-full items-center ${level === 1 ? 'pl-4' : level === 2 ? 'pl-8' : ''}`}>
          <div
            className={`flex flex-row items-center mb-2 cursor-pointer ${row.metadata.type === 'window' || row.metadata.type === 'group' ? 'font-bold' : ''}`}>
            <input type="checkbox" id={`r-${row.id}`} checked={selectMap[row.id]} onClick={() => onItemSelect(row)} />
            <label
              htmlFor={`${row.metadata.type}-${row.id}`}
              className="ml-2 cursor-pointer"
              onClick={() => {
                if (row.metadata.type === 'tab') onItemSelect(row);
                // expand/collapse
                else {
                  setExpandedMap(v => ({ ...v, [row.id]: !v[row.id] }));
                }
              }}>
              {row.metadata.type === 'group' ? (type === 'tab' ? 'Group: ' : 'Folder: ') : ''}
              {row.name.length > 40 ? row.name.slice(0, 40) + '...' : row.name}
            </label>
          </div>
        </div>
        {expandedMap[row.id] && row.children?.map(r => renderRow(r, level + 1))}
      </>
    );
  };

  if (!data) return null;

  return (
    <div className="relative flex-1 overflow-auto pb-8 px-1">
      <div className="flex justify-between mb-4 pb-4 border-b-1 border-gray-300 ">
        <span className="text-xxs">
          Selected {type === 'tab' ? 'tabs' : 'bookmarks'} will be {type === 'tab' ? 'closed' : 'deleted'} from your
          browser and moved to Tab0.
        </span>
        <div
          className={`cursor-pointer rounded px-4 py-2 bg-zinc-900 hover:bg-zinc-700 border border-zinc-900 text-zinc-100 text-md font-bold w-[200px] ml-4 text-center ${getSelectedTabs.length > 0 ? '' : 'opacity-60'}`}
          onClick={() => onMoveSubmit(getSelectedTabs, type)}>
          Move{getSelectedTabs.length > 0 && ` (${getSelectedTabs.length})`} &rarr;
        </div>
      </div>
      {data.map(window => (
        <div key={window.id} className="mb-1">
          {renderRow(window, 0)}
        </div>
      ))}

      <div className="fixed bottom-0 left-0 right-0 bg-gray-100 p-1 border-t-1 border-gray-300 flex justify-center">
        <span
          className="text-xs text-blue-500 cursor-pointer mr-2"
          onClick={() => {
            setExpandedMap(v => {
              const newMap: { [key: string]: boolean } = {};
              data.forEach(window => {
                newMap[window.id] = true;
                if (window.children) window.children.forEach(tab => (newMap[tab.id] = true));
              });
              return newMap;
            });
          }}>
          Expand
        </span>
        <span
          className="text-xs text-blue-500 cursor-pointer mr-2"
          onClick={() => {
            setExpandedMap({});
          }}>
          Collapse
        </span>
        <span className="text-xs text-blue-500 cursor-pointer mr-2" onClick={() => updateAllCheckbox(true)}>
          Select all
        </span>
        <span className="text-xs text-blue-500 cursor-pointer" onClick={() => updateAllCheckbox(false)}>
          Deselect all
        </span>
      </div>
    </div>
  );
};

export default Tree;
