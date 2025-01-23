import giftSvg from '@src/assets/gift.svg';
import githubSvg from '@src/assets/github.svg';
import settingSvg from '@src/assets/setting.svg';
import webSvg from '@src/assets/web.svg';
import { JumpLink } from '@src/components/JumpLink';
import { MY_GITHUB } from '@src/constant';
import { instanceUrlAtom } from '@src/util/atom';
import { useAtomValue } from 'jotai';

export const Footer = ({
  hideSetting,
  hideWeb,
  hideGithub,
  hideGift,
}: {
  hideSetting?: boolean;
  hideWeb?: boolean;
  hideGift?: boolean;
  hideGithub?: boolean;
}) => {
  const optionsUrl = chrome.runtime.getURL('src/options/index.html');
  const instanceUrl = useAtomValue(instanceUrlAtom);
  return (
    <div className='mb-2 mt-5 flex w-full items-center justify-between'>
      <div className='flex items-center justify-start gap-2'>
        {!hideSetting && (
          <JumpLink
            link={optionsUrl}
            svg={settingSvg}
            alt='Open the setting page'
          />
        )}
        {!hideWeb && (
          <JumpLink link={instanceUrl} svg={webSvg} alt='Go to my Sink' />
        )}
        {!hideGithub && (
          <JumpLink link={MY_GITHUB} svg={githubSvg} alt='Go to Github' />
        )}
        {!hideGift && (
          <JumpLink link={MY_GITHUB} svg={giftSvg} alt='Give a coffee' />
        )}
      </div>
      <p className='text-right text-xs text-gray-500'>
        Create by{' '}
        <a className='text-blue-500' href={MY_GITHUB}>
          zhuzhuyule
        </a>
      </p>
    </div>
  );
};
