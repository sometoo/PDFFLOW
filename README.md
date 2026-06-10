# PDFFlow - 무료 PDF 도구 모음 (KR/EN)

PDFFlow는 사용자의 PDF 파일을 서버에 전송하지 않고, 웹 브라우저 내부(Client-side)에서만 연산을 처리하는 안전하고 빠른 무료 PDF 도구 모음 사이트입니다. 구글 애드센스 승인 및 검색 엔진 색인 노출에 최적화된 구조로 설계되었습니다.

## 주요 기능 및 페이지
- **PDF 가공 도구 (7개)**: PDF 합치기, PDF 분할, PDF 페이지 추출, PDF 페이지 삭제, PDF 회전, JPG PDF 변환, PDF JPG 변환
- **정보 페이지**: 사이트 소개, 이용약관, 개인정보처리방침, 문의하기
- **블로그 포스트**: 검색 노출 최적화를 위한 1,200자 이상의 고품질 한글/영문 가이드 수록
- **다국어 지원**: 헤더의 토글 버튼을 통해 한국어 ↔ 영어 경로(`/en/...`)로 부드럽게 상호 전환 가능

---

## Cloudflare Pages 배포 설정

본 사이트를 Cloudflare Pages에 배포할 때 아래와 같이 설정을 입력해 주세요.

- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: 프로젝트 루트 (기본값)
- **Production branch**: `main`

> **Note**: 이 프로젝트는 React Router(SPA)를 사용하므로, 서브 페이지 직접 접속 및 새로고침 시 404가 발생하지 않도록 `public/_redirects` 파일이 구성되어 있으며 빌드 시 `dist/` 폴더에 자동으로 배치됩니다.

---

## 배포 후 확인할 URL

배포 완료 및 커스텀 도메인 설정 후 정상 동작 확인을 위해 아래의 주소들을 방문하여 점검해 주세요.

- **메인 화면 (KR)**: `https://<your-domain>/`
- **메인 화면 (EN)**: `https://<your-domain>/en`
- **PDF 합치기 (KR)**: `https://<your-domain>/pdf-merge`
- **PDF 합치기 (EN)**: `https://<your-domain>/en/pdf-merge`
- **개인정보처리방침 (KR/EN)**: `https://<your-domain>/privacy` (EN 전환 가능)
- **이용약관 (KR/EN)**: `https://<your-domain>/terms` (EN 전환 가능)
- **문의하기 (KR/EN)**: `https://<your-domain>/contact` (EN 전환 가능)
- **블로그 목록 (KR/EN)**: `https://<your-domain>/blog` (EN 전환 가능)
- **사이트맵**: `https://<your-domain>/sitemap.xml`
- **검색엔진 로봇 설정**: `https://<your-domain>/robots.txt`

---

## 로컬 개발 및 빌드
의존성을 설치하고 로컬에서 검증하는 명령어입니다.

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 프로덕션 빌드 (dist/ 폴더 생성)
npm run build
```
