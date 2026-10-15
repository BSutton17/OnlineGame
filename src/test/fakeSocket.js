// A stand-in for a socket.io client: records what the app sends and lets a
// test play the server's part.
export function createFakeSocket(replies = {}) {
  const listeners = new Map();
  const sent = [];
  const socket = {
    connected: false,
    sent,
    on(event, fn) {
      if (!listeners.has(event)) listeners.set(event, new Set());
      listeners.get(event).add(fn);
      return socket;
    },
    off(event, fn) {
      listeners.get(event)?.delete(fn);
      return socket;
    },
    connect() {
      socket.connected = true;
      socket.serverSends('connect');
      return socket;
    },
    disconnect() {
      socket.connected = false;
      return socket;
    },
    timeout() {
      return {
        emit(event, payload, ack) {
          sent.push({ event, payload });
          const reply = replies[event];
          ack(null, typeof reply === 'function' ? reply(payload) : reply ?? { ok: true });
        },
      };
    },
    serverSends(event, data) {
      for (const fn of [...(listeners.get(event) || [])]) fn(data);
    },
  };
  return socket;
}
