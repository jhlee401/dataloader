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
    const cached = this.cache.get(key);
    if (cached) return cached;

    const batch = this.getCurrentBatch();

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
      if(values.length !== batch.keys.length) {
        throw new TypeError("DataLoader는 키 배열을 받아서 값 배열의 Promise를 반환하는 함수로 생성되어야 하는데, 해당 함수가 키 배열과 같은 길이의 배열 Promise를 반환하지 않았습니다.")
      }

      batch.callbacks.forEach((callback, i) => {
        const value = values[i];
        if (value instanceof Error) {
          this.clear(batch.keys[i]);
          callback.reject(value);
        } else {
          callback.resolve(value);
        }
      });
    } catch (error) {
      batch.callbacks.forEach((callback, i) => {
        this.clear(batch.keys[i]);
        callback.reject(error as Error)
      });
    }
  }
}
