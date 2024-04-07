/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import useStorage from '@src/shared/hooks/useStorage';
import userStorage from '@root/src/shared/storages/UserStorage';
import { supabase } from '@root/src/shared/services/supabase';
import AuthForm from './auth-form';
import MoveTabs from './move-tabs';
import MoveBookmarks from './move-bookmarks';
import Header from '../components/header';
import { insertBookmarksBatch } from './insert-bookmark';
import AddBookmark from './add-bookmark';

const getStatsFromLocalStorage = () => {
  const { unreadCount = 0, expiredCount = 0 } = JSON.parse(localStorage.getItem('tab0_stats1') || '{}');
  return { unreadCount, expiredCount };
};

const setStatsToLocalStorage = (unreadCount: number, expiredCount: number) => {
  localStorage.setItem('tab0_stats1', JSON.stringify({ unreadCount, expiredCount }));
};

const MainScreen = () => {
  const [screen, setScreen] = React.useState<'main' | 'move-tabs' | 'move-bookmarks' | 'add-bookmark'>('main');
  const stats = getStatsFromLocalStorage();
  const [unreadCount, setUnreadCount] = React.useState<false | number>(stats.unreadCount);
  const [expiredCount, setExpiredCount] = React.useState<false | number>(stats.expiredCount);
  const { user } = useStorage(userStorage);
  const onMoveSubmit = async (tabs: { id: string; url: string }[], type: 'bookmark' | 'tab') => {
    if (
      user &&
      window.confirm(
        `Are you sure you want to move ${tabs.length} ${type}(s) to Tab0? They will be ${type === 'tab' ? 'closed' : 'deleted'} - you can read them later in Tab0.`,
      )
    ) {
      await insertBookmarksBatch(user.id, type, tabs);
      await init();
      setScreen('main');
    }
  };

  const init = async () => {
    if (!user) return;
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user?.id) userStorage.logout();
    const { count: unreadCount } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString());
    const { count: expiredCount } = await supabase
      .from('bookmarks')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .lte('expires_at', new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString());

    setUnreadCount(unreadCount);
    setExpiredCount(expiredCount);
    setStatsToLocalStorage(unreadCount, expiredCount);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <Header screen={screen} onGoBack={() => setScreen('main')} />
      <main className="bg-zinc-100 text-zinc-900 flex-1 flex flex-col p-4 overflow-auto">
        {screen === 'main' ? (
          !user ? (
            <AuthForm />
          ) : (
            <>
              <AddBookmark userId={user.id} onCreate={init} />
              {unreadCount === false ? (
                <div className="flex flex-1 justify-center items-center">Loading.. </div>
              ) : unreadCount > 0 ? (
                <div className="inline-flex flex-col justify-center items-center flex-1 justify-center items-center">
                  <div className="flex flex-row justify-center items-center">
                    <p className="rounded border border-1 border-emerald-500 px-4 py-2 mr-2">
                      <span className="text-4xl text-emerald-600">{unreadCount}</span>
                      <span className="text-emerald-600"> unreads</span>
                    </p>
                    <p className="rounded border border-1 border-amber-500 px-4 py-2">
                      <span className="text-4xl text-amber-600">{expiredCount}</span>
                      <span className="text-amber-600"> expiring</span>
                    </p>
                  </div>
                  <a
                    className="mt-4 inline-block cursor-pointer rounded px-2 py-1 bg-zinc-200 hover:bg-zinc-300 border border-zinc-400 text-zinc-700 mt-2 text-md"
                    href="https://tab0.app/feed"
                    target="_blank"
                    rel="noreferrer">
                    Read entries &rarr;
                  </a>
                </div>
              ) : (
                <div className="mt-4 flex-1 flex justify-center items-center flex-col">
                  <p className="text-5xl">🎉</p>
                  <p className="mt-4 text-center font-bold">Great job! You are at tab zero.</p>
                </div>
              )}
              <div className="border-t-1 mt-5 border-zinc-400 w-full">
                <p className="mt-2 text-zinc-500">Move your data into Tab0 so you can read them later.</p>
                <div className="mt-2">
                  <div
                    className="inline-block cursor-pointer rounded px-2 py-1 bg-zinc-100 text-zinc-700 dark:text-zinc-300 border border-zinc-500 hover:bg-zinc-300 mr-2 text-xs"
                    onClick={() => setScreen('move-bookmarks')}>
                    Move bookmarks
                  </div>
                  <div
                    className="inline-block cursor-pointer rounded px-2 py-1 bg-zinc-100 text-zinc-700 dark:text-zinc-300 border border-zinc-500 hover:bg-zinc-300 mr-2 text-xs"
                    onClick={() => setScreen('move-tabs')}>
                    Move tabs
                  </div>
                </div>
              </div>
            </>
          )
        ) : screen === 'move-tabs' ? (
          <MoveTabs onMoveSubmit={onMoveSubmit} />
        ) : screen === 'move-bookmarks' ? (
          <MoveBookmarks onMoveSubmit={onMoveSubmit} />
        ) : null}
      </main>
    </>
  );
};

export default MainScreen;
