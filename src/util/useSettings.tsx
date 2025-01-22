import { SETTING } from '@src/constant';
import { useLayoutEffect, useState } from 'preact/hooks';

export const useSettings = () => {
  const [instanceUrl, setInstanceUrl] = useState('');
  const [password, setPassword] = useState('');
  const [darkMode, setDarkMode] = useState(true);

  useLayoutEffect(() => {
    chrome.storage.local.get([SETTING.KEY]).then(item => {
      if (item[SETTING.KEY]) {
        setInstanceUrl(item[SETTING.KEY][SETTING.INSTANCE_URL] || '');
        setPassword(item[SETTING.KEY][SETTING.PASSWORD] || '');
        setDarkMode(item[SETTING.KEY][SETTING.DARK_MODE] || true);
      }
    });
  }, []);

  return {
    instanceUrl,
    setInstanceUrl,
    password,
    setPassword,
    darkMode,
    setDarkMode,
    updateStorage: () =>
      chrome.storage.local.set({
        [SETTING.KEY]: {
          [SETTING.INSTANCE_URL]: instanceUrl,
          [SETTING.PASSWORD]: password,
          [SETTING.DARK_MODE]: darkMode,
        },
      }),
  };
};
