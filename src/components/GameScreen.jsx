import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Board from './Board';
import Inventory from '../Inventory';
import Abilities from '../Abilities';
import { useGameContext } from '../Context/GameContext';
import { useLayout } from '../hooks/useLayout';
import { groupLegal, targetsFor, abilityReady, actionablePieces } from '../game/legal';
import { barrierFootprint } from '../game/board';
import { describeEvent, winText } from '../game/messages';

const other = (side) => (side === 'blue' ? 'orange' : 'blue');

// Is the current selection still something the player can do?
function stillValid(selection, legal) {
  if (!selection) return true;
  if (selection.kind === 'piece') return legal.byFrom.has(selection.at);
  if (selection.kind === 'spawn') return selection.unit === 'B' ? legal.barrier.length > 0 : legal.spawn.has(selection.unit);
  return abilityReady(selection.kind, legal);
}

function useToasts() {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);
  const push = useCallback((text) => {
    if (!text) return;
    const id = ++nextId.current;
    setToasts((list) => [...list.slice(-2), { id, text }]);
    setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 2600);
  }, []);
  return [toasts, push];
}

function useNow(active) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!active) return undefined;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [active]);
  return now;
}

// How many pieces and barrier squares a side has, against the limits.
function countsFor(game, side) {
  let pieces = 0;
  let barriers = 0;
  for (const cell of game.grid) {
    if (cell?.t === 'piece' && cell.owner === side) pieces += 1;
    if (cell?.t === 'barrier' && cell.owner === side) barriers += 1;
  }
  return { pieces, barriers, pieceLimit: game.config.pieceLimit, barrierLimit: game.config.barrierLimit };
}

function CashPanel({ side, view }) {
  const player = view.players[side];
  const active = view.status === 'playing' && view.game.current === side;
  const counts = countsFor(view.game, side);
  return (
    <div id={side === 'blue' ? 'moneyLeft' : 'moneyRight'} className={`cash-panel${active ? ' active' : ''}`}>
      <h1 className="cash-Title">
        {player?.name || '—'}
        {view.you === side ? ' (You)' : ''}
      </h1>
      <h1 className="cash">${view.game.money[side]}</h1>
      {counts.pieceLimit ? (
        <span className="cash-count">
          Pieces {counts.pieces}/{counts.pieceLimit}
        </span>
      ) : null}
    </div>
  );
}

export default function GameScreen() {
  const { view, act, leave, resign, rematch, connection } = useGameContext();
  const layout = useLayout();
  const { game, you } = view;
  const yourTurn = view.status === 'playing' && game.current === you;
  const opponentSide = other(you);
  const opponent = view.players[opponentSide];

  const legal = useMemo(() => groupLegal(view.legal), [view.legal]);
  const [selection, setSelection] = useState(null);
  const [hover, setHover] = useState(null);
  const [tab, setTab] = useState('inventory');
  const [busy, setBusy] = useState(false);
  const [toasts, toast] = useToasts();
  const [banner, setBanner] = useState(null);

  // Drop a selection that no longer makes sense (the piece moved, the money ran out...).
  useEffect(() => {
    if (!yourTurn || !stillValid(selection, legal)) setSelection(null);
  }, [legal, yourTurn, selection]);

  // Announce whose turn it is, like the original "Blue's Turn" banner.
  const lastTurn = useRef(null);
  useEffect(() => {
    if (view.status !== 'playing') return;
    const key = `${view.round}:${game.turn}`;
    if (lastTurn.current === key) return;
    lastTurn.current = key;
    setBanner({ key, text: yourTurn ? 'Your Turn' : `${opponent?.name || 'Opponent'}'s Turn` });
  }, [view.status, view.round, game.turn, yourTurn, opponent?.name]);
  // Hide it after a moment. Keyed on the banner itself, so unrelated updates can't cancel the timer.
  useEffect(() => {
    if (!banner) return undefined;
    const timer = setTimeout(() => setBanner(null), 1800);
    return () => clearTimeout(timer);
  }, [banner]);

  // Toasts for things that happened (captures, abilities...).
  const lastSeq = useRef(game.seq);
  useEffect(() => {
    if (game.seq === lastSeq.current) return;
    lastSeq.current = game.seq;
    for (const event of view.events || []) toast(describeEvent(event, view));
  }, [game.seq, view, toast]);

  const send = useCallback(
    async (action) => {
      if (busy || !action) return;
      setBusy(true);
      const result = await act(action);
      setBusy(false);
      setSelection(null);
      if (!result.ok) toast(result.error);
    },
    [act, busy, toast],
  );

  const placingBarrier = selection?.kind === 'spawn' && selection.unit === 'B';
  const targets = useMemo(() => (yourTurn ? targetsFor(selection, legal) : new Map()), [selection, legal, yourTurn]);
  const preview = useMemo(() => {
    if (placingBarrier && targets.get(hover)?.action) return new Set(barrierFootprint(hover));
    return new Set();
  }, [placingBarrier, targets, hover]);
  const actionable = useMemo(() => (yourTurn ? actionablePieces(legal) : new Set()), [legal, yourTurn]);

  const handlers = useMemo(
    () => ({
      onClick: (i) => {
        if (!yourTurn) return;
        const target = targets.get(i);
        if (target?.action) send(target.action);
        else if (legal.byFrom.has(i)) setSelection((s) => (s?.kind === 'piece' && s.at === i ? null : { kind: 'piece', at: i }));
        else setSelection(null);
      },
      // Hover only matters while placing a barrier (to preview its two squares).
      onHover: (i) => setHover(placingBarrier ? i : null),
      onDragStart: (i) => {
        if (yourTurn && legal.byFrom.has(i)) setSelection({ kind: 'piece', at: i });
      },
      onDrop: (i) => {
        const target = targets.get(i);
        if (target?.action) send(target.action);
      },
    }),
    [yourTurn, targets, legal, send, placingBarrier],
  );

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelection(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const opponentAway = view.status === 'playing' && opponent && !opponent.connected;
  const now = useNow(opponentAway);
  const secondsLeft = opponent?.deadline ? Math.max(0, Math.ceil((opponent.deadline - now) / 1000)) : null;

  const onLeave = () => {
    if (view.status === 'playing' && !window.confirm('Leaving now counts as a loss. Leave the game?')) return;
    leave();
  };
  const copyCode = () => navigator.clipboard?.writeText(view.code).then(() => toast('Room code copied'), () => {});

  const color = `selector-${you}`;
  const result = winText(view);
  const status = view.status === 'finished' ? 'Game Over' : yourTurn ? 'Your Turn' : `${opponent?.name || 'Opponent'}'s Turn`;
  const endTurn = () => send(legal.endTurn);

  return (
    <div id="Outer-Container" className={`layout-${layout}${busy ? ' busy' : ''}`}>
      <header className="game-header">
        <button type="button" id="room" onClick={copyCode} title="Copy room code">
          Room {view.code}
        </button>
        <h1 className={`status status-${game.current}`}>{status}</h1>
        <h1 className="moves">Moves Left: {yourTurn ? game.movesLeft : '—'}</h1>
        <div className="header-buttons">
          {view.status === 'playing' && (
            <button type="button" className="leave" onClick={() => window.confirm('Resign this game?') && resign()}>
              Resign
            </button>
          )}
          <button type="button" className="leave" onClick={onLeave}>
            Leave
          </button>
        </div>
      </header>

      <CashPanel side="blue" view={view} />
      <Board game={game} you={you} layout={layout} targets={targets} preview={preview} actionable={actionable} handlers={handlers} />
      <CashPanel side="orange" view={view} />

      <div className="tray-area">
        {tab === 'inventory' ? (
          <Inventory
            color={color}
            costs={game.config.costs}
            money={game.money[you]}
            legal={legal}
            yourTurn={yourTurn}
            movesLeft={game.movesLeft}
            limits={countsFor(game, you)}
            selection={selection}
            onSelect={setSelection}
            onToggle={() => setTab('abilities')}
            onEndTurn={endTurn}
          />
        ) : (
          <Abilities
            color={color}
            legal={legal}
            costs={game.config.costs}
            money={game.money[you]}
            yourTurn={yourTurn}
            movesLeft={game.movesLeft}
            selection={selection}
            onSelect={setSelection}
            onUse={send}
            onToggle={() => setTab('inventory')}
            onEndTurn={endTurn}
          />
        )}
      </div>

      {banner && !result && <h1 className="turn banner">{banner.text}</h1>}
      <div className="toasts" aria-live="polite" hidden={Boolean(result)}>
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            {t.text}
          </div>
        ))}
      </div>

      {opponentAway && (
        <div className="away-banner">
          {opponent.name} lost connection{secondsLeft !== null ? ` — they have ${secondsLeft}s to come back` : ''}
        </div>
      )}
      {connection === 'offline' && <div className="away-banner">Connection lost — reconnecting…</div>}

      {result && (
        <div className="overlay">
          <div className="home-wrapper game-over">
            <h1>{result.title}</h1>
            <p>{result.detail}</p>
            {opponent ? (
              <button type="button" className="infoButton" disabled={view.rematch[you]} onClick={rematch}>
                {view.rematch[you] ? 'Waiting for opponent…' : view.rematch[opponentSide] ? 'Accept Rematch' : 'Rematch'}
              </button>
            ) : (
              <p>Your opponent has left.</p>
            )}
            <button type="button" className="infoButton" onClick={leave}>
              Main Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
