import { XCircleIcon } from '@heroicons/react/20/solid'

type AlertProps = {
    message?: string;
    subMessages?: string[]; 
    type?: string;
  };
  
  export default function Alert({ message, subMessages, type }: AlertProps) {
    return (
      <div className="rounded-md bg-red-50 p-4 mt-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              {message || "Something went wrong. Please try again later."}
            </h3>
            {subMessages && subMessages.length > 0 && (
              <div className="mt-2 text-sm text-red-700">
                <ul role="list" className="list-disc space-y-1 pl-5">
                  {subMessages.map((subMessage, index) => (
                    <li key={index}>{subMessage}</li> // Iterate and render each subMessage
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  