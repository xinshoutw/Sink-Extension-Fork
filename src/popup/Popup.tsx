import { Logo } from '@src/assets/img/logo';
import { NewShortURL } from '@src/popup/NewShortURL';
import { Footer } from '@src/components/Footer';
import { useLinks } from '@src/util/useLinks';
import { LoadingIcon } from '@src/components/LoadingIcon';
import { Links } from '@src/popup/Links';

export default function Popup() {
  const { links, setLinks, queryLinks, isLoading } = useLinks(1000);
  return (
    <div className='w-full min-w-[450px] bg-white p-5 pb-1 text-gray-800 dark:bg-gray-800 dark:text-gray-200'>
      <div className='flex items-center justify-center text-lg'>
        <Logo size={30} />
        <h2 className='ml-2 font-bold'>Sink</h2>
      </div>
      <div className='mt-8 w-full'>
        <div className='flex w-full flex-col items-center justify-center bg-white dark:bg-gray-700'>
          {isLoading ? (
            <LoadingIcon size={30} />
          ) : (
            <>
              {links ? (
                <NewShortURL
                  links={links}
                  refetch={() => {
                    return queryLinks(1000)
                      .then(data => {
                        if (data.statusMessage) {
                          throw Error();
                        }
                        setLinks(data.links);
                        return data;
                      })
                      .catch(() => {
                        setLinks([]);
                      });
                  }}
                />
              ) : (
                'Please update the token in the options Page!'
              )}
            </>
          )}
        </div>
      </div>
      <Footer hideGift hideGithub />
      <Links />
    </div>
  );
}
