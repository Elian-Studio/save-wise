import { DATA_AS_OF, SOURCES } from '../data/products';

export function Sources() {
  return (
    <>
      <h2 className="sec">참고 출처</h2>
      <div className="card src">
        <p style={{ marginTop: 0 }}>
          모든 수치는 <b>{DATA_AS_OF} 기준</b>입니다. 가입 전 은행·서민금융진흥원·은행연합회 포털에서 최신값을
          재확인하세요.
        </p>
        <ul>
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener">
                {s.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
