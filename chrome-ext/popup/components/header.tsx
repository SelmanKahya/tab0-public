/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react';
import moon from '@assets/img/moon.svg';
import sun from '@assets/img/sun.svg';
import useStorage from '@src/shared/hooks/useStorage';
import exampleThemeStorage from '@src/shared/storages/exampleThemeStorage';
import userStorage from '@root/src/shared/storages/UserStorage';
import { supabase } from '@root/src/shared/services/supabase';

const Header = ({ screen, onGoBack }: { screen: string; onGoBack: () => void }) => {
  const theme = useStorage(exampleThemeStorage);
  const { user } = useStorage(userStorage);
  const onLogout = async () => {
    await supabase.auth.signOut();
    userStorage.logout();
  };

  return (
    <header className="bg-zinc-900 text-zinc-100 flex flex-row justify-between items-center p-2">
      {/* <img src={logo} className="w-4 h-4" alt="logo" /> */}
      <div className="text-sm font-bold text-zinc-100">
        <a href="https://tab0.app" target="_blank" rel="noreferrer">
          Tab0
        </a>
        {screen !== 'main' && (
          <span className="cursor-pointer opacity-40 hover:opacity-100 ml-2" onClick={onGoBack}>
            &larr; Back
          </span>
        )}
      </div>
      <div className="flex flex-row items-center">
        <div className="text-zinc-100 cursor-pointer" onClick={exampleThemeStorage.toggle}>
          {theme === 'light' ? (
            <img
              src={moon}
              className="w-4 h-4"
              alt="moon"
              style={{
                filter: 'invert(100%)',
              }}
            />
          ) : (
            <img src={sun} className="w-4 h-4" alt="sun" />
          )}
        </div>

        {user && (
          <div className="text-zinc-100 cursor-pointer ml-3" onClick={onLogout}>
            Logout
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
