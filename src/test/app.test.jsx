import React from 'react';
import { describe, expect, test, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, within } from '@testing-library/react';
import { GameProvider } from '../Context/GameContext';
import App from '../App';
import { createFakeSocket } from './fakeSocket';

const costs = { MM: 50, A: 100, P: 300, M: 200, W: 200, N: 250, C: 150, B: 100, spread: 100, purify: 140, explosion: 150, rise: 100 };
const ARCHER_AT = 4 * 14 + 2;

function makeView(overrides = {}) {
  const grid = new Array(126).fill(null);
  grid[ARCHER_AT] = { t: 'piece', id: 1, unit: 'A', owner: 'blue', spawnedTurn: 1, movedTurn: null };
  grid[4 * 14 + 9] = { t: 'piece', id: 2, unit: 'MM', owner: 'orange', spawnedTurn: 2, movedTurn: null };
  return {
    code: '0427',
    status: 'playing',
    round: 1,
    you: 'blue',
    players: { blue: { name: 'Ann', connected: true, deadline: null }, orange: { name: 'Ben', connected: true, deadline: null } },
    rematch: { blue: false, orange: false },
    game: {
      config: { costs, income: 150, movesPerTurn: 3, startingMoney: 600 },
      grid,
      current: 'blue',
      turn: 3,
      movesLeft: 3,
      money: { blue: 120, orange: 600 },
      used: { blue: { spread: false, purify: false, explosion: false, rise: false }, orange: { spread: false, purify: false, explosion: false, rise: false } },
      fallen: { blue: 0, orange: 0 },
      winner: null,
      winReason: null,
      lastAction: null,
      seq: 5,
    },
    events: [],
    legal: [
      { type: 'spawn', unit: 'MM', to: 2 },
      { type: 'spawn', unit: 'A', to: 2 },
      { type: 'move', from: ARCHER_AT, to: ARCHER_AT + 1, far: false, kind: 'move' },
      { type: 'move', from: ARCHER_AT, to: ARCHER_AT + 2, far: false, kind: 'move' },
      { type: 'endTurn' },
    ],
    ...overrides,
  };
}

function setup(replies) {
  const socket = createFakeSocket(replies);
  const utils = render(
    <GameProvider socketFactory={() => socket}>
      <App />
    </GameProvider>,
  );
  return { socket, ...utils };
}

const cell = (container, i) => container.querySelector(`[data-cell="${i}"]`);

beforeEach(() => {
  sessionStorage.clear();
  localStorage.clear();
  window.history.replaceState(null, '', '/');
});

describe('lobby', () => {
  test('joining sends the name and 4-digit room to the server', async () => {
    const { socket } = setup({ 'room:join': { ok: true, code: '0427', seat: 'blue', token: 't1' } });
    fireEvent.change(screen.getByPlaceholderText('Name...'), { target: { value: 'Ann' } });
    fireEvent.change(screen.getByLabelText('4-digit room number'), { target: { value: '04a27' } });
    await act(async () => fireEvent.click(screen.getByText('Play Now')));
    expect(socket.sent).toContainEqual({ event: 'room:join', payload: { name: 'Ann', code: '0427' } });
    expect(JSON.parse(sessionStorage.getItem('overlord.session'))).toEqual({ token: 't1', code: '0427' });
  });

  test('shows the server error when the room is full', async () => {
    setup({ 'room:join': { ok: false, error: 'That room is full' } });
    fireEvent.change(screen.getByPlaceholderText('Name...'), { target: { value: 'Cat' } });
    await act(async () => fireEvent.click(screen.getByText('Play Now')));
    expect(screen.getByText('That room is full')).toBeInTheDocument();
  });

  test('an invite link fills in the room number', () => {
    window.history.replaceState(null, '', '/?room=0427');
    setup();
    expect(screen.getByLabelText('4-digit room number')).toHaveValue('0427');
  });

  test('a saved session resumes straight into the game after a refresh', async () => {
    sessionStorage.setItem('overlord.session', JSON.stringify({ token: 'abc', code: '0427' }));
    const { socket } = setup();
    expect(socket.sent).toContainEqual({ event: 'room:resume', payload: { token: 'abc' } });
  });
});

describe('game screen', () => {
  test('the waiting room shows the room number', () => {
    const { socket } = setup();
    act(() => socket.serverSends('room:state', makeView({ status: 'waiting', game: null, legal: [] })));
    expect(screen.getByLabelText('Room 0427')).toBeInTheDocument();
  });

  test('tapping a piece then a green square sends that move', async () => {
    const { socket, container } = setup();
    act(() => socket.serverSends('room:state', makeView()));
    expect(container.querySelectorAll('.cell')).toHaveLength(126);

    act(() => fireEvent.click(cell(container, ARCHER_AT)));
    expect(cell(container, ARCHER_AT + 1)).toHaveClass('box-green');
    expect(cell(container, ARCHER_AT + 2)).toHaveClass('box-green');

    await act(async () => fireEvent.click(cell(container, ARCHER_AT + 2)));
    expect(socket.sent.at(-1)).toEqual({ event: 'game:action', payload: { type: 'move', from: ARCHER_AT, to: ARCHER_AT + 2, far: false, kind: 'move' } });
  });

  test('shop tiles you cannot afford are disabled and say why', () => {
    const { socket } = setup();
    act(() => socket.serverSends('room:state', makeView()));
    const priest = screen.getByText('Priest').closest('button');
    expect(priest).toHaveAttribute('aria-disabled', 'true');
    expect(priest).toHaveAttribute('title', 'Need $300');
    expect(screen.getByText('MinuteMan').closest('button')).toHaveAttribute('aria-disabled', 'false');
  });

  test('buying: tap a shop tile, then a lit spawn square', async () => {
    const { socket, container } = setup();
    act(() => socket.serverSends('room:state', makeView()));
    act(() => fireEvent.click(screen.getByText('MinuteMan').closest('button')));
    expect(cell(container, 2)).toHaveClass('box-green');
    await act(async () => fireEvent.click(cell(container, 2)));
    expect(socket.sent.at(-1)).toEqual({ event: 'game:action', payload: { type: 'spawn', unit: 'MM', to: 2 } });
  });

  test('the abilities tray shows prices and what you can afford', () => {
    const { socket, container } = setup();
    const view = makeView();
    view.legal = [...view.legal, { type: 'spread', from: ARCHER_AT, to: ARCHER_AT + 1 }];
    act(() => socket.serverSends('room:state', view));
    act(() => fireEvent.click(screen.getByText('Abilities')));
    const spread = screen.getByText(/Spread/).closest('button');
    expect(spread).toHaveTextContent('$100');
    expect(spread).toHaveTextContent('Ready');
    expect(screen.getByText(/Purify/).closest('button')).toHaveTextContent('Need $140');
    act(() => fireEvent.click(spread));
    expect(cell(container, ARCHER_AT + 1)).toHaveClass('box-aqua');
  });

  test('the piece count and limit are shown, and a full side cannot buy', () => {
    const { socket } = setup();
    const view = makeView({ legal: makeView().legal.filter((x) => x.type !== 'spawn') });
    view.game.config = { ...view.game.config, pieceLimit: 1, barrierLimit: 4 };
    act(() => socket.serverSends('room:state', view));
    expect(screen.getAllByText('Pieces 1/1').length).toBeGreaterThan(0);
    expect(screen.getByText('MinuteMan').closest('button')).toHaveAttribute('title', 'Piece limit reached (1)');
  });

  test("on the opponent's turn nothing can be selected", () => {
    const { socket, container } = setup();
    const view = makeView({ legal: [] });
    view.game.current = 'orange';
    act(() => socket.serverSends('room:state', view));
    act(() => fireEvent.click(cell(container, ARCHER_AT)));
    expect(container.querySelectorAll('.box-green')).toHaveLength(0);
    expect(screen.getByText('End Turn')).toBeDisabled();
  });

  test('a rejected action shows the reason', async () => {
    const { socket, container } = setup({ 'game:action': { ok: false, error: 'Out of moves' } });
    act(() => socket.serverSends('room:state', makeView()));
    act(() => fireEvent.click(cell(container, ARCHER_AT)));
    await act(async () => fireEvent.click(cell(container, ARCHER_AT + 1)));
    expect(screen.getByText('Out of moves')).toBeInTheDocument();
  });

  test('the turn banner goes away on its own', () => {
    vi.useFakeTimers();
    try {
      const { socket } = setup();
      act(() => socket.serverSends('room:state', makeView()));
      expect(screen.getByText('Your Turn', { selector: '.banner' })).toBeInTheDocument();
      // another update arriving must not keep the banner up
      act(() => socket.serverSends('room:state', makeView({ legal: makeView().legal.slice(1) })));
      act(() => vi.advanceTimersByTime(2000));
      expect(screen.queryByText('Your Turn', { selector: '.banner' })).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });

  test('a disconnected opponent shows a countdown', () => {
    const { socket } = setup();
    const view = makeView();
    view.players.orange = { name: 'Ben', connected: false, deadline: Date.now() + 45_000 };
    act(() => socket.serverSends('room:state', view));
    expect(screen.getByText(/Ben lost connection/)).toHaveTextContent(/4[45]s to come back/);
  });

  test('game over offers a rematch', async () => {
    const { socket } = setup();
    const view = makeView({ status: 'finished', legal: [] });
    view.game.winner = 'blue';
    view.game.winReason = 'reachedEnd';
    act(() => socket.serverSends('room:state', view));
    expect(screen.getByText('Victory!')).toBeInTheDocument();
    await act(async () => fireEvent.click(screen.getByText('Rematch')));
    expect(socket.sent.at(-1).event).toBe('game:rematch');
  });

  test('the room closing returns you to the menu with a message', () => {
    const { socket } = setup();
    act(() => socket.serverSends('room:state', makeView()));
    act(() => socket.serverSends('room:closed', { reason: 'You opened this game somewhere else' }));
    expect(screen.getByText('You opened this game somewhere else')).toBeInTheDocument();
    expect(within(document.body).getByText('Play Now')).toBeInTheDocument();
  });
});

describe('bots', () => {
  test('Play Bots -> Play a Bot sends the difficulty and side', async () => {
    const { socket } = setup({ 'room:bot': { ok: true, code: '0099', seat: 'blue', token: 't9' } });
    fireEvent.change(screen.getByPlaceholderText('Name...'), { target: { value: 'Ann' } });
    act(() => fireEvent.click(screen.getByText('Play Bots')));
    fireEvent.change(screen.getByLabelText('Difficulty'), { target: { value: 'hard' } });
    await act(async () => fireEvent.click(screen.getByText('Start')));
    expect(socket.sent).toContainEqual({ event: 'room:bot', payload: { name: 'Ann', mode: 'solo', level: 'hard', side: 'blue' } });
  });

  test('Watch Bots sends both levels', async () => {
    const { socket } = setup({ 'room:bot': { ok: true, code: '0099', seat: 'watch', token: 't9' } });
    fireEvent.change(screen.getByPlaceholderText('Name...'), { target: { value: 'Ann' } });
    act(() => fireEvent.click(screen.getByText('Play Bots')));
    act(() => fireEvent.click(screen.getByText('Watch Bots')));
    fireEvent.change(screen.getByLabelText('Blue bot'), { target: { value: 'easy' } });
    fireEvent.change(screen.getByLabelText('Orange bot'), { target: { value: 'impossible' } });
    await act(async () => fireEvent.click(screen.getByText('Start')));
    expect(socket.sent).toContainEqual({ event: 'room:bot', payload: { name: 'Ann', mode: 'watch', blueLevel: 'easy', orangeLevel: 'impossible' } });
  });

  test('a watcher sees the eval bar and the top 3 moves instead of the shop', () => {
    const { socket } = setup();
    const analysis = {
      side: 'blue', turn: 3, level: 'Hard', depth: 5, blueChance: 0.73, eval: 1.2, chosen: 'Buy Wizard at C5',
      top: [
        { text: 'Buy Wizard at C5', eval: 1.2, blueChance: 0.73 },
        { text: 'Archer C5→D5', eval: 0.4, blueChance: 0.6 },
        { text: 'Pass', eval: -0.3, blueChance: 0.42 },
      ],
    };
    act(() => socket.serverSends('room:state', makeView({ spectator: true, botGame: 'watch', thinking: true, analysis, legal: [],
      players: { blue: { name: 'Hard Bot', connected: true, bot: true }, orange: { name: 'Easy Bot', connected: true, bot: true } } })));
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '73');
    expect(screen.getByText('Buy Wizard at C5').closest('li')).toHaveClass('chosen');
    expect(screen.getByText('Archer C5→D5')).toBeInTheDocument();
    expect(screen.queryByText('Inventory')).toBe(null);
    expect(screen.queryByText('Resign')).toBe(null);
    expect(screen.getAllByText(/Hard Bot is thinking/).length).toBeGreaterThan(0);
  });
});
