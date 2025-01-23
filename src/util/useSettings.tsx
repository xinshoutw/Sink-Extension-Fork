import { SETTING } from '@src/constant';
import { useLayoutEffect } from 'preact/hooks';
import { darkModeAtom, instanceUrlAtom, passwordAtom } from '@src/util/atom';
import { useAtom } from 'jotai';

export const useSettings = () => {
  const [instanceUrl, setInstanceUrl] = useAtom(instanceUrlAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [isDarkMode, setIsDarkMode] = useAtom(darkModeAtom);

  // 1. On mount, read the settings from local storage and write back to atom
  useLayoutEffect(() => {
    chrome.storage.local.get([SETTING.KEY]).then(item => {
      if (item[SETTING.KEY]) {
        const data = item[SETTING.KEY];
        // Only set atom when there is a value in storage
        if (data[SETTING.INSTANCE_URL] !== undefined) {
          setInstanceUrl(data[SETTING.INSTANCE_URL]);
        }
        if (data[SETTING.PASSWORD] !== undefined) {
          setPassword(data[SETTING.PASSWORD]);
        }
        if (data[SETTING.DARK_MODE] !== undefined) {
          setIsDarkMode(data[SETTING.DARK_MODE]);
        }
      } else {
        console.log('No setting found in storage');
      }
    });
  }, []);

  // 2. Manually update storage
  const updateStorage = async () => {
    if (!instanceUrl || !password) {
      return;
    }

    await chrome.storage.local.set({
      [SETTING.KEY]: {
        [SETTING.INSTANCE_URL]: instanceUrl,
        [SETTING.PASSWORD]: password,
        [SETTING.DARK_MODE]: isDarkMode,
      },
    });
  };

  return {
    instanceUrl,
    setInstanceUrl,
    password,
    setPassword,
    isDarkMode,
    setIsDarkMode,
    updateStorage,
  };
};
