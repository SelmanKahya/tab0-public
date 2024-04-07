/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { supabase } from '@root/src/shared/services/supabase';
import React from 'react';

const getCurrentTabUrl = async (): Promise<string> => {
  return new Promise(resolve => {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      resolve(tabs[0].url);
    });
  });
};

function validateUrl(value) {
  return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(
    value,
  );
}

const AddBookmark = ({ userId, onCreate }: { userId: string; onCreate: () => void }) => {
  const [url, setUrl] = React.useState<string>('');
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [message, setMessage] = React.useState<string>('');
  const init = async () => {
    const u = await getCurrentTabUrl();
    if (validateUrl(u)) setUrl(u);
  };
  const onSubmit = async () => {
    if (isSubmitting) return;

    const u = url.startsWith('http') ? url : `https://${url}`;
    if (!validateUrl(u)) {
      alert('Link is not valid. Please use the following format: https://example.com');
      return;
    }

    setMessage('');
    setIsSubmitting(true);
    const { error } = await supabase.from('bookmarks').insert({
      url: u,
      user_id: userId,
      // 1 month from now, adding index so that they don't have the same expires_at
      expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    });
    if (error) {
      setIsSubmitting(false);
      alert('Error adding bookmark, please try again later.');
      return;
    }
    setUrl('');
    setMessage('Link saved!');
    await onCreate();
    setIsSubmitting(false);
  };

  React.useEffect(() => {
    init();
  }, []);

  return (
    <>
      <div className="flex flex-row items-center ">
        <input
          type="text"
          placeholder="Paste URL"
          onChange={e => setUrl(e.target.value)}
          value={url}
          className="border border-zinc-900 p-2 w-full h-[32px] mr-2 text-sm text-gray-900 dark:text-gray-900"
          onKeyDown={e => {
            if (e.key === 'Enter') {
              onSubmit();
            }
          }}
        />
        <div
          onClick={onSubmit}
          className="flex items-center justify-center cursor-pointer rounded px-2 py-1 bg-zinc-900 hover:bg-zinc-700 border border-zinc-900 text-zinc-100 text-md font-bold h-[32px] w-[160px]">
          {isSubmitting ? 'Saving..' : 'Save link'}
        </div>
      </div>
      <p className="text-gray-500 text-2xs mt-1">{message || <span>&nbsp;</span>}</p>
    </>
  );
};

export default AddBookmark;
