import { url as URLResolver } from '@octadesk-tech/services';
import { useEffect, useState } from "react";
import { io } from 'socket.io-client';

interface IUseSocket {
  data: any;
}

export const useSocket = (room: string): IUseSocket => {
  const [data, setData] = useState<any>(null);
  // const [url, setUrl] = useState<any>({});

  const getSocketURL = async () => {
    const baseURL = new URL((await URLResolver.getAPIURL('websocket')))

    const url = baseURL.hostname
    const path = baseURL.pathname == '/' ? '' : baseURL.pathname

    return {
      url: `wss://${url}`,
      path: `${path}/socket.io`
    };
  }

  useEffect(() => {
    // const fetchSocketURL = async () => {
    //   const socketURL = await getSocketURL();
    //   setUrl(socketURL);
    // };
    // fetchSocketURL();

    console.log(room);

    const socket = io('http://localhost:3000', {
      // path: "/socket/socket.io",
      reconnection: false,
      transports: ['websocket'],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 5000,
      randomizationFactor: 0.5,
      // auth: {
      //   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWJkb21haW4iOiJxYXMzMTkxMDAtYTMyIiwiaXNzdWVkYXRlIjoiMjAyNS0wMS0xNlQxOTowMTozNC4xNjNaIiwiaXNzIjoid2lkZ2V0LnFhb2N0YWRlc2suc2VydmljZXMiLCJuYmYiOjE3MzcwNTQwOTQsImV4cCI6MTczNzE5ODA5NCwicm9sZSI6IjEiLCJlbWFpbCI6IndpZGdldEBvY3RhZGVzay5jb20iLCJuYW1lIjoid2lkZ2V0IiwidHlwZSI6IjQiLCJpZCI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDAwMCIsInJvbGVUeXBlIjoiMSIsInBlcm1pc3Npb25UeXBlIjoiMSIsInBlcm1pc3Npb25WaWV3IjoiMSIsInJvb21LZXkiOiIxNWZhMWUyMy1iZjYxLTQ2NjctODg1NC04NDJmNGRhM2ViNDciLCJpYXQiOjE3MzcwNTQwOTR9.A2dj9J_5Dwqwuqhdt-RZqKsR7jeCUh7-YKzYYV5A5CA"
      // }
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

    socket.on(`${room}`, (data) => {
      setData(data);
    });

    return () => {
      console.log("Desconectando do socket...");
      socket.off(room);
      socket.disconnect();
    };
  }, [room]);

  return { data };
};
