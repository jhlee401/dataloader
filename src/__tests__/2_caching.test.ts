import { describe, it, expect, vi } from 'vitest';
import { DataLoader } from '../DataLoader';

describe('Step 2: 캐시 (Caching)', () => {
  it('같은 키를 두 번 load하면 batchFn은 한 번만 호출된다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    const first = await loader.load(1);
    const second = await loader.load(1);

    expect(batchFn).toHaveBeenCalledTimes(1);
    expect(first).toBe(10);
    expect(second).toBe(10);
  });

  it('clear 후 같은 키를 load하면 batchFn이 다시 호출된다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    await loader.load(1);
    loader.clear(1);
    await loader.load(1);

    expect(batchFn).toHaveBeenCalledTimes(2);
  });

  it('clearAll 후 모든 캐시가 삭제된다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    await Promise.all([loader.load(1), loader.load(2)]);
    loader.clearAll();
    await Promise.all([loader.load(1), loader.load(2)]);

    expect(batchFn).toHaveBeenCalledTimes(2);
  });
});
