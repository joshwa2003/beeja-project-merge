import React, { useEffect } from 'react';
import IconBtn from './IconBtn';

export default function ConfirmationModal({
  modalData,
  closeModal,
}) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Close modal on Escape key press
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && closeModal) {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [closeModal]);

  return (
    <div 
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
      onClick={(e) => {
        // Close modal when clicking on backdrop
        if (e.target === e.currentTarget && closeModal) {
          closeModal();
        }
      }}
    >
      <div className="w-11/12 max-w-[400px] rounded-lg border border-richblack-400 bg-richblack-800 p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
        <p className="text-2xl font-semibold text-richblack-5 mb-2">
          {modalData?.text1}
        </p>
        {modalData?.text2 && (
          <p className="mt-3 mb-6 leading-6 text-richblack-200">
            {modalData?.text2}
          </p>
        )}
        <div className="flex items-center gap-x-4 justify-end">
          {modalData?.btn2Text && (
            <button
              className="cursor-pointer rounded-md bg-richblack-600 px-4 py-2 text-richblack-25 font-semibold hover:bg-richblack-700 hover:scale-95 transition-all duration-200 border border-richblack-500"
              onClick={modalData?.btn2Handler || closeModal}
            >
              {modalData?.btn2Text}
            </button>
          )}
          <IconBtn
            onClick={modalData?.btn1Handler}
            text={modalData?.btn1Text}
            customClasses="rounded-md bg-yellow-50 px-4 py-2 text-richblack-900 font-semibold hover:bg-yellow-25 hover:scale-95 transition-all duration-200 shadow-md"
          />
        </div>
      </div>
    </div>
  );
}
