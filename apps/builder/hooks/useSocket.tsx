import { subDomain, url as URLResolver } from '@octadesk-tech/services';
import Storage from '@octadesk-tech/storage';
import pako from 'pako';
import { useEffect, useRef, useState } from "react";
import Socket from 'socket.io-client';

interface IUseSocket {
  data: any;
  socketModalTimeout: (time: number) => void;
  exceededTimeout: boolean;
  clearSocketModalTimeout: () => void;
}

export const useSocket = (room: string, query?: any): IUseSocket => {
  const [data, setData] = useState<any>(null);
  const [socketUrl, setSocketUrl] = useState<any>(null);
  const [exceededTimeout, setExceededTimeout] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);


  const getSocketURL = async () => {
    if (socketUrl) return;

    const baseURL = new URL(await URLResolver.getAPIURL('websocket'));

    const hostname = baseURL.host;
    const path = baseURL.pathname === '/' ? '' : baseURL.pathname;

    setSocketUrl({
      url: `wss://${hostname}`,
      path: `${path}/socket.io`,
    });
  };

  useEffect(() => {
    if (!socketUrl) {
      getSocketURL().catch((error) => console.error('Failed to fetch socket URL:', error));
      return;
    }

    const authStorage = Storage.getItem('userToken') as any
    const currentSubDomain = subDomain.getSubDomain()

    const socket = Socket(`${socketUrl.url}/${currentSubDomain}`, {
      path: `${socketUrl.path}`,
      reconnection: false,
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      auth: {
        token: authStorage
      },
      query
    });

    socket.on("connect", () => {
      console.log("Conectado!");
    });

    socket.on("error", (message) => {
      console.error(`Erro no Socket: ${message}`);
    });

    socket.on("connect_error", (error) => {
      console.error("Erro de conexão:", error);
    });

    socket.on("reconnect_attempt", () => {
      console.log("Tentativa de reconexão...");
    });

    socket.on("disconnect", (message) => {
      console.log(`Desconectado: ${message}`);
    });

    socket.on(room, (data) => {
      const decompressedMessage = JSON.parse(pako.inflate(data, { to: 'string' }))
      setData(decompressedMessage);
    });

    return () => {
      console.log("Desconectando do socket...");
      socket.off(room);
      socket.disconnect();
    };
  }, [socketUrl]);

  function socketModalTimeout(time: number) {
    timeoutRef.current = setTimeout(() => {
      const closeButton = document.querySelector(".chakra-modal__close-btn");
      if (closeButton) closeButton.click();
      setExceededTimeout(true);
    }, time);
  }

  function clearSocketModalTimeout() {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }

  return { data, socketModalTimeout, exceededTimeout, clearSocketModalTimeout };
};
