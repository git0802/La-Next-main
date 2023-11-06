import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import './mathquill.css';
import Image from 'next/image';

type Props = {
    content: string;
    activeQuestion?: number;
};

const RenderMath: React.FC<Props> = ({ content, activeQuestion }) => {
    const DynamicStaticMathField = dynamic(
        () => import('react-mathquill').then((mod) => mod.StaticMathField),
        { ssr: false }
    );

    const MemoizedDynamicStaticMathField = useMemo(
        () => React.memo(DynamicStaticMathField, (prevProps, nextProps) => prevProps.children === nextProps.children),
        []
    );

    const renderImage = (text: string) => {
        const parts = text.split(/<img>(.*?)<\/img>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return part;
            } else {
                return <img key={index} src={"/quizzes/" + part + ".png"} alt={part + " image"} className='w-full md:max-w-lg m-auto' />
            }
        });
    };

    const renderRightText = (text: string) => {
        const parts = text.split(/<r>(.*?)<\/r>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return renderImage(part);
            } else {
                return <div key={index} className="text-right text-sm">({part})</div>;
            }
        });
    };

    const renderBoldText = (text: string) => {
        const parts = text.split(/<b>(.*?)<\/b>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return renderRightText(part);
            } else {
                return <span key={index} className="font-bold">{part}</span>;
            }
        });
    };

    const renderCenter = (text: string) => {
        const parts = text.split(/<c>(.*?)<\/c>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return renderBoldText(part);
            } else {
                return <div key={index} className="text-center">{renderBoldText(part)}</div>;
            }
        });
    };

    const renderMath = (text: string) => {
        const parts = text.split(/<m>(.*?)<\/m>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return renderCenter(part);
            } else {
                return <MemoizedDynamicStaticMathField style={{ textIndent: '0' }} key={index}>{part.replaceAll("\\,", "\\ ")}</MemoizedDynamicStaticMathField>;
            }
        });
    };

    const renderContent = (text: string) => {
        const parts = text.split(/<example>(.*?)<\/example>/g);
        return parts.map((part, index) => {
            if (index % 2 === 0) {
                return renderMath(part);
            } else {
                const lines = part.split('%%newline%%');
                return (
                    <p key={index} className="border rounded-lg border-gray-200 p-4 bg-gray-200 pt-2 dark:border-gray-700 dark:bg-gray-700">
                        {lines.map((line, lineIndex) => (
                            <React.Fragment key={lineIndex}>
                                {renderMath(line)}
                                {lineIndex < lines.length - 1 && <><br /></>}
                            </React.Fragment>
                        ))}
                    </p>
                );
            }
        });
    };

    const replaceLineBreaksInExampleTags = (inputStr: string): string => {
        return inputStr.replace(/(\n)?<example>([\s\S]*?)<\/example>/g, (match, precedingChar, content) => {
            const newContent = content.replace(/\n/g, '%%newline%%');
            const newLine = precedingChar ? '' : '\n';
            return `${newLine}<example>${newContent}</example>`;
        });
    };

    return (
        <>
            {replaceLineBreaksInExampleTags(content)
                .split("\n")
                .map((str, index) => (
                    <div key={index}
                        style={(index === 0 && activeQuestion) ? { textIndent: '-2rem', paddingLeft: '2rem' } : {}}
                        className={(index && activeQuestion) && index ? "ml-8 mb-4 font-normal" : "mb-4  font-normal"}
                    >
                        {(index === 0 && activeQuestion) ? <span className="inline-block ml-8">{activeQuestion}.</span> : ""}
                        {renderContent(str)}
                    </div>
                ))
            }
        </>
    );
};

// Use React.memo to memoize the component
export default React.memo(RenderMath, (prevProps, nextProps) => {
    // Compare the 'content' prop to determine if the component should re-render
    return prevProps.content === nextProps.content;
});