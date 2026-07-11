import { CONTACT_EMAIL } from '../../config/ads';

// 문의(/contact). 문의 이메일과 접수 범위·회신 안내를 간결히 노출.
export function Contact() {
  return (
    <article className="mx-auto max-w-[720px] px-[18px] py-10 leading-[1.75] text-foreground">
      <h1 className="text-2xl font-extrabold tracking-tight text-ink">문의하기</h1>

      <p className="mt-5">
        아래 이메일로 문의를 보내주세요. 서비스 개선에 큰 도움이 됩니다.
      </p>

      <p className="mt-4 text-lg font-bold text-ink">
        <a className="underline hover:text-foreground" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
      </p>

      <h2 className="mt-9 text-lg font-bold text-ink">이런 문의를 받습니다</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5">
        <li>데이터 오류 제보 — 계산 결과나 표기된 수치가 실제와 다른 경우</li>
        <li>제도 변경 제보 — 정부·금융사·카드사의 조건이 개편된 경우</li>
        <li>제휴 및 기타 문의</li>
      </ul>

      <h2 className="mt-9 text-lg font-bold text-ink">회신 안내</h2>
      <p className="mt-3">
        영업일 기준으로 확인 후 회신하도록 노력하고 있습니다. 개인정보 처리에 관한 내용은{' '}
        <a className="underline hover:text-foreground" href="/privacy">
          개인정보처리방침
        </a>
        을 참고해 주세요.
      </p>
    </article>
  );
}
