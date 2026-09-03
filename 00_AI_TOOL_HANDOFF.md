---
schema_version: "1.0"
protocol_version: "v1.0.0"
last_updated_at: "2026-09-03T17:16:11+09:00"
last_updated_by: "CODEX"
base_commit: "2e2cc4b7e0f20a8562ddcdf533c6a7585eea8153"
previous_tool: "CODEX"
previous_change_status: "COMPLETED_AND_VERIFIED_LOCALLY"
compatibility_status: "PASSED"
verification_status: "PASSED_LOCAL_ONLY"
next_action: "회장이 원격 push와 운영 배포를 별도로 승인하면 현재 HEAD를 배포하고 운영 PDF-to-JPG·암호 PDF 거절·언어 전환·다운로드를 재검증한다."
---

# Codex·Claude Code·Hermes 공용 인계 현황

## 2026-09-03 핵심 기능 수정 및 로컬 검증

### 작업 레코드

| 필드 | 값 |
|---|---|
| task_id | PDFSITE-FIX-20260903 |
| requested_by | 회장 |
| objective | 확정된 PDF 처리·경로·hydration 결함을 최소 수정하고 회귀 방지 |
| scope | 암호 PDF 선택 거절, PDF→JPG 버퍼, 경로 정규화, JSON-LD hydration, 병합 큐 경쟁, 테스트·lint |
| executor | CODEX + implementation_engineer + 독립 quality_test_director |
| base_commit | `2e2cc4b7e0f20a8562ddcdf533c6a7585eea8153` |
| source_version | `68cf597ec99ae097ddd0dca6760cb5e4a9452767` |
| deployed_version | 기존 운영본 `0cf20c6` 계열 — 이번 변경 미배포 |
| completed_at | 2026-09-03T17:16:11+09:00 |
| cost | `null` / `UNAVAILABLE` |
| result | 로컬 구현 및 검증 완료, 운영 반영은 승인 대기 |

### 구현 결과

- `src/lib/pdf.ts`에 PDF.js 전송용 독립 바이트 복사, 암호 PDF 판별, 편집용 strict load 계약을 추가했다. 큰 PDF의 불필요한 이중 복사와 편집 단계 이중 파싱은 독립 리뷰 후 제거했다.
- Split·Rotate·Extract·Delete·Merge는 암호 PDF를 작업 화면 또는 병합 대기열에 넣기 전에 기존 한·영 안내로 거절한다. 실제 비밀번호 입력·복호화·암호 제거 기능은 이번 범위에 넣지 않았다.
- PDF→JPG는 최초 PDF.js 분석이 복사본 버퍼를 가져가도 원본 상태 버퍼를 보존해 변환 단계에서 `detached ArrayBuffer`가 발생하지 않는다.
- `src/lib/pathname.ts`로 끝의 `/`를 정규화해 Cloudflare의 `/pdf-split/`에서도 상세 가이드, 언어 전환, canonical·alternate·구조화 URL을 같은 경로로 계산한다.
- React 19 hydration 불일치의 별도 원인이던 JSON-LD 이동을 고쳤다. JSON-LD는 prerender 결과의 React root 안에 정확히 1개 남고 head에는 중복하지 않는다.
- 병합 파일 검증 중과 실제 병합 중에는 추가·삭제·재정렬·전체 삭제·중복 병합을 동기 ref와 UI disabled로 막는다. 잠금 중 드롭도 기본 브라우저 PDF 열기로 빠지지 않도록 handler가 항상 `preventDefault()`를 실행한다.
- 테스트 스크립트와 14개 회귀 테스트를 추가했고 기존 lint 17건을 행동 변경 없이 정리했다.

### 커밋

- `68746a9` — PDF 검사·버퍼 복사·경로 정규화·테스트·lint 정리
- `cfc3493` — JSON-LD prerender hydration 계약 수정
- `5f83839` — 병합 선택 순서·검증 직렬화·PDF 복사/파싱 최소화·실행형 테스트 보강
- `19819db` — 병합 큐 상호작용 잠금과 drop 기본동작 방지
- `68cf597` — 잠금 중에도 drop handler가 이벤트를 받도록 CSS hit-testing 보정

### 최종 검증

- `npm test`: 14/14 통과, 실패·취소·건너뜀 0. Node의 `--experimental-strip-types` 안내는 남지만 테스트 exit 0이다.
- `npm run lint`: 오류 0, exit 0.
- `npm run build`: TypeScript와 Vite 빌드 통과, 40개 공개 경로와 404 prerender 완료, exit 0. 약 500 kB 초과 chunk 경고는 남는다.
- JSON-LD 계약: PDF 분할·PDF→JPG와 영문 대응 경로에서 `total=1`, `root=1`, `head=0`을 확인했다.
- 최신 로컬 production preview `/pdf-to-jpg/`: 첫 로드 콘솔 error/warn 0, 합성 2페이지 정상 PDF 변환 성공 알림, 변환 후 콘솔 error/warn 0.
- 최신 로컬 production preview `/pdf-merge/`: 상세 가이드와 `/en/pdf-merge` 링크 표시, 합성 암호 PDF 즉시 거절 후 대기열 미등록.
- 독립 코드 리뷰는 세 번의 보완 라운드 뒤 Critical 0, Important 0, `Ready: Yes`로 종료했다.
- `git diff --check`와 최종 작업 트리 상태는 이 인계 커밋 직전에 다시 확인한다.

### 미검증·승인 대기·범위 밖

- 원격 push, Cloudflare 운영 배포, 운영 URL 재검증은 하지 않았다. `source_version != deployed_version`이므로 운영 사이트가 고쳐졌다고 보고하면 안 된다.
- 인앱 브라우저는 Blob 다운로드 이벤트를 포착하지 못해 실제 결과 파일 다운로드와 열기까지는 확정하지 않았다. 일반 Chrome·Edge·Firefox·Safari/iOS 다운로드 대조가 남아 있다.
- 최신 로컬 브라우저에서 Rotate·Extract·Delete의 실제 암호 PDF 거절을 각각 반복하지 않았고, 자동 테스트와 동일 공통 helper 사용·빌드로만 확인했다.
- 다운로드 URL 해제 시점, AdSense·CSP·개인정보 고지, 파일·페이지·픽셀 상한, WebP/GIF 거절, 삭제 입력 `,` 검증, 키보드 접근성은 이번 승인 범위 밖이라 변경하지 않았다.
- 자동 결제·외부 발송·권한 변경·데이터 삭제는 0회다.

### 롤백

- 운영 배포 전이므로 운영 롤백은 필요 없다.
- 로컬 수정은 위 5개 기능 커밋을 역순으로 `git revert`하면 복원할 수 있으며, 진단 기록 커밋 `2e2cc4b`는 별도로 유지할 수 있다.

## 2026-09-03 운영 사이트 기능 진단

### 작업 레코드

| 필드 | 값 |
|---|---|
| task_id | PDFSITE-DIAG-20260903 |
| requested_by | 회장 |
| objective | PDFFlow 운영 사이트가 제대로 작동하지 않는 원인 확인 |
| scope | 읽기 전용 소스·빌드·운영 화면·합성 PDF 재현 |
| executor | CODEX |
| base_commit | `0cf20c6a55edb29aa98704b60592ffad7d18a8ea` |
| started_at | 2026-09-03T15:00:00+09:00 |
| completed_at | 2026-09-03T15:27:24+09:00 |
| cost | `null` / `UNAVAILABLE` |
| result | 일부 완료 — 주요 원인 3건 확정, 수정·배포 미실시 |

### 시작 상태와 보존

- 시작 브랜치 `main`, HEAD `0cf20c6`, `origin/main`과 차이 없고 추적·미추적 변경이 없었다.
- 프로젝트 전용 인계 문서가 없어 회사 공용 `C:\AI_Company_OS\00_AI_TOOL_HANDOFF.md`를 확인했다.
- 회사 잠금 점검은 `CONFLICT=NO`였다. 진단용 합성 PDF 3개는 `tmp/pdfs`에 만들었다가 검증 후 제거해 작업 트리를 다시 깨끗하게 했다.
- 제품 소스, 설정, 데이터, 운영 배포는 변경하지 않았다.

### 확정된 주요 결함

1. **정상 PDF도 PDF→JPG 변환 실패**
   - 운영 `https://www.pdfflow.xyz/pdf-to-jpg/`에서 합성 2페이지 정상 PDF를 선택하고 변환했다.
   - 콘솔에 `TypeError: Cannot perform Construct on a detached ArrayBuffer`가 재현됐다.
   - `src/pages/tools/PdfToJpg.tsx`가 최초 분석 때 PDF.js에 넘긴 `ArrayBuffer`를 상태에 저장한 뒤 변환 때 같은 버퍼를 다시 사용한다.

2. **암호 PDF 계약 모순 및 암호해제 기능 부재**
   - 운영 분할 도구는 합성 암호 PDF를 받아 `총 1 페이지`로 표시했지만 실행하면 `PDFDocument.load is encrypted` 오류가 발생했다.
   - `SplitPdf.tsx`, `RotatePdf.tsx`, `ExtractPages.tsx`, `DeletePages.tsx`는 최초 로드만 `ignoreEncryption: true`이고 실제 처리에서는 엄격 로드한다.
   - 암호 입력, 복호화, 암호 제거 라우트는 없다. `ignoreEncryption`은 복호화 기능이 아니다.

3. **운영 trailing slash 때문에 SSR/hydration·상세 가이드·언어 전환 불일치**
   - Cloudflare는 `/pdf-merge`를 `/pdf-merge/`로 308 전환한다.
   - 서버 HTML에는 상세 가이드가 있지만 hydration 뒤 화면에서는 사라지고 React production error `#418`이 발생한다.
   - `/pdf-split/`에서 영문 전환 링크가 해당 영문 도구가 아닌 `/en`으로 계산된다.
   - `src/data/toolGuides.ts`와 `src/components/Header.tsx`가 끝의 `/`를 공통 정규화하지 않는 것이 직접 원인이다.

### 추가 확인 결과

- `npm run build`: 통과. Vite 빌드 및 40개 공개 경로 사전 렌더링 완료.
- `npm run lint`: 실패. 17 errors, 0 warnings.
- 운영 홈, robots.txt, sitemap.xml: HTTP 200. `/pdf-merge`: HTTP 308 후 `/pdf-merge/`.
- 운영 메인 JS `/assets/index-Cx_B59sp.js`와 새 로컬 빌드 파일 SHA-256이 일치했다. 확인한 한 번들의 원본·배포 일치 증거이며 전체 산출물 동일성을 뜻하지 않는다.
- 합성 정상 PDF 두 개의 pdf-lib 병합 알고리즘은 메모리상 3페이지 결과를 만들었다.
- 정상 병합 뒤 다운로드 이벤트는 로컬·운영 인앱 브라우저에서 관찰되지 않았다. 모든 도구의 동기 `URL.revokeObjectURL()`이 후보지만 일반 Chrome·Edge 대조 전에는 앱 원인으로 확정하지 않는다.
- 모든 도구 페이지에서 AdSense 원격 스크립트가 실행되고 CSP 및 파일 크기·페이지·출력 픽셀 제한이 없다. 실제 문서 바이트가 Google로 전송됐다는 증거는 없다.

### 독립 감수

- PDF 기능, 보안·개인정보, UX·라우팅을 서로 겹치지 않게 읽기 전용으로 검토했다.
- 별도 최종 품질 감수 판정은 `일부 완료 / 현재 운영 사이트 품질 실패`다.
- 빌드 성공이나 HTTP 200을 기능 정상 증거로 사용하지 않으며, 모든 도구가 고장 났다고 일반화하지 않는다.

### 미실시·승인 대기

- 소스 수정, 자동 회귀 테스트 추가, lint 보정, 일반 Chrome·Edge·Firefox·Safari 실기기 다운로드 검증을 하지 않았다.
- 운영 배포, 원격 push, Cloudflare 설정 변경, 광고 설정 변경, 외부 발송, 결제는 하지 않았다.
- 수정 권고 순서: 암호 PDF 지원 범위 결정 → 실패 회귀 테스트 → PDF.js 버퍼와 경로 정규화 최소 수정 → 다운로드 대조 검증 → lint·입력 제한·CSP 보완 → 별도 승인 후 배포 및 운영 재검증.

## 다음 도구가 가장 먼저 할 일

1. `git status --short --branch`, 최근 커밋, 이 문서와 diff를 확인한다.
2. 현재 HEAD의 로컬 검증은 완료됐지만 운영은 미배포이므로 배포 승인 기록을 먼저 확인한다.
3. 배포 승인이 있으면 push·배포 대상과 롤백 지점을 다시 설명한 뒤 실행하고, 운영 URL에서 PDF→JPG·암호 PDF 거절·언어 전환·hydration 콘솔·실제 다운로드를 확인한다.
