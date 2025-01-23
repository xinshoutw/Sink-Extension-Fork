import { SplitLine } from '@src/components/SplitLine';
import { copyToClipboard, debounce } from '@src/util';
import { instanceUrlAtom, linksAtom } from '@src/util/atom';
import { useAtomValue } from 'jotai';
import { useState } from 'preact/hooks';

export const Links = () => {
  const links = useAtomValue(linksAtom);
  const instanceUrl = useAtomValue(instanceUrlAtom);
  const [text, setText] = useState('');
  const [sort, setSort] = useState('CREATE');

  if (!links) return null;
  return (
    <div>
      <SplitLine />
      <div className='mb-3 flex items-center gap-2 dark:bg-gray-800 dark:text-gray-200'>
        <select
          value={sort}
          onChange={e => setSort(e.currentTarget.value)}
          className='rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-sm shadow-sm focus:border-gray-600 focus:outline-none focus:ring-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
        >
          <option value='CREATE'>create date</option>
          <option value='UPDATE'>update date</option>
          <option value='SLUG'>slug</option>
          <option value='SLUG_LENGTH'>slug length</option>
        </select>
        <input
          type='text'
          placeholder='Filter by slug'
          value={text}
          onInput={e =>
            debounce(
              'slug-filter',
              str => setText(str),
              500
            )(e.currentTarget.value)
          }
          className='flex-1 rounded-md border border-gray-300 bg-gray-100 px-2 py-1 text-sm shadow-sm focus:border-gray-600 focus:outline-none focus:ring-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200'
        />
      </div>
      {links
        .filter(link => link.slug.includes(text))
        .sort((link1, link2) => {
          if (sort === 'UPDATE') {
            return link1.updatedAt - link2.updatedAt;
          } else if (sort === 'SLUG') {
            return link1.slug.localeCompare(link2.slug);
          } else if (sort === 'SLUG_LENGTH') {
            return (
              link1.slug.length - link2.slug.length ||
              link1.slug.localeCompare(link2.slug)
            );
          }
          return link1.createdAt - link2.createdAt;
        })
        .map(link => (
          <span
            key={link.id}
            onDblClick={() => {
              window.open(link.url, '_blank');
            }}
            onClick={() => {
              copyToClipboard(`${instanceUrl}/${link.slug}`, () => {});
            }}
            className='mb-2 mr-2 inline-block cursor-pointer select-none rounded-full bg-gray-200 px-3 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300'
          >
            {link.slug}
          </span>
        ))}
    </div>
  );
};
