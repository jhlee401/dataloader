# DataLoader 미션

## 파일 구조

```
src/
  DataLoader.ts          ← 구현 파일
  __tests__/
    1_batching.test.ts   ← Step 1: 배치
    2_caching.test.ts    ← Step 2: 캐시
    3_error.test.ts      ← Step 3: 에러 처리
REQUIREMENTS.md          ← 요구사항 명세
README.md                ← 이 파일
```

## 시작 방법

`src/DataLoader.ts` 에서 `load()`, `clear()`, `clearAll()` 을 구현합니다.
테스트를 Step 1부터 하나씩 통과시키는 것을 목표로 합니다.

## 테스트 실행

```bash
# watch 모드 — 파일 저장할 때마다 자동으로 테스트 재실행
npm test

# 한 번만 실행
npm run test:run
```

## 진행 순서

1. `REQUIREMENTS.md` 읽고 요구사항 파악
2. `src/__tests__/1_batching.test.ts` 테스트 통과
3. `src/__tests__/2_caching.test.ts` 테스트 통과
4. `src/__tests__/3_error.test.ts` 테스트 통과
