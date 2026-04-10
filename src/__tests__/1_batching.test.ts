import { describe, it, expect, vi } from 'vitest';
import { DataLoader } from '../DataLoader';

describe('Step 1: 배치 (Batching)', () => {
  it('단일 키를 load하면 해당 값을 반환한다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    const result = await loader.load(1);

    expect(result).toBe(10);
  });

  it('같은 틱에서 호출된 여러 load는 batchFn을 한 번만 호출한다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    const [a, b, c] = await Promise.all([
      loader.load(1),
      loader.load(2),
      loader.load(3),
    ]);

    expect(batchFn).toHaveBeenCalledTimes(1);
    expect(batchFn).toHaveBeenCalledWith([1, 2, 3]);
    expect(a).toBe(10);
    expect(b).toBe(20);
    expect(c).toBe(30);
  });

  it('같은 틱에서 중복 키가 들어와도 batchFn에는 한 번만 전달된다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    const [a, b] = await Promise.all([
      loader.load(1),
      loader.load(1),
    ]);

    expect(batchFn).toHaveBeenCalledWith([1]);
    expect(a).toBe(10);
    expect(b).toBe(10);
  });

  it('다른 틱에서 호출된 load는 각각 별도 배치로 처리된다', async () => {
    const batchFn = vi.fn(async (keys: readonly number[]) =>
      keys.map((k) => k * 10)
    );
    const loader = new DataLoader(batchFn);

    await loader.load(1);
    await loader.load(2);

    expect(batchFn).toHaveBeenCalledTimes(2);
  });

  it('loadMany는 여러 키를 한 번에 load하고 순서대로 결과를 반환한다', async () => {
    const batchFn = async (keys: readonly number[]) =>
      keys.map((k) => k * 10);
    const loader = new DataLoader(batchFn);

    const results = await loader.loadMany([1, 2, 3]);

    expect(results).toEqual([10, 20, 30]);
  });

  it('loadMany는 일부 키가 실패해도 전체가 reject되지 않고 Error 객체를 배열에 담아 반환한다', async () => {
    const batchFn = async (keys: readonly number[]) =>
      keys.map((k) => (k === 2 ? new Error('not found') : k * 10));
    const loader = new DataLoader(batchFn);

    const results = await loader.loadMany([1, 2, 3]);

    expect(results[0]).toBe(10);
    expect(results[1]).toBeInstanceOf(Error);
    expect(results[2]).toBe(30);
  });
});
