import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QUIZ_QUESTIONS } from '@/data/youthBenefits';
import { recommend, type QuizAnswers } from '@/lib/youthBenefitRec';
import { Quiz } from '@/components/quiz/Quiz';
import { Result } from './Result';
import { YOUTH_FAQ } from './seo';
import { Button } from '@/components/ui/button';

type Screen = 'home' | 'quiz' | 'result';

// 결과 컨테이너는 전마운트(SEO)라 답이 없을 때도 결정적 기본값으로 recommend() → SSR 동일 출력 보장.
const DEFAULT_ANSWERS: QuizAnswers = {
  age: 'y2024',
  military: 'no',
  household: '1',
  income: 'u150',
  myincome: 'o50',
  housing: 'soloRent',
  job: 'jobseeker',
};
const QKEYS = QUIZ_QUESTIONS.map((q) => q.id);

const CATEGORY_CHIPS = ['자산형성', '취업', '주거'];

export function YouthBenefits() {
  const [screen, setScreen] = useState<Screen>('home');
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const [qIndex, setQIndex] = useState(0);
  const [params] = useSearchParams();

  const toTop = () => window.scrollTo({ top: 0 });
  const goHome = () => {
    setScreen('home');
    toTop();
  };
  const startQuiz = () => {
    setAnswers({});
    setQIndex(0);
    setScreen('quiz');
    toTop();
  };
  const quizBack = () => {
    if (qIndex === 0) goHome();
    else setQIndex((i) => i - 1);
  };
  const pick = (value: string) => {
    const key = QUIZ_QUESTIONS[qIndex].id;
    setAnswers((a) => ({ ...a, [key]: value }) as Partial<QuizAnswers>);
    if (qIndex >= QUIZ_QUESTIONS.length - 1) {
      setScreen('result');
      toTop();
    } else {
      setQIndex((i) => i + 1);
    }
  };

  // 딥링크(?s=quiz)는 하이드레이션 후 효과에서만 1회 반영 — 초기 렌더는 항상 'home'이라 SSR 결정적.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 기반 초기 화면, 의도된 단일 갱신
    if (params.get('s') === 'quiz') setScreen('quiz');
  }, [params]);

  const complete = QKEYS.every((k) => answers[k] != null);
  const rec = useMemo(
    () => recommend(complete ? (answers as QuizAnswers) : DEFAULT_ANSWERS),
    [answers, complete],
  );

  return (
    <div className="min-h-screen bg-background text-ink">
      {/* 홈 — 히어로 + 카테고리 안내 + FAQ */}
      <div
        hidden={screen !== 'home'}
        className="mx-auto max-w-[1080px] px-[18px] pt-16 pb-[120px] duration-500 animate-in fade-in motion-reduce:animate-none"
      >
        <div className="flex flex-col items-center text-center">
          <h1 className="text-[clamp(34px,6vw,64px)] font-extrabold leading-[1.14] tracking-[-0.045em]">
            받을 수 있는 청년 지원금,
            <br />
            30초 만에.
          </h1>
          <p className="mt-[22px] text-[clamp(16px,2vw,20px)] font-medium leading-relaxed text-muted-foreground">
            내일저축계좌? 국민취업지원? 뭐가 나한테 맞는지 몰라도 괜찮아.
            <br />
            나이·소득·주거 몇 개만 답하면 받을 수 있는 지원금을 찾아줄게.
          </p>
          <Button
            variant="navy"
            size="pill"
            onClick={startQuiz}
            className="mt-10 px-[42px] py-[19px] text-[19px] font-extrabold shadow-lg hover:-translate-y-0.5"
          >
            내 지원금 찾기 →
          </Button>
          <div className="mt-14 flex flex-wrap justify-center gap-2.5">
            {CATEGORY_CHIPS.map((c) => (
              <span
                key={c}
                className="rounded-full border border-line bg-card px-4 py-2.5 text-[14px] font-semibold text-ink"
              >
                {c}
              </span>
            ))}
          </div>
          <p className="mt-6 text-[14px] font-medium text-muted-foreground">
            공식 제도 기준으로 진단해요. 종료된 제도는 따로 표시하고, 확실하지 않은 항목은 "확인 필요"로 알려줘요.
          </p>
        </div>

        {/* FAQ — FAQPage 구조화 데이터와 동일 Q&A(가시 노출) */}
        <div className="mx-auto mt-16 w-full max-w-[680px]">
          <h2 className="mb-4 text-[22px] font-extrabold tracking-[-0.02em] text-ink">자주 묻는 질문</h2>
          <div className="flex flex-col gap-2.5">
            {YOUTH_FAQ.map((f) => (
              <details key={f.q} className="group rounded-xl border border-line bg-card">
                <summary className="disc">{f.q}</summary>
                <p className="px-4 pb-4 pt-1 text-[14.5px] font-medium leading-relaxed text-muted-foreground">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </div>

      {/* 퀴즈 */}
      <div hidden={screen !== 'quiz'}>
        <Quiz
          question={QUIZ_QUESTIONS[qIndex]}
          qIndex={qIndex}
          total={QUIZ_QUESTIONS.length}
          onPick={pick}
          onBack={quizBack}
        />
      </div>

      {/* 결과 */}
      <div hidden={screen !== 'result'}>
        <Result rec={rec} onRestart={goHome} />
      </div>
    </div>
  );
}
