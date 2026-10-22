// Holds the connection to the server and the latest snapshot it sent.
// The server is the source of truth: the client never changes the game
// itself, it only asks the server to, and redraws whatever comes back.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { createSocket, request } from '../net/socket';

const GameContext = createContext(null);
const SESSION_KEY = 'overlord.session';

// sessionStorage is per browser tab, so two tabs can play each other while
// testing, and a refresh puts you straight back into your game.
const loadSession = () => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY));
  } catch {
    return null;
  }
};
const saveSession = (session) => {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // storage can be unavailable (private mode); resuming just won't work
  }
};

export function GameProvider({ children, socketFactory = createSocket }) {
  const socketRef = useRef(null);
  if (!socketRef.current) socketRef.current = socketFactory();
  const socket = socketRef.current;

  const [connection, setConnection] = useState('connecting'); // connecting | connected | offline
  const [rules, setRules] = useState(null);
  const [view, setView] = useState(null);
  const [notice, setNotice] = useState(null);
  const [resuming, setResuming] = useState(() => Boolean(loadSession()));

  useEffect(() => {
    const onConnect = async () => {
      setConnection('connected');
      const session = loadSession();
      if (session?.token) {
        setResuming(true);
        const result = await request(socket, 'room:resume', { token: session.token });
        if (!result.ok) {
          saveSession(null);
          setView(null);
          setNotice(result.error);
        }
        setResuming(false);
      }
    };
    const onDisconnect = () => setConnection('offline');
    const onHello = ({ rules: r }) => setRules(r);
    const onState = (v) => setView(v);
    const onClosed = ({ reason }) => {
      saveSession(null);
      setView(null);
      setNotice(reason);
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onDisconnect);
    socket.on('server:hello', onHello);
    socket.on('room:state', onState);
    socket.on('room:closed', onClosed);
    socket.connect();
    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onDisconnect);
      socket.off('server:hello', onHello);
      socket.off('room:state', onState);
      socket.off('room:closed', onClosed);
      socket.disconnect();
    };
  }, [socket]);

  const join = useCallback(
    async (name, code) => {
      setNotice(null);
      const result = await request(socket, 'room:join', { name, code });
      if (result.ok) saveSession({ token: result.token, code: result.code });
      return result;
    },
    [socket],
  );

  // Play a bot ({ mode: 'solo', level }) or watch two bots ({ mode: 'watch', blueLevel, orangeLevel }).
  const playBots = useCallback(
    async (name, options) => {
      setNotice(null);
      const result = await request(socket, 'room:bot', { name, ...options });
      if (result.ok) saveSession({ token: result.token, code: result.code });
      return result;
    },
    [socket],
  );

  const leave = useCallback(async () => {
    await request(socket, 'room:leave');
    saveSession(null);
    setView(null);
  }, [socket]);

  const act = useCallback((action) => request(socket, 'game:action', action), [socket]);
  const resign = useCallback(() => request(socket, 'game:resign'), [socket]);
  const rematch = useCallback(() => request(socket, 'game:rematch'), [socket]);

  const value = useMemo(
    () => ({ connection, rules, view, notice, setNotice, resuming, join, playBots, leave, act, resign, rematch }),
    [connection, rules, view, notice, resuming, join, playBots, leave, act, resign, rematch],
  );
  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGameContext = () => useContext(GameContext);
