// /src/options/components/Options.tsx
import { useEffect, useState } from 'preact/hooks';
import { useAtom, useAtomValue } from 'jotai';
import ComputerSvg from '@src/assets/computer.svg?react';
import WebSvg from '@src/assets/web.svg?react';
import { SETTING } from '@src/constant';
import { darkModeAtom, linksAtom, optionLoginModalAtom } from '@src/util/atom';
import { JumpLink } from '@src/components/JumpLink';
import { SplitLine } from '@src/components/SplitLine';
import { Footer } from '@src/components/Footer';
import { Modal } from '@src/components/Modal';
import { LoginForm } from './LoginForm';
import { Links } from './Links';
import { Logo } from '@src/assets/img/logo';

const Options = () => {
  const [isHidden, setHidden] = useAtom(optionLoginModalAtom);
  const links = useAtomValue(linksAtom);
  const [instanceUrl, setInstanceUrl] = useState<string | undefined>();
  const [darkMode, setDarkMode] = useAtom(darkModeAtom);

  useEffect(() => {
    chrome.storage.local.get(SETTING.KEY, res => {
      setInstanceUrl(res[SETTING.KEY][SETTING.INSTANCE_URL]);
    });
  }, [isHidden]);

  return (
    <div className='relative flex h-screen w-screen justify-center overflow-y-auto bg-gray-100 p-8 dark:bg-gray-900 dark:text-white'>
      <Modal
        isOpen={!isHidden}
        onClose={() => links && setHidden(true)}
        mask={false}
        maskClosable={!!links}
        showCloseButton={!!links}
      >
        <LoginForm />
      </Modal>

      {/* 右上角 Dark Mode 開關 */}
      <div className='absolute right-8 top-8'>
        <label className='relative inline-flex cursor-pointer items-center'>
          <input
            type='checkbox'
            className='peer sr-only'
            checked={darkMode}
            onChange={() => setDarkMode(!darkMode)}
          />
          <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white' />
        </label>
      </div>

      <div className='m-5 flex max-w-7xl flex-1 flex-col'>
        <h2 className='flex items-center justify-start gap-4 text-center text-2xl font-bold'>
          <Logo />
          Links
          {links && (
            <div className='ml-auto flex items-center'>
              {instanceUrl && (
                <JumpLink link={`${instanceUrl}/dashboard/links`}>
                  <WebSvg className='mr-2 h-9 w-9 cursor-pointer text-gray-600' />
                </JumpLink>
              )}
              <ComputerSvg
                className='h-10 w-10 cursor-pointer text-green-500 hover:opacity-80'
                onClick={() => setHidden(false)}
              />
            </div>
          )}
        </h2>
        <SplitLine />
        <Links />
        <SplitLine />
        <Footer hideSetting hideWeb hideGift />
      </div>
    </div>
  );
};

export default Options;
