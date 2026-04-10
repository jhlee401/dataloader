import { describe, it, expect } from 'vitest';
import { DataLoader } from '../DataLoader';

describe('Step 3: 에러 처리 (Error Handling)', () => {
  it('batchFn 결과 중 Error인 항목은 해당 키의 Promise를 reject한다', async () => {
    const batchFn = async (keys: readonly number[]) =>
      keys.map((k) => (k === 2 ? new Error('not found') : k * 10));
    const loader = new DataLoader(batchFn);

    await expect(loader.load(2)).rejects.toThrow('not found');
  });

  it('일부 키가 실패해도 나머지 키는 정상적으로 resolve된다', async () => {
    const batchFn = async (keys: readonly number[]) =>
      keys.map((k) => (k === 2 ? new Error('not found') : k * 10));
    const loader = new DataLoader(batchFn);

    const [r1, , r3] = await Promise.allSettled([
      loader.load(1),
      loader.load(2),
      loader.load(3),
    ]);

    expect(r1).toEqual({ status: 'fulfilled', value: 10 });
    expect(r3).toEqual({ status: 'fulfilled', value: 30 });
  });

  it('batchFn 자체가 throw하면 해당 배치의 모든 키가 reject된다', async () => {
    const batchFn = async (_keys: readonly number[]) => {
      throw new Error('connection failed');
    };
    const loader = new DataLoader(batchFn);

    await expect(
      Promise.all([loader.load(1), loader.load(2)])
    ).rejects.toThrow('connection failed');
  });
});
