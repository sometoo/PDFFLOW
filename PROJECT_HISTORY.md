# PDFFlow 프로젝트 작업 히스토리 요약 (Cloudflare Pages 배포용)

본 문서에는 이 프로젝트에서 진행된 모든 주요 변경 사항 및 작업 히스토리가 기록되어 있습니다. 다른 프로젝트나 새로운 환경에서 동일한 설정을 적용할 때 참고하여 활용하시기 바랍니다.

---

## 1. 도메인 변경 작업 (`pdfflow.com` -> `www.pdfflow.xyz`)
기존 도메인(`pdfflow.com`)에서 신규 도메인(`www.pdfflow.xyz`)으로 사이트 설정을 변경하기 위해 다음 파일들을 수정했습니다.

### ① [SEO.tsx](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/src/components/SEO.tsx)
SEO 캐노니컬 URL의 기본 도메인 주소를 업데이트했습니다.
```typescript
// 변경 전:
const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://pdfflow.com';

// 변경 후:
const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://www.pdfflow.xyz';
```

### ② [robots.txt](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/public/robots.txt)
사이트맵 주소를 신규 도메인으로 변경했습니다.
```text
// 변경 전:
Sitemap: https://pdfflow.com/sitemap.xml

// 변경 후:
Sitemap: https://www.pdfflow.xyz/sitemap.xml
```

### ③ [sitemap.xml](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/public/sitemap.xml)
파일 내 모든 `<loc>https://pdfflow.com/...</loc>` 형태의 URL 주소를 `<loc>https://www.pdfflow.xyz/...</loc>`로 일괄 변경했습니다.

---

## 2. 네이버 서치어드바이저 및 SEO 메타 태그 최적화
검색 노출 최적화(SEO) 및 검색 엔진 등록을 위해 메타 태그를 보완했습니다.

### ① [index.html](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/index.html) 수정 사항
*   **네이버 서치어드바이저 사이트 소유 확인 태그 추가**
*   **기본 Title 태그 수정 및 메타 Description 추가**
*   **Open Graph (카카오톡, 페이스북 공유용) 태그 추가**
*   **Twitter Card 태그 추가**

**`index.html` 내 `<head>` 영역 추가 코드:**
```html
<meta name="naver-site-verification" content="c676dac24a5ee8edf68caf383bdb18a6c6dd4469" />
<meta name="description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
<title>무료 PDF 도구 모음 - PDFFlow</title>

<!-- Open Graph -->
<meta property="og:title" content="무료 PDF 도구 모음 - PDFFlow" />
<meta property="og:description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
<meta property="og:url" content="https://www.pdfflow.xyz/" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="PDFFlow" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary" />
<meta name="twitter:title" content="무료 PDF 도구 모음 - PDFFlow" />
<meta name="twitter:description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
```

---

## 3. 구글 애드센스 (Google AdSense) 설정
구글 애드센스 승인 및 광고 게재를 위한 인증 코드와 소유자 파일 설정을 완료했습니다.

### ① [index.html](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/index.html) 수정 사항
`<head>` 영역에 구글 애드센스 심사용 자동 광고 스크립트 코드를 삽입했습니다.
```html
<!-- Google AdSense Verification -->
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4100029225841507"
 crossorigin="anonymous"></script>
```

### ② [ads.txt](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/public/ads.txt) 생성 `[NEW]`
게시자 소유권을 증명하는 `ads.txt` 파일을 생성했습니다.
```text
google.com, pub-4100029225841507, DIRECT, f08c47fec0942fa0
```

---

## 4. Cloudflare Pages 배포 및 검색 엔진 크롤러 최적화 설정
Cloudflare Pages(SPA 구조)에서 검색 엔진 크롤러가 사이트맵과 로봇 파일에 정상적으로 접근할 수 있도록 하고 올바른 응답 헤더를 주기 위해 추가 설정을 진행했습니다.

### ① [_headers](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/public/_headers) 파일 생성 `[NEW]`
Cloudflare Pages 빌드 시 `/sitemap.xml`과 `/robots.txt`에 정확한 `Content-Type`과 캐싱 규칙, 검색 제한 설정을 제공하도록 헤더 파일을 추가했습니다. (sitemap.xml은 검색엔진에만 읽히게 하기 위해 `X-Robots-Tag: noindex` 설정 적용)
```text
/sitemap.xml
  Content-Type: application/xml; charset=utf-8
  Cache-Control: public, max-age=3600
  X-Robots-Tag: noindex

/robots.txt
  Content-Type: text/plain; charset=utf-8
  Cache-Control: public, max-age=3600
```

### ② [_redirects](file:///c:/Users/sometoo/Desktop/작업/안티그래비티작업/PDF%20암호해제%20병합%20사이트/public/_redirects) 설정 수정
*   **주의 사항**: React SPA 라우팅을 위해 `/* /index.html 200` 리다이렉트 룰만 남겨두었습니다. 
*   Cloudflare Pages의 경우, 빌드 폴더(`dist`) 안에 실제 존재하는 정적 파일(`sitemap.xml`, `robots.txt`, `favicon.svg` 등)은 리다이렉트 규칙보다 우선하여 서빙되므로, `_redirects` 파일에 별도로 예외 규칙(`/sitemap.xml /sitemap.xml 200` 등)을 추가할 필요가 없습니다. (추가할 경우 오히려 무한 루프나 오류가 발생할 수 있습니다.)

```text
/*    /index.html   200
```

---

## 5. 변경된 전체 코드 변경 내역 (Git Diff)

```diff
diff --git a/index.html b/index.html
index d79f15c..40c86dd 100644
--- a/index.html
+++ b/index.html
@@ -4,11 +4,26 @@
     <meta charset="UTF-8" />
     <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
     <meta name="viewport" content="width=device-width, initial-scale=1.0" />
-    <title>PDFFlow - 무료 PDF 도구 모음</title>
+    <meta name="naver-site-verification" content="c676dac24a5ee8edf68caf383bdb18a6c6dd4469" />
+    <meta name="description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
+    <title>무료 PDF 도구 모음 - PDFFlow</title>
+    <!-- Open Graph -->
+    <meta property="og:title" content="무료 PDF 도구 모음 - PDFFlow" />
+    <meta property="og:description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
+    <meta property="og:url" content="https://www.pdfflow.xyz/" />
+    <meta property="og:type" content="website" />
+    <meta property="og:site_name" content="PDFFlow" />
+    <!-- Twitter Card -->
+    <meta name="twitter:card" content="summary" />
+    <meta name="twitter:title" content="무료 PDF 도구 모음 - PDFFlow" />
+    <meta name="twitter:description" content="파일 업로드 없이 브라우저에서 PDF 합치기, 분할, 회전, JPG 변환을 안전하게 처리하세요." />
     <!-- Google Fonts -->
     <link rel="preconnect" href="https://fonts.googleapis.com">
     <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
     <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
+    <!-- Google AdSense Verification -->
+    <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4100029225841507"
+     crossorigin="anonymous"></script>
   </head>
   <body class="bg-slate-50 text-slate-900 font-sans antialiased">
     <div id="root"></div>

diff --git a/src/components/SEO.tsx b/src/components/SEO.tsx
index 967ba96..5d725d5 100644
--- a/src/components/SEO.tsx
+++ b/src/components/SEO.tsx
@@ -25,7 +25,7 @@ const slugMap: Record<string, string> = {
 };
 
 // Easily configure the actual target domain here (or via .env VITE_SITE_URL variable)
-const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://pdfflow.com';
+const SITE_ORIGIN = import.meta.env.VITE_SITE_URL || 'https://www.pdfflow.xyz';
 
 const SEO: React.FC<SEOProps> = ({ title, description, canonical, noindex }) => {
   const location = useLocation();

diff --git a/public/robots.txt b/public/robots.txt
index 3088a9b..56b3fe1 100644
--- a/public/robots.txt
+++ b/public/robots.txt
@@ -36,4 +36,4 @@ Disallow: /test/
 Disallow: /admin/
 Disallow: /404
 
-Sitemap: https://pdfflow.com/sitemap.xml
+Sitemap: https://www.pdfflow.xyz/sitemap.xml
```

---

## 6. 2026-07-20 AdSense 가치 보강 및 크롤링 구조 개선

AdSense의 "가치 없는 콘텐츠" 반려 사유를 보완하기 위해 단순 문구 증량이 아니라, 검색·심사 로봇이 실제 본문을 읽을 수 있는 구조와 사이트의 고유 정보 품질을 함께 개선했습니다.

### 주요 변경 사항

- Vite 빌드 후 한국어·영어 40개 공개 경로를 정적 HTML로 사전 렌더링하도록 `scripts/prerender.mjs`와 `src/entry-server.tsx`를 추가했습니다.
- 모든 유효 경로가 고유한 제목, 설명, 캐노니컬, hreflang, Open Graph 메타데이터와 본문을 첫 HTML 응답에서 제공합니다.
- 기존 SPA 전체 fallback 규칙을 제거하고 `404.html`을 생성하여 없는 주소가 정상적인 404 페이지로 처리되도록 했습니다.
- `ads.txt`, `robots.txt`, `sitemap.xml`이 독립 정적 파일로 배포되며, sitemap은 빌드 시 실제 공개 경로를 기준으로 다시 생성됩니다.
- 7개 PDF 도구 페이지에 처리 원리, 적합한 사용 사례, 결과 파일 검수 항목, 전자서명·양식·목차 등 고급 기능의 한계를 도구별로 추가했습니다.
- 소개 페이지와 개인정보처리방침을 실제 브라우저 처리 구조, 운영 책임, 접속·광고 요청과 문서 데이터의 구분이 드러나도록 전면 개정했습니다.
- `/editorial-policy`와 `/en/editorial-policy`를 추가해 작성·검증·수정·광고 독립 원칙을 공개했습니다.
- 블로그에 작성·검토 주체, 기술 검토일, 구조화 데이터와 결과 확인 안내를 추가하고 과도한 보안·품질 보장 표현을 사실 기반 문구로 수정했습니다.
- `pdf.js` 워커를 외부 CDN 대신 빌드 자산으로 포함하도록 변경했습니다.
- 사이트 전용 공유 미리보기 이미지 `public/og.png`를 추가하고 전체 페이지의 Open Graph/X 메타데이터에 연결했습니다.

### 배포 후 확인할 외부 설정

- Cloudflare에서 `pdfflow.xyz`를 `https://www.pdfflow.xyz`로 301 리디렉션하여 하나의 대표 호스트만 사용합니다.
- 배포 후 `https://www.pdfflow.xyz/ads.txt`가 `text/plain`으로 게시자 한 줄만 반환하는지 확인합니다.
- Search Console에서 새 `sitemap.xml`을 다시 제출하고 주요 페이지 색인 생성을 요청합니다.
- 유럽경제지역(EEA), 영국, 스위스 방문자에게 광고를 제공한다면 AdSense의 개인정보 보호 및 메시지에서 Google 인증 CMP 동의 메시지를 설정합니다.
