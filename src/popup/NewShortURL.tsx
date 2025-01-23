import { useAvatar } from '@src/util/useAvatar';
import { useEffect, useLayoutEffect, useState } from 'preact/hooks';

import CopySvg from '@src/assets/copy.svg?react';
import SuccessSvg from '@src/assets/success.svg?react';
import { copyToClipboard, debounce, request } from '@src/util';

import { Button } from '@src/components/Button';
import { FormError } from '@src/options/components/FormError';
import { ILink, instanceUrlAtom } from '@src/util/atom';
import QRModal from '@src/popup/QRModal';
import { useAtomValue } from 'jotai/index';

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
  const instanceUrl = useAtomValue(instanceUrlAtom);
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

  // When the url changes, and it is not in edit mode, automatically generate the slug
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
        // take the first 4 bytes from the hash, map to charSet by remainder
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
      const link = { url, slug: key };

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
      <div className=''>
        <div className='flex items-center rounded-md bg-gray-100 p-3 dark:bg-gray-800'>
          <div className='flex flex-1 items-center space-x-2'>
            <div className='whitespace-nowrap text-base font-bold leading-5'>
              {`${instanceUrl}/`}
            </div>
            <input
              value={key}
              onInput={handleKeyChange}
              placeholder={key || '[Short Key]'}
              className='flex-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-sm shadow-sm focus:border-gray-600 focus:outline-none focus:ring-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
            />
          </div>

          {/* Copy / QRModal */}
          <div className='ml-2 flex items-center space-x-2'>
            {copied ? (
              <SuccessSvg className='h-6 w-6 cursor-pointer text-green-500' />
            ) : (
              <CopySvg
                onClick={handleCopy}
                className='h-6 w-6 cursor-pointer'
                alt='Copy the short link'
              />
            )}
            <QRModal text={`${instanceUrl}/${key}`} />
          </div>
        </div>
        <FormError error={errors.key} />

        <div className='flex w-full items-center rounded-md bg-gray-100 p-3 dark:bg-gray-800'>
          <input
            type='text'
            value={url}
            onInput={handleUrlChange}
            placeholder='https://example.com'
            className='flex-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-sm shadow-sm focus:border-gray-600 focus:outline-none focus:ring-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
          />
          <div className='ml-2 flex items-center space-x-2'>
            <QRModal text={url} />
          </div>
        </div>
        <div className='self-start'>
          {warning.length > 0 && (
            <p className='mt-1 text-xs text-yellow-400'>
              The url has been existed with{' '}
              <b>{warning.map(link => link.slug).join(',')}</b>
            </p>
          )}
          <FormError error={errors.url} />
          <FormError error={errors.login} />
        </div>

        <div className='text-center'>
          <Button
            className='w-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300'
            loading={isLoging}
            disabled={editLink?.slug === key && editLink.url === url}
            onClick={e => handleSubmit(e)}
          >
            {isEdit ? 'Edit' : 'Add'}
          </Button>
        </div>
      </div>
    </div>
  );
};
