"use client";

import dynamic from "next/dynamic";
import { useState, useRef, useEffect } from "react";
import $ from "jquery";

import "./mathquill.css";

const EditableMathField = dynamic(() => import("react-mathquill"), {
  ssr: false,
});

function MathInput({ onEnterDown, index, content, onValueChange, type = 0 }) {
  const [mathExpression, setMathExpression] = useState("");
  const [prevExpression, setPrevExpression] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isFractionButtonVisible, setIsFractionButtonVisible] = useState(false);

  const mathInputRef = useRef(null);

  useEffect(() => {
    if (content) setMathExpression(content);
    else setMathExpression("");
  }, [content]);

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleChange = (mathField) => {
    onValueChange(mathField.latex(), index);
    setMathExpression(mathField.latex());
    setPrevExpression(mathExpression);
  };

  const handleKeyDown = (e) => {
    // Check for 'Tab' key press
    if (e.key === "Tab") {
      setIsFocused(false); // Hide the fraction button container on 'Tab' press
    }
    onEnterDown(e, index, prevExpression);
  };

  const handleBlur = () => {
    if (!isFractionButtonVisible) setIsFocused(false);
  };

  const handlemathFieldMouseDown = () => {
    setIsFractionButtonVisible(true);
  };
  /// 
  let symbols = [
    ["\\times", 0, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M24.9498 24.9493L15.0503 15.0498" class="icon-stroke" stroke-width="2" strokeLinecap="round" strokeLinejoin="round"></path><path d="M24.9498 15.0507L15.0503 24.9502" class="icon-stroke"  stroke-width="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>'],
    ["=", 1, '<p class="p-2 pt-0">=</p>'],
    ["^2", 1, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clipRule="evenodd" d="M33.5791 13.7461C33.4874 13.6545 33.3591 13.6086 33.1941 13.6086H31.4011C31.2397 13.6086 31.0674 13.6251 30.8841 13.6581C30.7007 13.6875 30.5156 13.7296 30.3286 13.7846L32.0226 12.0521C32.2352 11.8358 32.4369 11.6213 32.6276 11.4086C32.8182 11.196 32.9851 10.9778 33.1281 10.7541C33.2747 10.5268 33.3902 10.2885 33.4746 10.0391C33.5589 9.78981 33.6011 9.51847 33.6011 9.22514C33.6011 8.88414 33.5406 8.57247 33.4196 8.29014C33.2986 8.00781 33.1281 7.76764 32.9081 7.56964C32.6881 7.36797 32.4222 7.21214 32.1106 7.10214C31.8026 6.98847 31.4597 6.93164 31.0821 6.93164C30.7227 6.93164 30.3872 6.98114 30.0756 7.08014C29.7639 7.17547 29.4871 7.32031 29.2451 7.51464C29.0031 7.70897 28.8014 7.95281 28.6401 8.24614C28.4787 8.53947 28.3687 8.88047 28.3101 9.26914L29.1131 9.41214C29.3184 9.44514 29.4761 9.43231 29.5861 9.37364C29.6997 9.31131 29.7896 9.18847 29.8556 9.00514C29.8886 8.88781 29.9399 8.77964 30.0096 8.68064C30.0792 8.58164 30.1617 8.49547 30.2571 8.42214C30.3561 8.34881 30.4661 8.29197 30.5871 8.25164C30.7117 8.20764 30.8474 8.18564 30.9941 8.18564C31.3277 8.18564 31.5862 8.27914 31.7696 8.46614C31.9529 8.64947 32.0446 8.91897 32.0446 9.27464C32.0446 9.47631 32.0189 9.66881 31.9676 9.85214C31.9162 10.0355 31.8392 10.217 31.7366 10.3966C31.6339 10.5726 31.5056 10.7541 31.3516 10.9411C31.1976 11.1245 31.0197 11.317 30.8181 11.5186L28.4531 13.8891C28.3577 13.9808 28.2899 14.0835 28.2496 14.1971C28.2092 14.3071 28.1891 14.4098 28.1891 14.5051V15.0001H33.7221V14.1091C33.7221 13.9588 33.6744 13.8378 33.5791 13.7461ZM14 13.0001C14 12.4479 14.4477 12.0001 15 12.0001H25C25.5523 12.0001 26 12.4479 26 13.0001V27.0001C26 27.5524 25.5523 28.0001 25 28.0001H15C14.4477 28.0001 14 27.5524 14 27.0001V13.0001ZM16 14.0001H24V26.0001H16V14.0001Z" class="icon-fill"></path></svg>'],
    ["^", 0, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clipRule="evenodd" d="M28 8C28 7.44772 28.4477 7 29 7H35C35.5523 7 36 7.44772 36 8V14C36 14.5523 35.5523 15 35 15H29C28.4477 15 28 14.5523 28 14V8ZM30 9H34V13H30V9ZM14 13C14 12.4477 14.4477 12 15 12H25C25.5523 12 26 12.4477 26 13V27C26 27.5523 25.5523 28 25 28H15C14.4477 28 14 27.5523 14 27V13ZM16 14H24V26H16V14Z" class="icon-fill"></path></svg>'],
    ["/", 0, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clipRule="evenodd" d="M16 10C16 9.44772 16.4477 9 17 9H23C23.5523 9 24 9.44772 24 10V16C24 16.5523 23.5523 17 23 17H17C16.4477 17 16 16.5523 16 16V10ZM18 11H22V15H18V11ZM14 20C14 19.4477 14.4477 19 15 19H25C25.5523 19 26 19.4477 26 20C26 20.5523 25.5523 21 25 21H15C14.4477 21 14 20.5523 14 20ZM17 23C16.4477 23 16 23.4477 16 24V30C16 30.5523 16.4477 31 17 31H23C23.5523 31 24 30.5523 24 30V24C24 23.4477 23.5523 23 23 23H17ZM22 25H18V29H22V25Z" class="icon-fill"></path></svg>'],
    ["\\sqrt", 0, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 21L14 27L23 13H30" class="icon-stroke" stroke-width="2" strokeLinecap="round" strokeLinejoin="round"></path></svg>'],
    ["\\sqrt[]{}", 1, '<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" clipRule="evenodd" d="M9.00012 9C9.00012 8.44772 9.44784 8 10.0001 8H16.0001C16.5524 8 17.0001 8.44772 17.0001 9V15C17.0001 15.5523 16.5524 16 16.0001 16H10.0001C9.44784 16 9.00012 15.5523 9.00012 15V9ZM11.0001 10H15.0001V14H11.0001V10ZM23.0001 12C22.6598 12 22.3429 12.173 22.1589 12.4592L13.9849 25.1744L10.8322 20.4453C10.5258 19.9858 9.90493 19.8616 9.44541 20.1679C8.98588 20.4743 8.8617 21.0952 9.16806 21.5547L13.1681 27.5547C13.3552 27.8354 13.6711 28.0028 14.0084 28C14.3457 27.9972 14.6589 27.8245 14.8413 27.5408L23.5461 14H30.0001C30.5524 14 31.0001 13.5523 31.0001 13C31.0001 12.4477 30.5524 12 30.0001 12H23.0001Z" class="icon-fill"></path></svg>'],
    ["\\degree", 0, '<p class="p-2 pt-0">&deg;</p>'],
    ["\\overrightarrow", 0, '<p class="-mt-3 pb-5">&#10230;</p>'],
    ["\\int", 0, '<p class="p-2 pt-0">&#x222b;</p>'],
    ["\\sum", 0, '<p class="p-2 pt-1 pb-1">&Sigma;</p>'],

  ];

  if (type > 0) {
    symbols.unshift(symbols.splice(9, 1)[0]);
  }
  if (type > 1) {
    symbols.unshift(symbols.splice(10, 1)[0]);
  }
  const handleMathFieldMouseUp = (symbol = 0) => {

    const MQ = MathQuill.getInterface(2);
    const mField = MQ.MathField($(".mq-editable-field")[index]);
    if (symbols[symbol][1]) mField.write(symbols[symbol][0]);
    else mField.cmd(symbols[symbol][0]);
    mathInputRef.current.firstChild.firstChild.firstChild.focus();
    setIsFocused(true);
    setIsFractionButtonVisible(false);
  };

  /* Get the height of the soft keyboard and move the button container to the top of the keyboard for mobile devices TODO - do we want this? The below works but is a bit janky and needs some work, not sure if it's worth it - Rob
  const [softKeyboardBottom, setSoftKeyboardBottom] = useState(0);
  useEffect(() => {
    let height = window.visualViewport.height;
    const viewport = window.visualViewport;

    const resizeHandler = () => {

      if (!/iPhone|iPad|iPod/.test(window.navigator.userAgent) && viewport.width < 768) {
        height = viewport.height;
      }
      setSoftKeyboardBottom(height - viewport.height);
      console.log(viewport.width)
      //console.log(height - viewport.height);
    };

    window.visualViewport.addEventListener("resize", resizeHandler);

  }, []);

  Add these classes to button-container max-md:fixed max-md:bottom-0 max-md:border-t-[1px] max-md:border-0 max-md:left-0 max-md:m-0 max-md:rounded-none

  Add this to the button-container div

  style={softKeyboardBottom ? { bottom: `${softKeyboardBottom}px` } : {}} // Move the button container to the top of the keyboard
  */

  return (
    <>
      <div ref={mathInputRef} className="m-0 p-0 border-l-gray-300">
        <EditableMathField
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={(e) => handleBlur(e)}
          latex={mathExpression}
          onChange={handleChange}
        />
      </div>

      {isFocused && (
        <div className="z-40 button-container flex absolute md:w-[384px] md:m-3 mt-3 w-full p-0 bg-white dark:bg-gray-800 border border-gray-300 rounded-lg dark:text-white">
          {symbols.map((symbol, i) => (
            <button
              dangerouslySetInnerHTML={{ __html: symbol[2] }}
              key={i}
              className="soft-kb-button text-2xl font-light bg-white dark:bg-gray-800 dark:text-white hover:bg-gray-200"
              onMouseDown={handlemathFieldMouseDown}
              onMouseUp={() => handleMathFieldMouseUp(i)}
              onMouseLeave={() => setIsFractionButtonVisible(false)}
            ></button>
          ))}
        </div>
      )}
    </>
  );
}

export default MathInput;
