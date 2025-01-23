import { JSX, render } from 'preact';
import './styles/index.css';
import { Provider, useAtom } from 'jotai';
import { darkModeAtom } from '@src/util/atom';
import { useEffect } from 'preact/hooks';
import { useSettings } from '@src/util/useSettings';

const DarkModeWrapper = ({ children }: { children: JSX.Element }) => {
  const [isDark] = useAtom(darkModeAtom);
  const { updateStorage } = useSettings();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      console.log('dark');
    } else {
      document.documentElement.classList.remove('dark');
      console.log('light');
    }
    updateStorage();
  }, [isDark]);

  return children;
};

export const initElement = (elem: JSX.Element) => {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) throw new Error('Can not find #app-container');

  render(
    <Provider>
      <DarkModeWrapper>{elem}</DarkModeWrapper>
    </Provider>,
    appContainer
  );
};
