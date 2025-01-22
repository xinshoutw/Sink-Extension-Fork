import { useAvatar } from '@src/util/useAvatar';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';

import CopySvg from '@src/assets/copy.svg?react';
import FlashSvg from '@src/assets/flash.svg?react';
import SuccessSvg from '@src/assets/success.svg?react';
import { Svg } from '@src/components/Svg';
import { copyToClipboard, debounce, request } from '@src/util';
import { useSettings } from '@src/util/useSettings';

import { Button } from '@src/components/Button';
import { LoadingIcon } from '@src/components/LoadingIcon';
import { FormError } from '@src/options/components/FormError';
import { ILink } from '@src/util/atom';
import QRModal from '@src/popup/QRModal';

export const NewShortURL = ({
  links,
  refetch,
}: {
  links: ILink[];
  refetch: () => Promise<void>;
}) => {
  const [editLink, setEditLink] = useState<ILink | null>();
  const [isLoging, setIsLoging] = useState(false);
  const [isLoadSlug, setIsLoadSlug] = useState(false);
  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [copied, setCopied] = useState(false);
  const { instanceUrl } = useSettings();
  const [errors, setErrors] = useState<{
    key?: string;
    url?: string;
    login?: string;
  }>({});
  const isEdit = editLink?.slug === key;
  const avatarUrl = useAvatar(url);

  const warning = links.filter(
    link => link.url === url && url !== editLink?.url
  );

  useLayoutEffect(() => {
    setErrors({});
  }, [key, url]);

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
      if (tab?.url) {
        try {
          setUrl(tab.url);
          const theLink = links.find(link => link.url === tab.url);
          setEditLink(theLink);
          theLink && setKey(theLink.slug);
        } catch {}
      }
    });
  }, []);

  // 當 url 有變化，且不是編輯模式時，自動產生 slug
  useEffect(() => {
    if (url && !editLink) {
      // avoid confusion characters:
      //   7, b, c, d, e, g, t, v: similar pronunciation in Chinese
      //   0, 1, l, i, o: similar appearance
      const charSet = '2345689acfhjkmnpqrsuwxyz';
      const encoder = new TextEncoder();
      const data = encoder.encode(url);

      crypto.subtle.digest('SHA-256', data).then(hashBuffer => {
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        let generatedSlug = '';
        // 從 hash 中取前 4 bytes，並依餘數 map 至 charSet
        for (let i = 0; i < 4; i++) {
          const byte = hashArray[i];
          const index = byte % charSet.length;
          generatedSlug += charSet[index];
        }
        setKey(generatedSlug);
      });
    }
  }, [url, editLink]);

  const handleCopy = () => {
    setCopied(true);
    copyToClipboard(`${instanceUrl}/${key}`, () => {
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleKeyChange = (e: any) => setKey(e.target.value);
  const handleUrlChange = (e: any) => setUrl(e.target.value);
  const validateForm = () => {
    const newErrors: { key?: string; url?: string } = {};
    if (!url) {
      newErrors.url = 'Please input url';
    }
    if (!key) {
      newErrors.key = 'Please input short key';
    } else if (!isEdit && links.some(link => link.slug === key)) {
      newErrors.key = 'The slug has existed, please change it!';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = async (e: Event) => {
    if (validateForm()) {
      setIsLoging(true);
      const link = {
        url,
        slug: key,
      };
      request(isEdit ? '/api/link/edit' : '/api/link/create', {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(link),
      })
        .then(data => {
          if (data?.statusCode === 409) {
            setErrors({ key: 'The slug key has been existed!' });
          }
          setEditLink(link as ILink);
          return refetch();
        })
        .catch()
        .finally(() => {
          setIsLoging(false);
        });
    }
  };

  const handleRquest = debounce(
    'slug-request',
    () => {
      setIsLoadSlug(true);
      request(`/api/link/ai?url=${url}`)
        .then(data => {
          data?.slug && setKey(data.slug);
        })
        .catch()
        .finally(() => setIsLoadSlug(false));
    },
    2000
  );

  return (
    <div className='flex w-full flex-col items-center justify-center'>
      <div className='flex w-full items-center justify-center'>
        <Svg
          src={avatarUrl}
          alt={key}
          className='mr-2 h-10 w-10 select-none overflow-hidden rounded-full object-cover shadow-lg'
        />
        <div className='flex-1'>
          <div className='flex items-center justify-start overflow-hidden'>
            <div className='mr-[2px] truncate text-base font-bold leading-5'>
              {`${instanceUrl}/`}
            </div>
            <input
              value={key}
              onInput={handleKeyChange}
              placeholder='[Short Key]'
              className='flex-1 border-b p-0 text-base shadow-sm focus:border-gray-400 focus:outline-none focus:ring-gray-400'
            />
            {copied ? (
              <SuccessSvg className='ml-1 h-6 w-6 cursor-pointer text-green-500' />
            ) : (
              <CopySvg
                onClick={handleCopy}
                className='ml-1 h-6 w-6 cursor-pointer'
                alt='Copy the short link'
              />
            )}
            <QRModal text={`${instanceUrl}/${key}`} />
          </div>
          <FormError error={errors.key} />
        </div>
      </div>
      <div className='mt-1 flex w-full items-center justify-center'>
        <input
          type='text'
          value={url}
          onInput={handleUrlChange}
          placeholder='https://example.com'
          className='flex-1 border-b p-0 px-1 text-base font-thin text-gray-400 shadow-sm focus:border-gray-400 focus:text-gray-700 focus:outline-none focus:ring-gray-400 dark:border-b-gray-700'
        />
        {isLoadSlug ? (
          <LoadingIcon size={24} />
        ) : (
          <FlashSvg
            onClick={() => handleRquest()}
            className='ml-1 h-6 w-6 cursor-pointer'
            alt='Quick generate slug'
          />
        )}
        <QRModal text={url} />
      </div>
      <div className='self-start'>
        {warning.length ? (
          <p className='mt-1 text-xs text-yellow-400'>
            The url has been existed with{' '}
            <b>{warning.map(link => link.slug).join(',')}</b>
          </p>
        ) : null}
        <FormError error={errors.url} />
        <FormError error={errors.login} />
      </div>
      <Button
        className='mt-3 w-full'
        loading={isLoging}
        disabled={editLink?.slug === key && editLink.url === url}
        onClick={e => handleSubmit(e)}
      >
        {isEdit ? 'Edit' : 'Add'}
      </Button>
    </div>
  );
};
