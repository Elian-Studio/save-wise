// 가이드 본문 문자열의 마크다운 링크 [라벨](href) 단일 출처 파서.
// 렌더(GuideArticlePage)와 플레인 텍스트 소비자(seo.ts JSON-LD)가 같은 문법을 공유한다.
// ponytail: 라벨 안의 ']'(중첩 대괄호)는 미지원 — 매치 실패 시 리터럴로 남는다. 작성 시 라벨에 대괄호 금지.

export type MdToken = string | { label: string; href: string };

// href는 한 단계 균형 괄호 허용: 위키·정부 URL의 "..._(South_Korea)" 케이스.
const LINK_RE = /\[([^\]]+)\]\(((?:[^()\s]|\([^()]*\))+)\)/g;

/** 문자열을 [텍스트 | 링크 토큰] 배열로 분해. 링크가 없으면 원문 하나짜리 배열. */
export function parseMdLinks(text: string): MdToken[] {
  const out: MdToken[] = [];
  let last = 0;
  for (const m of text.matchAll(LINK_RE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    out.push({ label: m[1], href: m[2] });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out.length ? out : [''];
}

/** 마크다운 링크를 라벨만 남긴 플레인 텍스트로 (JSON-LD·meta용). */
export function stripMdLinks(text: string): string {
  return text.replace(LINK_RE, '$1');
}
