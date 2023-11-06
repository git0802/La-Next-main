import { Fragment, useState } from "react";
import { useRouter } from "next/router";
import { Dialog, Transition } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { useCustomTranslation } from '../../utils/useTranlsation';
import { CheckCircleIcon } from "@heroicons/react/20/solid";

type ModalProps = {
  message?: string;
  subMessage?: string;
  type?: number; // 0 - error, 1 - warning, 2 - success
  closeMessage?: string;
  closeFunction?: string | ((textareaContent?: string) => void);
  option?: number; // 0 - default, 1 - show cancel button, 2 - show textarea
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function Modal({
  message,
  subMessage,
  type,
  closeMessage,
  closeFunction,
  option = 0,
  open,
  setOpen
}: ModalProps) {
  const router = useRouter();
  const { t } = useCustomTranslation();

  const [textareaContent, setTextareaContent] = useState('');

  const closeModal = () => {
    if (closeFunction) {
      if (typeof closeFunction === "string") {
        router.push("/" + closeFunction);
      } else if (typeof closeFunction === "function") {
        closeFunction(option === 2 ? textareaContent : undefined);
        setTextareaContent("");
      }
    }
    setOpen(false);
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-sm sm:p-6">
                <div>
                  {!type && (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-red-600"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {type === 1 && (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
                      <ExclamationTriangleIcon
                        className="h-6 w-6 text-yellow-600"
                        aria-hidden="true"
                      />
                    </div>
                  )}
                  {type === 2 && (
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                      <CheckCircleIcon
                        className="h-6 w-6 text-green-600"
                        aria-hidden="true"
                      />
                    </div>
                  )}

                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title
                      as="h3"
                      className="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    >
                      {message ? t(message) :
                        t("something-went-wrong")}
                    </Dialog.Title>
                    {subMessage && (
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">{t(subMessage)}</p>
                      </div>
                    )}
                  </div>
                </div>
                {option === 2 && (
                  <div className="mt-4">
                    <textarea
                      className="custom-textarea"
                      value={textareaContent}
                      onChange={(e) => setTextareaContent(e.target.value)}
                    />
                  </div>
                )}
                <div className="mt-5 sm:mt-6">
                  <div className="flex justify-center space-x-4">
                    {option > 0 && (
                      <button
                        type="button"
                        className="inline-flex justify-center rounded-md bg-gray-300 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
                        onClick={() => setOpen(false)}
                      >
                        {t("Cancel")}
                      </button>
                    )}
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                      onClick={closeModal}
                    >
                      {t(closeMessage ? closeMessage : "close")}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}