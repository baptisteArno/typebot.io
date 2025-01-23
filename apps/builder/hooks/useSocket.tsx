import { subDomain, url as URLResolver } from '@octadesk-tech/services';
import Storage from '@octadesk-tech/storage';
import pako from 'pako';
import { useRef, useState } from "react";
import Socket, { Socket as SocketType } from 'socket.io-client';


interface IUseSocket {
  data: any;
  exceededTimeout: boolean;
  socketError: boolean;
  clearSocketTimeout: () => void;
  connectInSocket: (config: any) => Promise<boolean>;
  disconnectSocket: (config: any) => void;
}

export const useSocket = (): IUseSocket => {
  const socketRef = useRef<SocketType | null>(null);
  const [data, setData] = useState<any>(null);
  const [socketError, setSocketError] = useState(false);
  const [exceededTimeout, setExceededTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const getSocketURL = async () => {
    const apiURL = await URLResolver.getAPIURL('websocket');

    if (!apiURL) {
      throw new Error('API URL is undefined. Please check the configuration.');
    }

    const baseURL = new URL(apiURL);
    const hostname = baseURL.host;
    const path = baseURL.pathname === '/' ? '' : baseURL.pathname;

    return {
      url: `wss://${hostname}`,
      path: `${path}/socket.io`,
    }
  };

  const connectInSocket = async (config: any) => {
    const { timeout, emit, room, paramsForEmit } = config;

    const socketUrl = await getSocketURL();

    const authStorage = Storage.getItem('userToken') as any
    const currentSubDomain = subDomain.getSubDomain()

    const socket = Socket(`${socketUrl?.url}/${currentSubDomain}`, {
      path: `${socketUrl?.path}`,
      reconnection: false,
      transports: ['websocket'],
      reconnectionAttempts: 3,
      reconnectionDelay: 10000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: { token: authStorage },
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Conectado!");
      if (emit?.eventJoin) socket.emit(emit.eventJoin, paramsForEmit?.eventJoin);
    });

    socket.on("error", (message) => console.error(`Erro no Socket: ${message}`));

    socket.on("connect_error", (error) => {
      console.log(`Erro de conexão: ${error}`)
      setSocketError(true);
    });

    socket.on("reconnect_attempt", () => console.log("Tentativa de reconexão..."));

    socket.on("disconnect", (message) => {
      console.log(`Desconectado: ${message}`)
      setSocketError(true);
    });

    socket.on(room, (data: any) => {
      const decompressedMessage = JSON.parse(pako.inflate(data, { to: 'string' }))
      setData(decompressedMessage);
    });

    if (timeout) timeoutRef.current = setTimeout(() => {
      setExceededTimeout(true);
    }, timeout.time);

    return true;
  }

  const disconnectSocket = (config: any) => {
    console.log('Desconectando o socket')
    const { room, emit, paramsForEmit } = config;

    const socket = socketRef?.current;

    if (!socket) return false;

    if (emit?.eventLeave) socket.emit(emit.eventLeave, paramsForEmit?.eventLeft)
    socket.off(room);
    socket.removeAllListeners();
    socket.disconnect();
    socketRef.current = null;

    return true;
  }

  function clearSocketTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    return;
  }

  return { connectInSocket, disconnectSocket, socketError, data, exceededTimeout, clearSocketTimeout };
};
