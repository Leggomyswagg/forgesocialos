import React from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FirebaseProvider, useFirebase } from './FirebaseContext';

const mocks = vi.hoisted(() => ({
  auth: { currentUser: null as { uid: string } | null },
  authCallback: null as null | ((user: unknown) => Promise<void>),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  listeners: [] as Array<{ path: string; next: (snapshot: unknown) => void; stop: ReturnType<typeof vi.fn> }>,
}));

vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn((_auth, callback) => {
    mocks.authCallback = callback;
    return vi.fn();
  }),
}));

vi.mock('../firebase', () => ({
  auth: mocks.auth, db: {}, googleProvider: {},
  signInWithPopup: vi.fn(), signOut: vi.fn(),
  handleFirestoreError: vi.fn(),
  OperationType: { GET: 'get', LIST: 'list', UPDATE: 'update', WRITE: 'write', CREATE: 'create', DELETE: 'delete' },
}));

vi.mock('firebase/firestore', () => ({
  doc: (_db: unknown, ...parts: string[]) => parts.join('/'),
  collection: (_db: unknown, ...parts: string[]) => parts.join('/'),
  query: (path: string) => path,
  where: vi.fn(), getDoc: mocks.getDoc, setDoc: mocks.setDoc, updateDoc: vi.fn(),
  onSnapshot: (path: string, next: (snapshot: unknown) => void) => {
    const stop = vi.fn();
    mocks.listeners.push({ path, next, stop });
    return stop;
  },
}));

Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let state: ReturnType<typeof useFirebase>;
let renderer: ReactTestRenderer;
function Consumer() {
  state = useFirebase();
  return null;
}

const profile = (id: string) => ({ id, email: `${id}@example.com`, createdAt: '2026-10-01', updatedAt: '2026-10-01' });
const profileSnapshot = (id: string) => ({ exists: () => true, data: () => profile(id) });
const collectionSnapshot = (data: unknown) => ({ forEach: (visit: (doc: unknown) => void) => visit({ data: () => data }) });

async function authenticate(id: string | null) {
  mocks.auth.currentUser = id ? { uid: id } : null;
  await act(async () => { await mocks.authCallback?.(id ? { uid: id, email: `${id}@example.com` } : null); });
}

beforeEach(async () => {
  vi.clearAllMocks();
  mocks.auth.currentUser = null;
  mocks.listeners = [];
  mocks.getDoc.mockImplementation((path: string) => Promise.resolve(profileSnapshot(path.split('/')[1])));
  mocks.setDoc.mockResolvedValue(undefined);
  await act(async () => { renderer = create(<FirebaseProvider><Consumer /></FirebaseProvider>); });
});

afterEach(async () => { await act(async () => renderer.unmount()); });

describe('account-scoped state', () => {
  it('clears metrics and all private collections on logout and ignores late snapshots', async () => {
    await authenticate('alice');
    const metrics = mocks.listeners.find(listener => listener.path === 'users/alice/metrics')!;
    const assets = mocks.listeners.find(listener => listener.path === 'users/alice/assets')!;
    await act(async () => {
      metrics.next(collectionSnapshot({ id: 'metric-a', userId: 'alice', date: '2026-10-01' }));
      assets.next(collectionSnapshot({ id: 'asset-a', userId: 'alice', createdAt: '2026-10-01' }));
    });
    expect(state.userMetrics).toHaveLength(1);
    expect(state.userAssets).toHaveLength(1);
    await authenticate(null);
    await act(async () => metrics.next(collectionSnapshot({ id: 'late-a', date: '2026-10-01' })));
    expect(state.user).toBeNull();
    expect(state.profile).toBeNull();
    expect(state.userMetrics).toEqual([]);
    expect(state.userAssets).toEqual([]);
    expect(state.userActivities).toEqual([]);
    expect(state.userFeedbacks).toEqual([]);
    expect(state.loading).toBe(false);
    expect(metrics.stop).toHaveBeenCalledOnce();
  });

  it('resets collections on account switch and ignores the previous account subscriptions', async () => {
    await authenticate('alice');
    const metrics = mocks.listeners.find(listener => listener.path === 'users/alice/metrics')!;
    await act(async () => metrics.next(collectionSnapshot({ id: 'metric-a', date: '2026-10-01' })));
    await authenticate('bob');
    expect(state.profile?.id).toBe('bob');
    expect(state.userMetrics).toEqual([]);
    await act(async () => metrics.next(collectionSnapshot({ id: 'late-a', date: '2026-10-01' })));
    expect(state.userMetrics).toEqual([]);
  });

  it('ignores an earlier profile request that resolves after a newer login', async () => {
    let resolveAlice!: (value: unknown) => void;
    mocks.getDoc.mockImplementation((path: string) => path === 'users/alice'
      ? new Promise(resolve => { resolveAlice = resolve; })
      : Promise.resolve(profileSnapshot('bob')));
    mocks.auth.currentUser = { uid: 'alice' };
    let pendingAlice!: Promise<void>;
    await act(async () => { pendingAlice = mocks.authCallback!({ uid: 'alice' }); });
    await authenticate('bob');
    await act(async () => { resolveAlice(profileSnapshot('alice')); await pendingAlice; });
    expect(state.user?.uid).toBe('bob');
    expect(state.profile?.id).toBe('bob');
    expect(state.loading).toBe(false);
  });

  it('preserves collections when auth emits an event for the current account', async () => {
    await authenticate('alice');
    const metrics = mocks.listeners.find(listener => listener.path === 'users/alice/metrics')!;
    await act(async () => metrics.next(collectionSnapshot({ id: 'metric-a', date: '2026-10-01' })));
    await authenticate('alice');
    expect(state.userMetrics).toHaveLength(1);
    expect(state.userMetrics[0].id).toBe('metric-a');
  });

  it('ignores stopped subscriptions after signing back into the same account', async () => {
    await authenticate('alice');
    const metrics = mocks.listeners.find(listener => listener.path === 'users/alice/metrics')!;
    await authenticate(null);
    await authenticate('alice');
    await act(async () => metrics.next(collectionSnapshot({ id: 'stale-a', date: '2026-10-01' })));
    expect(state.userMetrics).toEqual([]);
  });
});
