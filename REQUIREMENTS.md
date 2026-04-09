# DataLoader 구현 미션

## 배경

GraphQL에서 N+1 문제를 해결하기 위해 만들어진 유틸리티입니다.
여러 곳에서 개별적으로 발생하는 데이터 요청을 **배치(batch)** 로 묶고 **캐시(cache)** 하여 효율적으로 처리합니다.

### N+1 문제 예시

게시글 목록 3개를 불러오고, 각 게시글의 작성자를 조회한다고 하면:

```
DataLoader 없이:
  게시글 1의 작성자(userId: 1) 조회
  게시글 2의 작성자(userId: 2) 조회
  게시글 3의 작성자(userId: 1) 조회  ← userId 1은 이미 조회했는데 또 함
= 총 3번 요청

DataLoader 있으면:
  userId [1, 2] 를 한 번에 조회
= 총 1번 요청
```

---

## 요구사항

### Step 1: 배치 (Batching)

같은 시점에 여러 건의 데이터 요청이 들어오면, 개별 요청을 하나로 묶어서 처리한다.

```
// 같은 시점에 실행 → batchFn([1, 2, 3]) 으로 한 번만 호출됨
loader.load(1)
loader.load(2)
loader.load(3)

// 다른 시점에 실행 → batchFn([1]), batchFn([2]) 로 각각 호출됨
await loader.load(1)
await loader.load(2)
```

### Step 2: 캐시 (Caching)

한 번 불러온 데이터는 캐시에 저장하고, 동일한 요청이 다시 들어오면 캐시에서 반환한다.

```
await loader.load(1)  // batchFn 호출됨
await loader.load(1)  // 캐시에서 반환, batchFn 호출 안 됨

loader.clear(1)       // userId 1의 캐시만 삭제
loader.clearAll()     // 전체 캐시 삭제
```

### Step 3: 에러 처리 (Error Handling)

일부 요청이 실패하더라도 나머지 요청의 결과에는 영향을 주지 않아야 한다.

```
// userId 2가 존재하지 않는 경우
loader.load(1)  // → { id: 1, name: 'Alice' }  정상
loader.load(2)  // → Error: Not found           실패
loader.load(3)  // → { id: 3, name: 'Bob' }    정상 (2번 실패와 무관하게)
```
