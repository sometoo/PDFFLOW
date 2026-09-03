---
schema_version: "1.0"
protocol_version: "v1.0.0"
last_updated_at: "2026-09-03T15:27:24+09:00"
last_updated_by: "CODEX"
base_commit: "0cf20c6a55edb29aa98704b60592ffad7d18a8ea"
previous_tool: "UNKNOWN"
previous_change_status: "DIAGNOSED_NOT_FIXED"
compatibility_status: "PARTIAL"
verification_status: "FAILED"
next_action: "회장이 수정 범위를 승인하면 정상 PDF-to-JPG, 암호 PDF 계약, trailing slash 및 언어 전환 회귀 테스트부터 추가하고 최소 수정한다."
---

# Codex·Claude Code·Hermes 공용 인계 현황

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
2. 회장이 아직 수정 범위를 승인하지 않았다면 진단 상태를 보존하고 코드를 편집하지 않는다.
3. 승인되면 `PdfToJpg.tsx` 정상 입력 실패, 암호 PDF 업로드/실행 계약, `/pdf-split/` 경로와 언어 전환을 먼저 실패 테스트로 고정한다.
