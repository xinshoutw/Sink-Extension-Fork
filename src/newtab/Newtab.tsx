// /src/newtab/Newtab.tsx
import { Logo } from '@src/assets/img/logo';
import { useState } from 'preact/hooks';

const Newtab = () => {
  const [switchOn, setSwitchOn] = useState(true);

  return (
    <div className='relative flex h-screen flex-col justify-center bg-[#673ab8] p-8 text-center text-lg'>
      <div className='absolute right-4 top-4'>
        <label className='relative inline-flex cursor-pointer items-center'>
          <input
            type='checkbox'
            className='peer sr-only'
            checked={switchOn}
            onChange={() => setSwitchOn(!switchOn)}
          />
          <div className='peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-checked:after:border-white' />
        </label>
      </div>

      <Logo />
      <p className='text-white'>Hello Vite + Preact!</p>
      <p className='text-white'>
        <a
          className='border-b-2'
          href='https://preactjs.com/'
          target='_blank'
          rel='noopener noreferrer'
        >
          Learn Preact
        </a>
      </p>
      <p data-testid='newtab_text' className='p-6 text-3xl text-purple-400'>
        New tab page
      </p>

      <p className='text-white'>
        {switchOn ? 'Switch is ON' : 'Switch is OFF'}
      </p>
    </div>
  );
};

export default Newtab;
