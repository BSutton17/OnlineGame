import { io } from 'socket.io-client';

const PRODUCTION_SERVER = 'https://overloardserver-3dcf0e3323a3.herokuapp.com';

// VITE_SERVER_URL wins; otherwise use the local server while developing
// (on the same host name, so phones on your Wi-Fi work too) and Heroku in
// production. No more commenting lines in and out.
export function serverUrl() {
  if (import.meta.env.VITE_SERVER_URL) return import.meta.env.VITE_SERVER_URL;
  if (import.meta.env.DEV) return `${window.location.protocol}//${window.location.hostname}:3001`;
  return PRODUCTION_SERVER;
}

export function createSocket(url = serverUrl()) {
  return io(url, { autoConnect: false, transports: ['websocket', 'polling'] });
}

// Emit with an acknowledgement and a timeout, as a promise.
export function request(socket, event, payload = {}, timeoutMs = 8000) {
  return new Promise((resolve) => {
    if (!socket.connected) {
      resolve({ ok: false, error: 'Not connected to the server' });
      return;
    }
    socket.timeout(timeoutMs).emit(event, payload, (err, response) => {
      resolve(err ? { ok: false, error: 'The server did not answer' } : response || { ok: false, error: 'No answer' });
    });
  });
}
