import type { RouteSeo } from '../../seo/head';

// 신뢰 페이지 SEO — /about(서비스 소개), /contact(문의).
export const aboutSeo: RouteSeo = {
  path: '/about',
  title: '서비스 소개 — choicewise',
  description:
    'choicewise는 교통카드 추천(패스와이즈), 청년적금 계산기, 청년 지원금 추천을 제공하는 무료 비교·계산 도구입니다. 정부 공식 자료를 검증해 내 상황에 맞는 선택지를 한 곳에서 비교합니다.',
  keywords: 'choicewise 소개, 데이터 출처, 갱신 정책, 무료 계산기, 교통카드 추천, 청년적금 계산기, 청년 지원금 추천',
  canonical: 'https://choicewise.kr/about',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: '서비스 소개 — choicewise',
      url: 'https://choicewise.kr/about',
      description:
        'choicewise는 교통카드 추천, 청년적금 계산기, 청년 지원금 추천을 제공하는 무료 비교·계산 도구입니다. 정부 공식 자료 기반, 회원가입·개인정보 수집 없음.',
      inLanguage: 'ko-KR',
    },
  ],
};

export const contactSeo: RouteSeo = {
  path: '/contact',
  title: '문의하기 — choicewise',
  description:
    'choicewise 문의 페이지. 데이터 오류 제보, 제도 변경 제보, 제휴 및 기타 문의를 이메일로 받습니다.',
  keywords: 'choicewise 문의, 데이터 오류 제보, 제도 변경 제보, 제휴 문의',
  canonical: 'https://choicewise.kr/contact',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: '문의하기 — choicewise',
      url: 'https://choicewise.kr/contact',
      description: 'choicewise 문의 페이지 — 데이터 오류 제보, 제도 변경 제보, 제휴 및 기타 문의.',
      inLanguage: 'ko-KR',
    },
  ],
};
