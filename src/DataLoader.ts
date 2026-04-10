type BatchFn<K, V> = (keys: readonly K[]) => Promise<(V | Error)[]>;
type Batch<K, V> = {
  keys: Array<K>,
  callbacks: Array<{
    resolve: (value: V) => void;
    reject: (error: Error) => void,
  }>
}

export class DataLoader<K, V> {
  private batchFn: BatchFn<K, V>;
  private batch: Batch<K,V> | null;
  private cache: Map<K, Promise<V>>;

  constructor(batchFn: BatchFn<K, V>) {
    this.batchFn = batchFn;
    this.batch = null;
    this.cache = new Map();
  }

  load(key: K): Promise<V> {
    const batch = this.getCurrentBatch();

    const cached = this.cache.get(key);
    if (cached) return cached;

    batch.keys.push(key);
    const promise = new Promise<V>((resolve, reject) => {
      batch.callbacks.push({resolve, reject});
    })
    this.cache.set(key, promise);

    return promise;
  }

  clear(key: K): this {
    this.cache.delete(key);
    return this;
  }

  clearAll(): this {
    this.cache.clear();
    return this;
  }

  private getCurrentBatch(): Batch<K,V> {
    if(this.batch !== null) {
      return this.batch;
    }

    const newBatch: Batch<K,V> = {
      keys: [],
      callbacks: []
    };
    this.batch = newBatch;

    process.nextTick(() => this.dispatchBatch(newBatch));

    return newBatch;
  }

  private async dispatchBatch(batch: Batch<K, V>): Promise<void> {
    this.batch = null;
    try {
      const values = await this.batchFn(batch.keys);
      batch.callbacks.forEach((callback, i) => {
        const value = values[i];
        if (value instanceof Error) {
          callback.reject(value);
        } else {
          callback.resolve(value);
        }
      });
    } catch (error) {
      batch.callbacks.forEach((callback) => callback.reject(error as Error));
    }
  }
}
