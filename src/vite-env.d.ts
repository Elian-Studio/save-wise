/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 카카오 애드핏 광고단위 ID (DAN-xxxx). 비어 있으면 해당 슬롯 미노출 */
  readonly VITE_ADFIT_UNIT_TOP?: string;
  readonly VITE_ADFIT_UNIT_MID?: string;
  readonly VITE_ADFIT_UNIT_FOOT?: string;
  /** 구글 애드센스 publisher (ca-pub-xxxx) 및 슬롯 ID */
  readonly VITE_ADSENSE_CLIENT?: string;
  readonly VITE_ADSENSE_SLOT_TOP?: string;
  readonly VITE_ADSENSE_SLOT_MID?: string;
  readonly VITE_ADSENSE_SLOT_FOOT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
  adsbygoogle?: unknown[];
}
