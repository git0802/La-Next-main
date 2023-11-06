import React, { useEffect, useRef } from 'react';
import ContentEditable from 'react-contenteditable';

interface EditableContentProps {
  content: string;
  handleChange: (e: any) => void;
  type: string;
}

const EditableContent = ({ content, handleChange, type }: EditableContentProps) => {
  const contentRef = useRef < any > (null);

  useEffect(() => {
    if (contentRef.current && !content) {
      contentRef.current.focus();
    }
  }, [content]);

  useEffect(() => {
    const element = contentRef.current;
    if (element) {
      element.style.height = 'auto';
      element.style.height = `${element.scrollHeight}px`;
    }
  }, [content]);

  return (
    <div style={{ flex: 1 }}>
      <ContentEditable
        style={{ whiteSpace: 'normal' }}
        innerRef={contentRef}
        className={`border focus:outline-none focus:ring-0 focus:border-indigo-800 w-full rounded-xl p-2 text-gray-900 shadow-sm sm:leading-6 mt-4 h-auto bg-white editable min-h-[384px] dark:text-white dark:bg-gray-950 dark:border-gray-700 dark:focus:border-white ${type === 'code' ? 'font-mono' : ''}`}
        html={content}
        onChange={handleChange}
      />
    </div>
  );
};

export default EditableContent;
