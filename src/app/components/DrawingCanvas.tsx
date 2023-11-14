import React, { useRef, useState, useEffect, MouseEvent, TouchEvent } from 'react';

interface DrawingCanvasProps {
    content: string;
    handleChange: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ content, handleChange }) => {
    const canvasRef = useRef < HTMLCanvasElement > (null);
    const [isDrawing, setIsDrawing] = useState(false);
    const historyRef = useRef < string[] > ([]);

    const getEventPosition = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) {
            return { x: 0, y: 0 };
        }
        const rect = canvas.getBoundingClientRect();

        // Check if the event is a touch event
        if ('touches' in event && event.touches.length > 0) {
            return {
                x: event.touches[0].clientX - rect.left,
                y: event.touches[0].clientY - rect.top,
            };
        }
        // Else, it's a mouse event
        return {
            x: (event as MouseEvent).clientX - rect.left,
            y: (event as MouseEvent).clientY - rect.top,
        };
    };

    const startDrawing = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const pos = getEventPosition(event);
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                setIsDrawing(true);
                historyRef.current.push(canvas.toDataURL());
            }
        }
    };

    const draw = (event: MouseEvent<HTMLCanvasElement> | TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        event.preventDefault();
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                const pos = getEventPosition(event);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
            }
        }
    };

    const finishDrawing = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.closePath();
                setIsDrawing(false);
                handleChange(canvas.toDataURL());
            }
        }
    };

    const undoLast = () => {
        const canvas = canvasRef.current;
        if (canvas && historyRef.current.length > 1) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                historyRef.current.pop();
                const previousUrl = historyRef.current[historyRef.current.length - 1];
                const img = new Image();
                img.onload = () => {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                };
                img.src = previousUrl;
            }
        }
    };
    useEffect(() => {
        if (content) {
            // Ensure the canvas reference is not null
            const canvas = canvasRef.current;
            if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const img = new Image();
                    img.onload = () => {
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    };
                    img.src = content;
                    // The initial content is not part of the undo history
                    historyRef.current = [content];
                }
            }
        }
    }, [content]);

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                historyRef.current = []; // Clear the history
                handleChange(""); // Call the handleChange with an empty string to indicate that the canvas is cleared
            }
        }
    };

    useEffect(() => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            // Customize your drawing context settings here
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 5;
        }
    }, []);

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={500}
                height={500}
                onMouseDown={(e) => startDrawing(e)}
                onMouseMove={(e) => draw(e)}
                onMouseUp={finishDrawing}
                onMouseOut={finishDrawing}
                onTouchStart={(e) => startDrawing(e)}
                onTouchMove={(e) => draw(e)}
                onTouchEnd={finishDrawing}
                style={{ border: '1px solid black', touchAction: 'none' }}
            />
            {historyRef.current.length > 1 ? (
                <button onClick={undoLast}>Undo</button>
            ) : (
                <button onClick={clearCanvas}>Clear</button>
            )}
        </div>
    );
};

export default DrawingCanvas;
