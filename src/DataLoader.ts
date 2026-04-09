type BatchFn<K, V> = (keys: readonly K[]) => Promise<(V | Error)[]>;

export class DataLoader<K, V> {
  private batchFn: BatchFn<K, V>;

  constructor(batchFn: BatchFn<K, V>) {
    this.batchFn = batchFn;
  }

  load(key: K): Promise<V> {
    throw new Error('Not implemented');
  }

  clear(key: K): this {
    throw new Error('Not implemented');
  }

  clearAll(): this {
    throw new Error('Not implemented');
  }
}
