import React, { useState, useEffect } from 'react';

function App() {
  // 상태 관리
  const [userRegion, setUserRegion] = useState('전북');
  const [selectedCompany, setSelectedCompany] = useState(''); // 선택된 공공기관
  const [loading, setLoading] = useState(false);
  const [jobs, setJobs] = useState([]);

  // 공공기관 드롭다운 데이터셋
  const COMPANY_LIST = [
    { id: 'all', name: '🏢 전체 공공기관 채용공고 보기' },
    { id: 'nps', name: '국민연금공단' },
    { id: 'lx', name: 'LX 한국국토정보공사' },
    { id: 'kepco', name: '한국전력공사' },
    { id: 'kwater', name: '한국수자원공사' },
    { id: 'korail', name: '한국철도공사 (코레일)' },
    { id: 'nhis', name: '국민건강보험공단' },
    { id: 'kogas', name: '한국가스공사' },
    { id: 'lh', name: '한국토지주택공사 (LH)' },
  ];

  // 보유 자격증 목록
  const [certificates, setCertificates] = useState([
    { id: 'sqld', name: 'SQLD', score: 3, checked: true },
    { id: 'adsp', name: 'ADsP', score: 3, checked: true },
    { id: 'adp', name: 'ADP', score: 5, checked: false },
    { id: 'qip', name: '정보처리기사', score: 5, checked: false },
    { id: 'com1', name: '컴퓨터활용능력 1급', score: 3, checked: false },
    { id: 'history', name: '한국사 1급', score: 5, checked: false },
  ]);

  // 자격증 체크박스 토글
  const handleCertCheck = (id) => {
    setCertificates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, checked: !c.checked } : c))
    );
  };

  // 📡 Spring Boot 백엔드(/api/analyze-jobs) 연동 및 기관 필터링
  const fetchAnalyzedJobs = async () => {
    setLoading(true);
    const activeCertificates = certificates.filter((c) => c.checked).map((c) => c.name);

    try {
      // Spring Boot 서버 요청
      const response = await fetch('http://localhost:8080/api/analyze-jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userRegion: userRegion,
          userCertificates: activeCertificates,
        }),
      });

      if (!response.ok) {
        throw new Error('서버 응답 에러');
      }

      const data = await response.json();
      
      // 공공기관 필터링 적용
      let filteredData = data;
      if (selectedCompany && selectedCompany !== '🏢 전체 공공기관 채용공고 보기') {
        filteredData = data.filter((item) => item.companyName === selectedCompany);
      }

      setJobs(filteredData);
    } catch (err) {
      console.warn('백엔드 연동 대기 중 - 클라이언트 측 백업 파싱 진행:', err);
      
      // Spring Boot 서버 실행 전 화면 테스트용 백업 로직
      const mockJobs = [
        {
          id: 'JOB_NPS_01',
          companyName: '국민연금공단',
          title: '2026년도 신입직원(행정/전산/데이터) 공개채용 공고',
          location: '전북 전주시',
          matchedCerts: activeCertificates.filter((c) => ['SQLD', 'ADsP', '정보처리기사'].includes(c)),
          certScore: activeCertificates.filter((c) => ['SQLD', 'ADsP', '정보처리기사'].includes(c)).length * 3,
          isRegionalMatch: userRegion === '전북',
          regionalScore: userRegion === '전북' ? 5 : 0,
          totalScore: Math.min(activeCertificates.filter((c) => ['SQLD', 'ADsP', '정보처리기사'].includes(c)).length * 3 + (userRegion === '전북' ? 5 : 0), 20),
        },
        {
          id: 'JOB_LX_01',
          companyName: 'LX 한국국토정보공사',
          title: '2026년 상반기 공간정보 및 IT 정규직 채용',
          location: '전북 전주시',
          matchedCerts: activeCertificates.filter((c) => ['SQLD', 'ADsP', '컴퓨터활용능력 1급'].includes(c)),
          certScore: activeCertificates.filter((c) => ['SQLD', 'ADsP', '컴퓨터활용능력 1급'].includes(c)).length * 3,
          isRegionalMatch: userRegion === '전북',
          regionalScore: userRegion === '전북' ? 5 : 0,
          totalScore: Math.min(activeCertificates.filter((c) => ['SQLD', 'ADsP', '컴퓨터활용능력 1급'].includes(c)).length * 3 + (userRegion === '전북' ? 5 : 0), 20),
        },
        {
          id: 'JOB_KEPCO_01',
          companyName: '한국전력공사',
          title: '2026년 대졸수준 신입사원 공채',
          location: '전남 나주시',
          matchedCerts: activeCertificates.filter((c) => ['정보처리기사', '컴퓨터활용능력 1급'].includes(c)),
          certScore: activeCertificates.filter((c) => ['정보처리기사', '컴퓨터활용능력 1급'].includes(c)).length * 3,
          isRegionalMatch: userRegion === '전남',
          regionalScore: userRegion === '전남' ? 5 : 0,
          totalScore: Math.min(activeCertificates.filter((c) => ['정보처리기사', '컴퓨터활용능력 1급'].includes(c)).length * 3 + (userRegion === '전남' ? 5 : 0), 20),
        },
      ];

      let filteredMock = mockJobs;
      if (selectedCompany && selectedCompany !== '🏢 전체 공공기관 채용공고 보기') {
        filteredMock = mockJobs.filter((item) => item.companyName === selectedCompany);
      }

      setJobs(filteredMock);
    } finally {
      setLoading(false);
    }
  };

  // 조건 변경 시 자동 분석 호출
  useEffect(() => {
    fetchAnalyzedJobs();
  }, [userRegion, selectedCompany, certificates]);

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
          
          {/* 1. 공공기관 선택 드롭다운 (복원 완료!) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#374151' }}>
              🏢 공공기관 선택
            </label>
            <select
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
            >
              {COMPANY_LIST.map((comp) => (
                <option key={comp.id} value={comp.name}>
                  {comp.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. 출신 대학 지역 선택 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#374151' }}>
              📍 출신 대학 지역
            </label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#fff' }}
            >
              <option value="전북">전북 (전라북도 소재 대학)</option>
              <option value="전남">전남 / 광주</option>
              <option value="대전">대전 / 충청</option>
              <option value="대구">대구 / 경북</option>
              <option value="서울">서울 / 수도권</option>
            </select>
          </div>

          {/* 3. 보유 자격증 선택 */}
          <div>
            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '6px', color: '#374151' }}>
              📜 내가 보유한 자격증 선택
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '8px' }}>
              {certificates.map((cert) => (
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
            ⏳ ALIO 채용공고 및 우대조건을 자동 분석하는 중입니다...
          </div>
        ) : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', backgroundColor: 'white', borderRadius: '12px', color: '#6b7280' }}>
            선택하신 공공기관의 진행 중인 채용공고가 없습니다.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {jobs.map((job) => (
              <div key={job.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '5px solid #3b82f6' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold' }}>{job.companyName}</span>
                    <h3 style={{ margin: '4px 0', fontSize: '16px', color: '#111827' }}>{job.title}</h3>
                    <p style={{ margin: 0, fontSize: '13px', color: '#9ca3af' }}>📍 근무지: {job.location || '전국'}</p>
                  </div>

                  <div style={{ textAlign: 'right', minWidth: '90px' }}>
                    <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#2563eb' }}>+{job.totalScore}점</span>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>예상 가산점</div>
                  </div>
                </div>

                {/* 자동 분석 리포트 */}
                <div style={{ marginTop: '12px', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ marginBottom: '4px' }}>
                    <strong>🔍 감지된 자격증: </strong>
                    {job.matchedCerts && job.matchedCerts.length > 0 ? (
                      <span style={{ color: '#059669', fontWeight: 'bold' }}>
                        {job.matchedCerts.join(', ')} (+{job.certScore}점)
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>공고문 텍스트 내 해당 자격증 언급 없음</span>
                    )}
                  </div>

                  <div>
                    <strong>🌱 지역인재 우대 적용: </strong>
                    {job.isRegionalMatch ? (
                      <span style={{ color: '#2563eb', fontWeight: 'bold' }}>
                        {userRegion} 지역인재 우대 해당 (+{job.regionalScore}점)
                      </span>
                    ) : (
                      <span style={{ color: '#9ca3af' }}>미해당</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
