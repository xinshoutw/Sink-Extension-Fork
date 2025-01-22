import QrcodeSvg from '@src/assets/qrcode.svg?react';
import { useState } from 'preact/hooks';
import { QRImage } from '@src/popup/QRImage';

export default function QRModal({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);

  return (
    <div>
      <QrcodeSvg
        className='ml-1 h-6 w-6 cursor-pointer'
        alt='Show QR Code'
        onClick={openModal}
      />

      {isOpen && (
        <div
          className='fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300'
          onClick={closeModal}
        >
          <div
            className='scale-100 transform rounded-lg bg-white p-4 shadow-lg transition-transform duration-300'
            onClick={e => e.stopPropagation()}
          >
            <button
              className='absolute right-2 top-2 text-gray-500 transition-all hover:text-gray-700'
              onClick={closeModal}
            >
              ✖
            </button>
            <QRImage text={text} />
          </div>
        </div>
      )}
    </div>
  );
}
