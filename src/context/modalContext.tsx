import React, { createContext, useContext, useRef, useState, ReactNode } from "react";
import Modal from "@/app/components/Modal";

type ModalContextType = {
    showModal: (
        msg: string,
        type?: number,
        closeMessage?: string,
        closeFunction?: Function | string,
        subMessage?: string,
        option?: number
    ) => void;
};

const ModalContext = createContext < ModalContextType | undefined > (undefined);

export const useModal = () => {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
};

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [showPopup, setShowPopup] = useState(false);
    const [message, setMessage] = useState("");
    const [subMessage, setSubMessage] = useState("");
    const [msgType, setMsgType] = useState(0);
    const [closeMessage, setCloseMessage] = useState("");
    const [option, setOption] = useState(0);

    // Use useRef to hold the closeFunction
    const closeFunctionRef = useRef < Function | string > ("");

    const showModal = (
        msg: string,
        type?: number,
        closeMessage?: string,
        customCloseFunction?: Function | string,
        subMessage: string = "",
        option: number = 0
    ) => {
        //@ts-ignore
        closeFunctionRef.current = customCloseFunction; // Assign the custom closeFunction to the ref
        setMessage(msg);
        setMsgType(type || 0);
        setCloseMessage(closeMessage || "");
        setShowPopup(true);
        setSubMessage(subMessage);
        setOption(option);
    };

    return (
        <ModalContext.Provider value={{ showModal }}>
            {children}
            <Modal
                open={showPopup}
                setOpen={setShowPopup}
                message={message}
                subMessage={subMessage}
                type={msgType}
                //@ts-ignore
                closeFunction={closeFunctionRef.current} // Use the ref's current value
                closeMessage={closeMessage}
                option={option}
            />
        </ModalContext.Provider>
    );
};
