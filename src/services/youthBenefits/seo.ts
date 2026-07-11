import type { RouteSeo } from '../../seo/head';

// 가시 렌더 FAQ = FAQPage 구조화 데이터. 홈 화면에 그대로 노출되는 Q&A와 1:1 일치해야 함.
export const YOUTH_FAQ: { q: string; a: string }[] = [
  {
    q: '청년 지원금은 나이 몇 살까지 받을 수 있어?',
    a: '제도마다 달라. 청년내일저축계좌는 만 15~39세, 국민취업지원제도는 만 15~34세(병역 이행 시 최대 37세), 주택드림 청약통장·청년월세는 만 19~34세가 기준이야. 위 30초 진단에 나이·소득을 답하면 제도별로 대상 여부를 한 번에 확인해줘.',
  },
  {
    q: '소득이 있어도 청년 지원금을 받을 수 있어?',
    a: '대부분 가구 소득·본인 소득 기준이 있어. 예를 들어 청년내일저축계좌는 가구 중위소득 50% 이하, 국민취업지원제도는 120% 이하가 기준이야. 진단이 가구원 수와 월소득으로 중위소득 몇 %인지 추정해서 대상 가능성을 알려줘(정확한 판정은 신청 기관에서 확인해야 해).',
  },
  {
    q: '이미 끝난 청년 지원금도 있어?',
    a: '있어. 청년도약계좌는 2025년 12월에 신규 가입이 종료됐고(기존 보유자는 청년미래적금 갈아타기만 가능), 청년내일채움공제와 청년재직자 내일채움공제는 일몰되어 신규 가입이 불가능해. 오래된 블로그가 살아있는 것처럼 안내하는 경우가 많아 결과 화면에서 종료 제도를 따로 표시해.',
  },
];

const faqPageLd = (faq: { q: string; a: string }[]): object => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const youthBenefitsSeo: RouteSeo = {
  path: '/youth-benefits',
  title: '청년 지원금 자격진단 — 내일저축·국민취업·월세·주택드림 (2026)',
  description:
    '청년내일저축계좌·국민취업지원제도(구직촉진수당)·청년월세지원·주택드림 청약통장의 조건·자격을 나이·가구소득·주거 7문항으로 30초 만에 진단하는 무료 서비스. 2026년 기준 중위소득으로 판정.',
  keywords:
    '청년지원금, 청년혜택, 청년내일저축계좌 조건, 국민취업지원제도 조건, 구직촉진수당, 청년월세지원 조건, 청년 주택드림 청약통장, 청년 청약통장, 청년 지원금 자격진단',
  canonical: 'https://choicewise.kr/youth-benefits',
  jsonLd: [
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: 'choicewise 청년 지원금 자격진단',
      url: 'https://choicewise.kr/youth-benefits',
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      inLanguage: 'ko-KR',
      description:
        '나이·가구소득·주거 조건으로 청년내일저축계좌·국민취업지원제도·주택드림 청약통장·청년월세 등 2026년 청년 지원금 대상 여부를 30초 만에 진단하는 무료 서비스.',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' },
    },
    faqPageLd(YOUTH_FAQ),
  ],
};
