import { normalizePathname } from '../lib/pathname.ts';

export interface ToolGuideContent {
  heading: string;
  overview: string[];
  facts: { label: string; value: string }[];
  bestForTitle: string;
  bestFor: string[];
  verifyTitle: string;
  verify: string[];
}

type LocalizedGuide = {
  ko: ToolGuideContent;
  en: ToolGuideContent;
};

export const toolGuides: Record<string, LocalizedGuide> = {
  '/pdf-merge': {
    ko: {
      heading: 'PDF 병합 방식과 결과 확인',
      overview: [
        '이 도구는 각 원본 PDF의 페이지를 사용자가 정한 순서대로 새 문서에 복사합니다. 페이지를 이미지로 다시 찍는 방식이 아니므로 일반적인 텍스트·벡터 문서는 선명도를 유지하고, 원본 파일은 변경하지 않습니다.',
        '다만 문서 전체에 연결된 목차, 전자서명, 양식, 첨부파일 같은 고급 기능은 병합 과정에서 유지되지 않거나 서명이 무효가 될 수 있습니다. 제출용 문서는 다운로드 후 페이지 순서와 링크를 다시 확인하세요.'
      ],
      facts: [
        { label: '입력', value: '2개 이상의 PDF' },
        { label: '출력', value: '정렬된 단일 PDF' },
        { label: '처리 위치', value: '현재 브라우저 메모리' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['증빙서류를 한 파일로 제출할 때', '부서별 보고서를 정해진 순서로 묶을 때', '표지와 본문, 부록을 하나의 문서로 구성할 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['첫 페이지부터 마지막 페이지까지 순서 확인', '목차·내부 링크와 양식 필드 작동 여부 확인', '전자서명 문서는 새로 서명해야 하는지 확인']
    },
    en: {
      heading: 'How PDF merging works and what to verify',
      overview: [
        'This tool copies pages from each source PDF into a new document in the order you choose. It does not take screenshots of the pages, so ordinary text and vector documents retain their visual clarity while the source files remain unchanged.',
        'Document-level features such as outlines, digital signatures, forms, and embedded attachments may not survive a merge, and existing signatures can become invalid. Review page order and interactive elements before submitting the result.'
      ],
      facts: [
        { label: 'Input', value: 'Two or more PDFs' },
        { label: 'Output', value: 'One ordered PDF' },
        { label: 'Processing', value: 'Current browser memory' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Combining evidence into one upload', 'Collecting departmental reports in order', 'Joining a cover, main document, and appendices'],
      verifyTitle: 'Checks after download',
      verify: ['Review the first-to-last page order', 'Test outlines, internal links, and form fields', 'Confirm whether a signed document must be signed again']
    }
  },
  '/pdf-split': {
    ko: {
      heading: 'PDF 분할 범위와 결과 파일 이해하기',
      overview: [
        'PDF 분할은 한 문서에서 여러 페이지 범위를 각각 별도 PDF로 복사하는 작업입니다. 예를 들어 1-3, 8-10을 입력하면 두 개의 결과 문서가 만들어지며, 여러 결과는 ZIP으로 묶어 내려받습니다.',
        '화면에 인쇄된 쪽 번호와 PDF 뷰어가 표시하는 실제 페이지 번호가 다를 수 있습니다. 표지와 로마 숫자 목차가 있는 문서는 입력 전에 브라우저 또는 PDF 뷰어의 페이지 카운터를 기준으로 범위를 확인하세요.'
      ],
      facts: [
        { label: '입력 형식', value: '1-3, 8-10 같은 범위' },
        { label: '출력', value: '범위별 PDF 또는 ZIP' },
        { label: '원본 변경', value: '변경하지 않음' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['긴 매뉴얼을 장별로 나눌 때', '계약서에서 공유 가능한 구간만 분리할 때', '메일 첨부 용량을 구간별로 나눌 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['각 결과의 시작·끝 페이지 확인', '겹치는 범위를 의도적으로 입력했는지 확인', '목차 링크가 새 문서에서도 필요한지 확인']
    },
    en: {
      heading: 'Understanding ranges and split outputs',
      overview: [
        'PDF splitting copies multiple page ranges from one document into separate PDFs. Entering 1-3 and 8-10 produces two output documents; when there is more than one result, they are downloaded together as a ZIP archive.',
        'Printed page numbers can differ from the page counter shown by a PDF viewer. For documents with covers or Roman-numeral front matter, confirm ranges against the viewer counter before processing.'
      ],
      facts: [
        { label: 'Range format', value: 'Ranges such as 1-3, 8-10' },
        { label: 'Output', value: 'PDFs by range or a ZIP' },
        { label: 'Source file', value: 'Never modified' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Separating a manual by chapter', 'Sharing only an allowed contract section', 'Breaking a large attachment into smaller parts'],
      verifyTitle: 'Checks after download',
      verify: ['Confirm the start and end page of every result', 'Check whether overlapping ranges were intentional', 'Test any outline links you still need']
    }
  },
  '/pdf-extract-pages': {
    ko: {
      heading: '페이지 추출과 분할의 차이',
      overview: [
        '페이지 추출은 흩어진 특정 페이지를 골라 하나의 새 PDF로 만드는 기능입니다. 2, 5, 9-11처럼 단일 번호와 범위를 섞어 입력할 수 있고, 입력한 순서대로 페이지가 복사됩니다.',
        '분할이 구간마다 여러 파일을 만드는 작업이라면 추출은 선택한 페이지를 한 결과에 모읍니다. 중복 번호를 입력하면 같은 페이지가 여러 번 포함될 수 있으므로 최종 페이지 수를 확인하세요.'
      ],
      facts: [
        { label: '입력 형식', value: '2, 5, 9-11' },
        { label: '출력', value: '선택 페이지로 만든 PDF 1개' },
        { label: '페이지 순서', value: '입력한 순서 유지' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['견적서에서 서명 페이지와 조건만 모을 때', '논문에서 필요한 표와 부록만 저장할 때', '개인정보가 있는 나머지 페이지를 공유하지 않을 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['누락하거나 중복한 페이지가 없는지 확인', '민감한 정보가 결과에 남아 있지 않은지 확인', '문서 전체 목차가 필요한 파일인지 확인']
    },
    en: {
      heading: 'Page extraction compared with splitting',
      overview: [
        'Extraction collects selected pages from different parts of a document into one new PDF. You can mix individual pages and ranges, such as 2, 5, 9-11, and pages are copied in the order entered.',
        'Splitting creates a separate file for every range; extraction combines the selection into one result. Duplicate numbers can intentionally repeat a page, so confirm the final page count.'
      ],
      facts: [
        { label: 'Selection format', value: '2, 5, 9-11' },
        { label: 'Output', value: 'One PDF of selected pages' },
        { label: 'Page order', value: 'Follows the entered order' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Collecting signature and terms pages', 'Saving selected tables and appendices', 'Avoiding disclosure of unrelated pages'],
      verifyTitle: 'Checks after download',
      verify: ['Look for missing or repeated pages', 'Confirm no sensitive content remains', 'Decide whether document-level outlines are required']
    }
  },
  '/pdf-delete-pages': {
    ko: {
      heading: '삭제 작업 전에 알아둘 점',
      overview: [
        '이 도구는 삭제할 페이지를 제외한 나머지 페이지를 새 PDF로 복사합니다. 원본에서 실제로 지우는 방식이 아니므로 원본 파일은 그대로 남지만, 결과 파일에서는 제거한 페이지를 되돌릴 수 없습니다.',
        '페이지를 삭제해도 문서 속성이나 공유 리소스가 남아 파일 크기가 기대만큼 줄지 않을 수 있습니다. 또한 목차, 페이지 참조, 전자서명은 페이지 구조 변경의 영향을 받을 수 있습니다.'
      ],
      facts: [
        { label: '입력 형식', value: '3, 6, 8-12' },
        { label: '출력', value: '나머지 페이지로 만든 새 PDF' },
        { label: '최소 조건', value: '1페이지 이상 유지' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['스캔본의 빈 페이지를 제거할 때', '배포본에서 내부 검토 페이지를 뺄 때', '잘못 삽입된 중복 페이지를 정리할 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['원본 백업을 보관했는지 확인', '앞뒤 문맥과 페이지 참조가 자연스러운지 확인', '삭제 대상에 개인정보가 실제로 빠졌는지 확인']
    },
    en: {
      heading: 'What to know before deleting pages',
      overview: [
        'The tool creates a new PDF by copying every page except the ones selected for deletion. The source file remains intact, but removed pages cannot be restored from the downloaded result.',
        'File size may not fall as much as expected because PDFs can retain shared resources. Outlines, page references, and digital signatures can also be affected by a changed page structure.'
      ],
      facts: [
        { label: 'Selection format', value: '3, 6, 8-12' },
        { label: 'Output', value: 'New PDF of remaining pages' },
        { label: 'Minimum', value: 'At least one page remains' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Removing blank scan pages', 'Excluding internal review pages', 'Cleaning up duplicated pages'],
      verifyTitle: 'Checks after download',
      verify: ['Keep a backup of the source', 'Review surrounding text and page references', 'Confirm sensitive pages are truly absent']
    }
  },
  '/pdf-rotate': {
    ko: {
      heading: 'PDF 회전은 화질을 다시 압축하지 않습니다',
      overview: [
        'PDF 회전은 페이지 내용을 이미지로 변환하지 않고 페이지의 회전 값을 바꿔 새 문서로 저장합니다. 따라서 일반적인 텍스트와 선은 다시 압축되지 않으며, 원본 페이지의 가로·세로 크기도 유지됩니다.',
        '현재 도구는 문서 전체 페이지에 같은 각도를 적용합니다. 일부 페이지만 방향이 잘못된 문서라면 먼저 해당 페이지만 추출해 회전한 뒤 다시 합치는 순서가 더 안전합니다.'
      ],
      facts: [
        { label: '각도', value: '90°, 180°, 270°' },
        { label: '적용 범위', value: '문서의 모든 페이지' },
        { label: '재압축', value: '하지 않음' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['휴대폰 스캔본이 옆으로 누웠을 때', '가로 문서 전체의 방향을 바로잡을 때', '인쇄 전 모든 페이지 방향을 통일할 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['세로·가로가 섞인 문서인지 먼저 확인', '주석과 양식 위치가 정상인지 확인', '서명된 PDF라면 서명 유효성 확인']
    },
    en: {
      heading: 'Rotation does not re-compress page graphics',
      overview: [
        'PDF rotation changes the page rotation value and saves a new document instead of converting pages to images. Normal text and line art are not re-compressed, and the original page dimensions remain intact.',
        'This tool applies one angle to every page. If only a few pages are sideways, extract those pages, rotate them, and merge them back into the document.'
      ],
      facts: [
        { label: 'Angles', value: '90°, 180°, 270°' },
        { label: 'Scope', value: 'Every page in the document' },
        { label: 'Re-compression', value: 'None' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Correcting sideways phone scans', 'Fixing an entire landscape document', 'Standardizing orientation before printing'],
      verifyTitle: 'Checks after download',
      verify: ['Check whether orientations are mixed', 'Review annotation and form placement', 'Validate signatures on signed PDFs']
    }
  },
  '/jpg-to-pdf': {
    ko: {
      heading: '이미지 크기와 PDF 페이지가 정해지는 방식',
      overview: [
        '각 이미지의 픽셀 크기와 방향을 읽어 한 이미지당 한 PDF 페이지를 만듭니다. 사진을 임의로 자르거나 정사각형으로 늘리지 않으며, 목록에서 정한 순서가 PDF 페이지 순서가 됩니다.',
        '고해상도 사진을 여러 장 넣으면 결과 파일도 커집니다. 이메일이나 제출 시스템의 용량 제한이 있다면 이미지 해상도를 먼저 줄이고, 영수증·신분증 사진은 글자가 읽히는지 확대해 확인하세요.'
      ],
      facts: [
        { label: '지원 형식', value: 'JPG, JPEG, PNG' },
        { label: '페이지 구성', value: '이미지 1장당 1페이지' },
        { label: '정렬', value: '목록 순서대로 생성' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['여러 영수증을 한 증빙 파일로 만들 때', '스캔 사진을 페이지 순서대로 묶을 때', '이미지만 허용된 자료를 PDF로 제출할 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['이미지 순서와 회전 방향 확인', '작은 글자와 도장이 읽히는지 확대 확인', '투명 PNG의 배경 표현 확인']
    },
    en: {
      heading: 'How image dimensions become PDF pages',
      overview: [
        'The tool reads each image dimension and orientation, then creates one PDF page per image. It does not crop photos or stretch them into a square, and the list order becomes the PDF page order.',
        'High-resolution photos produce a large PDF. If an email or submission portal has a size limit, reduce image resolution first and zoom in to verify that text on receipts or identity documents remains readable.'
      ],
      facts: [
        { label: 'Formats', value: 'JPG, JPEG, PNG' },
        { label: 'Layout', value: 'One image per page' },
        { label: 'Ordering', value: 'Follows the image list' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Combining receipts into one attachment', 'Ordering scan photos as pages', 'Submitting image-only material as a PDF'],
      verifyTitle: 'Checks after download',
      verify: ['Review image order and orientation', 'Zoom in to check small text and stamps', 'Inspect the background of transparent PNG files']
    }
  },
  '/pdf-to-jpg': {
    ko: {
      heading: 'PDF를 JPG로 바꾸면 달라지는 점',
      overview: [
        'PDF 페이지를 화면에 그린 뒤 픽셀 이미지로 저장하므로 텍스트 검색, 복사, 링크, 양식 기능은 JPG에 포함되지 않습니다. 대신 PDF 뷰어가 없는 환경이나 이미지 업로드 화면에서 페이지를 바로 사용할 수 있습니다.',
        '해상도를 높이면 작은 글자가 선명해지지만 메모리 사용량과 ZIP 용량도 크게 늘어납니다. 많은 페이지는 필요한 범위만 먼저 변환하고, 결과 이미지 한 장을 확대해 품질을 확인한 뒤 전체 작업을 진행하는 편이 안전합니다.'
      ],
      facts: [
        { label: '출력', value: '페이지별 JPG 및 ZIP' },
        { label: '텍스트 검색', value: '이미지에서는 불가' },
        { label: '처리 방식', value: '브라우저 캔버스 렌더링' }
      ],
      bestForTitle: '이럴 때 적합합니다',
      bestFor: ['PDF 한 페이지를 이미지 게시물로 쓸 때', 'PDF를 지원하지 않는 시스템에 올릴 때', '문서 내용을 이미지 미리보기로 공유할 때'],
      verifyTitle: '다운로드 후 확인할 항목',
      verify: ['작은 글자와 가는 선의 선명도 확인', '선택한 페이지 범위가 맞는지 확인', '개인정보가 이미지에 그대로 노출되지 않는지 확인']
    },
    en: {
      heading: 'What changes when a PDF becomes JPG',
      overview: [
        'Each PDF page is drawn to a pixel image, so text search, copying, links, and form controls are not available in the JPG. The image can instead be used in services that do not accept PDF files.',
        'Higher resolution makes small text clearer but increases memory use and ZIP size. For long documents, convert only the required range and inspect one image at full size before processing everything.'
      ],
      facts: [
        { label: 'Output', value: 'JPG files and a ZIP' },
        { label: 'Text search', value: 'Not available in images' },
        { label: 'Method', value: 'Browser canvas rendering' }
      ],
      bestForTitle: 'Good use cases',
      bestFor: ['Using a PDF page in an image post', 'Uploading to a system without PDF support', 'Sharing document pages as previews'],
      verifyTitle: 'Checks after download',
      verify: ['Inspect small text and thin lines', 'Confirm the selected page range', 'Check that images do not expose private information']
    }
  }
};

export const getToolGuide = (pathname: string, isEn: boolean): ToolGuideContent | undefined => {
  const normalizedPath = normalizePathname(pathname).replace(/^\/en(?=\/|$)/, '') || '/';
  const guide = toolGuides[normalizedPath];
  return guide?.[isEn ? 'en' : 'ko'];
};
