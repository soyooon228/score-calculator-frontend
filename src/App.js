import React, { useState, useEffect } from 'react';

function App() {
  // 🔑 공공데이터포털 일반 인증키 (Encoding)
  const API_KEY = 'JBZ0DLLXthPItJbf1I%2FG3U8UVO1fwhw5tL6FEneb5ek6Tovl6V9xHsqE%2F8EFdiYDEEeEhtN%2B7e9PZDMvxHXU1w%3D%3D';

  // 상태 관리
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRegion, setUserRegion] = useState('전북');

  // 내 보유 자격증 체크리스트
  const [myCertificates, setMyCertificates] = useState([
    { id: 'sqld', name: 'SQLD', regex: /(SQLD|SQL 개발자|SQLD자격증)/i, score: 3, checked: true },
    { id: 'adsp', name: 'ADsP', regex: /(ADsP|데이터분석준전문가|데이터 분석 준전문가)/i, score: 3, checked: true },
    { id: 'adp', name: 'ADP', regex: /(ADP|데이터분석전문가|데이터 분석 전문가)/i, score: 5, checked: false },
    { id: 'qip', name: '정보처리기사', regex: /(정보처리기사|정처기)/i, score: 5, checked: false },
    { id: 'com1', name: '컴퓨터활용능력 1급', regex: /(컴퓨터활용능력 1급|컴활 1급|컴활1급)/i, score: 3, checked: false },
    { id: 'history', name: '한국사 1급', regex: /(한국사 1급|한국사능력검정 1급|한능검 1급)/i, score: 5, checked: false },
  ]);

  // 자격증 선택 체크박스 변경
  const handleCertCheck = (id) => {
    setMyCertificates((prev) =>
      prev.map((cert) => (cert.id === id ? { ...cert, checked: !cert.checked } : cert))
    );
  };

  // 📡 ALIO 채용공고 API 호출 및 스마트 텍스트 파싱
  useEffect(() => {
    const fetchJobNotices = async () => {
      setLoading(true);
      const decodedKey = decodeURIComponent(API_KEY);

      // 공공기관 채용공고 API Endpoint
      const url = `https://apis.data.go.kr/1051000/recruitment/getRecruitmentList?serviceKey=${encodeURIComponent(decodedKey)}&numOfRows=15&pageNo=1&resultType=json`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        const items = data?.response?.body?.items || data?.items || [];

        if (Array.isArray(items) && items.length > 0) {
          setJobs(items);
        } else {
          throw new Error('API 데이터 없음');
        }
      } catch (err) {
        console.warn('API 연동 실패 또는 승인 대기 중 (샘플 채용공고 데이터 로드):', err);

        // API 연동 승인 대기 중에도 실시간 파싱 테스트를 위한 실제 스타일 샘플 공고 데이터
        setJobs([
          {
            pblancId: 'JOB001',
            insttNm: '국민연금공단',
            pblancNm: '2026년도 신입직원(행정/전산/데이터) 공개채용 공고',
            workRgnNm: '전북 전주시',
            qualfCn: '전산/데이터 직무: SQLD, ADsP 보유자 우대. 정보처리기사 가산점 5점 부여.',
            preferenceCn: '전북지역 대학 졸업자(이전지역인재) 가산점 5% 적용. 한국사능력검정 1급 우대.',
          },
          {
            pblancId: 'JOB002',
            insttNm: 'LX 한국국토정보공사',
            pblancNm: '2026년 상반기 공간정보 및 IT 정규직 채용',
            workRgnNm: '전북 전주시',
            qualfCn: 'IT 직무: 정보처리기사 필수. SQLD, ADsP 자격증 소지자 서류전형 가산점 부여.',
            preferenceCn: '이전지역인재(전북 소재 대학 졸업자) 우대.',
          },
          {
            pblancId: 'JOB003',
            insttNm: '한국전력공사',
            pblancNm: '2026년 대졸수준 신입사원 공채',
            workRgnNm: '전남 나주시',
            qualfCn: '정보통신 분야: 정보처리기사(+5점), 컴퓨터활용능력 1급(+3점) 인정.',
            preferenceCn: '광주/전남 지역인재 우대.',
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobNotices();
  }, [API_KEY]);

  // 🤖 공고문 파싱 및 가산점 계산 엔진
  const parseJobBonus = (job) => {
    // 공고문 전체 텍스트 병합 (제목 + 자격요건 + 우대사항)
    const fullContent = `${job.pblancNm || ''} ${job.qualfCn || ''} ${job.preferenceCn || ''}`;

    // 1. 선택된 자격증 중 공고문에 언급된 자격증 정규식 매칭
    const activeCerts = myCertificates.filter((c) => c.checked);
    const matchedCerts = activeCerts.filter((cert) => cert.regex.test(fullContent));
    const certScore = matchedCerts.reduce((sum, c) => sum + c.score, 0);

    // 2. 이전지역인재 여부 파싱 (지역명 및 이전지역 키워드 탐색)
    const regionRegex = new RegExp(`(${userRegion}|이전지역|지역인재)`, 'i');
    const isRegionalMatch = regionRegex.test(fullContent) || (job.workRgnNm && job.workRgnNm.includes(userRegion));
    const regionalScore = isRegionalMatch ? 5 : 0;

    return {
      matchedCertNames: matchedCerts.map((c) => c.name),
      certScore,
      isRegionalMatch,
      regionalScore,
      totalScore: Math.min(certScore + regionalScore, 20), // 최대 가점 상한
    };
  };

  return (
    <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '30px 15px', fontFamily: 'sans-serif' }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <span style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 'bold' }}>
            ALIO 채용공고 실시간 자동 파서
          </span>
          <h1 style={{ fontSize: '28px', color: '#111827', marginTop: '10px' }}>🤖 공공기관 채용공고 가산점 자동 분석</h1>
        </div>

        {/* 조건 설정 섹션 */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📍 출신 대학 지역</label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
            >
              <option value="전북">전북 (전라북도 소재 대학)</option>
              <option value="전남">전남 / 광주</option>
              <option value="대전">대전 / 충청</option>
              <option value="대구">대구 / 경북</option>
              <option value="서울">서울 / 수도권</option>
            </select>
          </div>

          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px' }}>📜 내가 보유한 자격증 선택</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {myCertificates.map((cert) => (
                <label
                  key={cert.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    border: cert.checked ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                    backgroundColor: cert.checked ? '#eff6ff' : '#f9fafb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={cert.checked}
                    onChange={() => handleCertCheck(cert.id)}
                  />
                  <span>{cert.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* 채용공고 및 파싱 결과 목록 */}
        <h2 style={{ fontSize: '18px', color: '#374151', marginBottom: '12px' }}>
          📋 실시간 채용공고 분석 목록 ({jobs.length}건)
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: 'white', borderRadius: '12px' }}>
            ⏳ ALIO 채용공고 및 우대조건 텍스트를 실시간 분석 중입니다...
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {jobs.map((job, idx) => {
              const analysis = parseJobBonus(job);

              return (
                <div key={job.pblancId || idx} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '5px solid #3b82f6' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                    <div>
                      <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{job.insttNm}</span>
                      <h3 style={{ margin: '4px 0', fontSize: '16px', color: '#111827' }}>{job.pblancNm}</h3>
                      <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>📍 근무지: {job.workRgnNm || '전국'}</p>
                    </div>

                    <div style={{ textAlign: 'right', minWidth: '90px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>+{analysis.totalScore}점</span>
                      <div style={{ fontSize: '11px', color: '#6b7280' }}>예상 가산점</div>
                    </div>
                  </div>

                  {/* 자동 분석 리포트 */}
                  <div style={{ marginTop: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>🔍 자동 감지된 자격증: </strong>
                      {analysis.matchedCertNames.length > 0 ? (
                        <span style={{ color: '#059669', fontWeight: 'bold' }}>
                          {analysis.matchedCertNames.join(', ')} (+{analysis.certScore}점)
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>공고문 텍스트 내 해당 자격증 언급 없음</span>
                      )}
                    </div>

                    <div>
                      <strong>🌱 지역인재 우대 적용: </strong>
                      {analysis.isRegionalMatch ? (
                        <span style={{ color: '#2563eb', fontWeight: 'bold' }}>
                          해당 조건 탐지됨 (+{analysis.regionalScore}점)
                        </span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>미해당</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
