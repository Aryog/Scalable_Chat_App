'use client'
import React, { useCallback, useContext, useEffect, useState } from "react"
import { io, Socket } from 'socket.io-client';


interface SocketProviderProps {
    children?: React.ReactNode;
}
interface ISocketContext {
    sendMessage: (msg: string) => any;
    messages: string[]
}

const SocketContext = React.createContext<ISocketContext | null>(null);

export const useSocket = () => {
    const state = useContext(SocketContext)
    if (!state) throw new Error(`state is undefined`);

    return state;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {

    const [socket, setSocket] = useState<Socket | undefined>()
    const [messages, setMessages] = useState<string[]>([])
    const sendMessage: ISocketContext['sendMessage'] = useCallback((msg) => {
        console.log('Send Message', msg)
        if (socket) {
            socket.emit('event:message', { message: msg });
        }
    }, [socket]);

    const onMessageRec = useCallback(({ message }: { message: string }) => {
        const outerMsg = JSON.parse(message);
        console.log('From Server Msg Rec', outerMsg.message)
        setMessages(prev => [...prev, outerMsg.message]);
    }, [])
    useEffect(() => {
        const _socket = io('http://localhost:8000');
        _socket.on('message', onMessageRec);
        setSocket(_socket);
        return () => {
            _socket.disconnect();
            _socket.off("message", onMessageRec)
            setSocket(undefined);
        };
    }, []);
    return (
        <SocketContext.Provider value={{ sendMessage, messages }}>
            {children}
        </SocketContext.Provider>
    )
}