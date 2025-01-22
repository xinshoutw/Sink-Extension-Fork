import { JSX, render } from 'preact';
import './styles/index.css';
import { Provider, useAtomValue } from 'jotai';
import { darkModeAtom } from '@src/util/atom';
import { useEffect } from 'preact/hooks';

const DarkModeWrapper = ({ children }: { children: JSX.Element }) => {
  const isDark = useAtomValue(darkModeAtom);
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);
  return children;
};

export const initElement = (elem: JSX.Element) => {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) throw new Error('Can not find AppContainer');

  render(
    <Provider>
      <DarkModeWrapper>{elem}</DarkModeWrapper>
    </Provider>,
    appContainer
  );
};
