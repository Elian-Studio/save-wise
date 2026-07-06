import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { SCHEMES, QUIZ_QUESTIONS } from '../../data/transitSchemes';
import { recommend, type QuizAnswers } from '../../lib/transitSchemeRec';
import { Quiz } from './Quiz';
import { Result } from './Result';
import { Compare } from './Compare';

type Screen = 'home' | 'quiz' | 'result' | 'compare';

// 결과 컨테이너는 전마운트(SEO)라 답이 없을 때도 결정적 기본값으로 recommend() → SSR 동일 출력 보장.
const DEFAULT_ANSWERS: QuizAnswers = { region: 'seoul', age: 'y', trips: 'mid', mode: 'metro', bike: 'no' };
const QKEYS = QUIZ_QUESTIONS.map((q) => q.id);

export function Transit() {
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
  const goCompare = () => {
    setScreen('compare');
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

  // 딥링크(?s=quiz|compare)를 하이드레이션 후 효과에서만 1회 반영 — 초기 렌더는 항상 'home'이라 SSR 결정적.
  useEffect(() => {
    const s = params.get('s');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL 기반 초기 화면, 의도된 단일 갱신
    if (s === 'quiz' || s === 'compare') setScreen(s);
  }, [params]);

  const complete = QKEYS.every((k) => answers[k] != null);
  const rec = useMemo(
    () => recommend(complete ? (answers as QuizAnswers) : DEFAULT_ANSWERS),
    [answers, complete],
  );

  return (
    <div className="min-h-screen bg-pp-bg text-pp-ink">
      {/* 서브헤더 — Shell 내비와 별개인 패스픽 로컬 헤더(비-sticky) */}
      <div className="flex items-center justify-between px-5 py-4 sm:px-8">
        <button type="button" onClick={goHome} className="flex items-center gap-2.5" aria-label="패스픽 홈">
          <span className="flex items-center" aria-hidden="true">
            <span className="h-4 w-4 rounded-full" style={{ background: '#00A167' }} />
            <span className="-ml-1.5 h-4 w-4 rounded-full" style={{ background: '#3B5BDB' }} />
            <span className="-ml-1.5 h-4 w-4 rounded-full" style={{ background: '#E8590C' }} />
          </span>
          <span className="text-[19px] font-extrabold tracking-[-0.03em]">패스픽</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={goCompare}
            className="min-h-11 rounded-full border border-pp-line2 px-4 text-[14px] font-semibold text-pp-ink hover:bg-pp-card"
          >
            카드 비교
          </button>
          <button
            type="button"
            onClick={startQuiz}
            className="min-h-11 rounded-full bg-navy px-[18px] text-[14px] font-bold text-white hover:bg-navy2"
          >
            내 카드 찾기
          </button>
        </div>
      </div>

      {/* 홈 — 히어로형. 지하철 라인 데코 + 히어로 카피 + CTA + 제도 칩 */}
      <div
        hidden={screen !== 'home'}
        className="flex flex-col items-center px-6 pt-16 pb-[120px] text-center duration-500 animate-in fade-in motion-reduce:animate-none"
      >
        <div className="mb-9 flex items-center" aria-hidden="true">
          <span className="h-[3px] w-16 bg-pp-deco" />
          <span className="h-3.5 w-3.5 rounded-full ring-[3px] ring-[#00A167]" style={{ background: '#00A167' }} />
          <span className="h-[3px] w-16 bg-pp-deco" />
          <span className="h-3.5 w-3.5 rounded-full ring-[3px] ring-[#3B5BDB]" style={{ background: '#3B5BDB' }} />
          <span className="h-[3px] w-16 bg-pp-deco" />
          <span className="h-3.5 w-3.5 rounded-full ring-[3px] ring-[#E8590C]" style={{ background: '#E8590C' }} />
          <span className="h-[3px] w-16 bg-pp-deco" />
        </div>
        <h1 className="text-[clamp(38px,6.5vw,74px)] font-extrabold leading-[1.12] tracking-[-0.045em]">
          매달 나가는 교통비,
          <br />
          아깝지 않게.
        </h1>
        <p className="mt-[22px] text-[clamp(16px,2vw,20px)] font-medium leading-relaxed text-pp-muted">
          기후동행카드? K-패스? 뭐가 뭔지 몰라도 괜찮아.
          <br />
          질문 5개만 답하면 너한테 딱 맞는 카드 찾아줄게.
        </p>
        <button
          type="button"
          onClick={startQuiz}
          className="mt-10 min-h-11 rounded-full bg-navy px-[42px] py-[19px] text-[19px] font-extrabold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-navy2"
        >
          30초 만에 내 카드 찾기 →
        </button>
        <div className="mt-14 flex flex-wrap justify-center gap-2.5">
          {SCHEMES.map((s) => (
            <Link
              key={s.id}
              to={`/transit/cards/${s.id}`}
              className="flex items-center gap-2 rounded-full border border-pp-line bg-pp-card px-4 py-2.5 text-[14px] font-semibold text-pp-ink transition hover:-translate-y-px hover:border-navy"
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
              {s.name}
            </Link>
          ))}
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
        <Result rec={rec} onCompare={goCompare} onRestart={startQuiz} />
      </div>

      {/* 비교 */}
      <div hidden={screen !== 'compare'}>
        <Compare onQuiz={startQuiz} />
      </div>
    </div>
  );
}
