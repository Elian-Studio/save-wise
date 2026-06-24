/**
 * 광고 네트워크 ID — Vite 환경변수에서 읽는다.
 * 값이 없으면 해당 슬롯은 렌더되지 않으므로(빈 ID = 광고 영역 미노출),
 * 가입 전에도 안전하게 배포된다. 가입 후 Vercel 환경변수(또는 .env.local)에 채우면 켜진다.
 */
const env = import.meta.env;

export type AdSlotKey = 'top' | 'mid' | 'foot';

export const ADS = {
  adfit: {
    top: env.VITE_ADFIT_UNIT_TOP ?? '',
    mid: env.VITE_ADFIT_UNIT_MID ?? '',
    foot: env.VITE_ADFIT_UNIT_FOOT ?? '',
  },
  adsense: {
    client: env.VITE_ADSENSE_CLIENT ?? '',
    top: env.VITE_ADSENSE_SLOT_TOP ?? '',
    mid: env.VITE_ADSENSE_SLOT_MID ?? '',
    foot: env.VITE_ADSENSE_SLOT_FOOT ?? '',
  },
} as const;

/** 문의 이메일 — 푸터·개인정보처리방침에서 사용. 전용 주소를 쓰려면 여기만 바꾸면 됨. */
export const CONTACT_EMAIL = 'danielmrbang@gmail.com';
