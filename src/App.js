import React, { useState, useEffect } from 'react';

function App() {
  // 🔑 공공데이터포털에서 발급받은 일반 인증키(Encoding 또는 Decoding) 입력
  const PUBLIC_DATA_API_KEY = 'JBZ0DLLXtHpItJbF1I%2FG3U8UVO1fwhw5tL6FEneb5ek6Tovl6V9xHsqE%2F8EFdiYDEEeEhtN%2B7e9PZDMvxHXU1w%3D%3D';

  // 상태 관리
  const [publicCompanies, setPublicCompanies] = useState([]);
  const [selectedCompanyNames, setSelectedCompanyNames] = useState([]);
  const [companySearch, setCompanySearch] = useState('');
  
  // 자격증 및 개인 스펙 상태
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [userRegion, setUserRegion] = useState('전북');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiLoading, setApiLoading] = useState(true);

  // 기본 자격증 목록
  const CERTIFICATES = [
    { id: 1, name: 'SQLD', category: 'DATA', score: 3 },
    { id: 2, name: 'ADsP', category: 'DATA', score: 3 },
    { id: 3, name: 'ADP (데이터분석전문가)', category: 'DATA', score: 5 },
    { id: 4, name: '정보처리기사', category: 'IT', score: 5 },
    { id: 5, name: '컴퓨터활용능력 1급', category: 'IT', score: 3 },
    { id: 6, name: '컴퓨터활용능력 2급', category: 'IT', score: 1.5 },
    { id: 7, name: '한국사능력검정 1급', category: 'HISTORY', score: 5 },
    { id: 8, name: 'KBS한국어능력시험', category: 'LANG', score: 3 },
    { id: 9, name: 'TOEIC 850점 이상', category: 'LANG', score: 5 },
  ];

  // 1. 공공데이터포털 Open API 호출하여 전체 공공기관 데이터 로드
  useEffect(() => {
    const fetchAllPublicInstitutions = async () => {
      setApiLoading(true);
      
      // 기획재정부 공공기관 지정 현황 API 호출 URL
      const url = `https://apis.data.go.kr/1051000/ALIO_OpenAPI/getPublicInsttList?serviceKey=${PUBLIC_DATA_API_KEY}&pageNo=1&numOfRows=500&resultType=json`;

      try {
        const response = await fetch(url);
        const data = await response.json();
        
        // API 응답 데이터 파싱
        if (data.response && data.response.body && data.response.body.items) {
          const items = data.response.body.items;
          // 기관명 및 주소 추출
          const list = items.map((item, index) => ({
            id: index + 1,
            name: item.insttNm || item.publicInsttNm, // 기관명
            type: item.insttType || '공공기관',      // 기관유형
            region: item.location || '전국',         // 주소/소재지
          }));
          
          setPublicCompanies(list);
          // 기본 선택값으로 3개 지정
          if (list.length > 0) {
            setSelectedCompanyNames([list[0].name, list[1]?.name].filter(Boolean));
          }
        }
      } catch (error) {
        console.warn('API 키 미입력 또는 연동 대기 중입니다. 기본 공공기관 데이터를 표시합니다.', error);
        // API 연동 전/실패 시 보여줄 확장 기본 데이터
        setPublicCompanies([
          { id: 1, name: '국민연금공단', region: '전북' },
          { id: 2, name: 'LX 한국국토정보공사', region: '전북' },
          { id: 3, name: '한국전력공사', region: '전남' },
          { id: 4, name: '한국수자원공사', region: '대전' },
          { id: 5, name: '한국철도공사 (코레일)', region: '대전' },
          { id: 6, name: '국민건강보험공단', region: '강원' },
          { id: 7, name: '한국가스공사', region: '대구' },
          { id: 8, name: '한국토지주택공사 (LH)', region: '경남' },
        ]);
        setSelectedCompanyNames(['국민연금공단', 'LX 한국국토정보공사']);
      } finally {
        setApiLoading(false);
      }
    };

    fetchAllPublicInstitutions();
  }, [PUBLIC_DATA_API_KEY]);

  // 자격증 토글
  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 공공기관 선택/해제 토글
  const handleCompanyToggle = (name) => {
    setSelectedCompanyNames((prev) =>
      prev.includes(name) ? prev.filter((item) => item !== name) : [...prev, name]
    );
  };

  // 가산점 산출
  const handleCalculate = () => {
    setLoading(true);

    const selectedCerts = CERTIFICATES.filter((c) => selectedCertIds.includes(c.id));
    const certScoreSum = selectedCerts.reduce((acc, curr) => acc + curr.score, 0);

    setTimeout(() => {
      const calculated = selectedCompanyNames.map((compName) => {
        const compInfo = publicCompanies.find((c) => c.name === compName);
        const compRegion = compInfo ? compInfo.region : '';
        const isRegionalMatch = compRegion.includes(userRegion);
        const regionalBonus = isRegionalMatch ? 5 : 0;
        const totalScore = Math.min(certScoreSum + regionalBonus, 20);

        return {
          companyName: compName,
          region: compRegion || '전국',
          isRegionalTalent: isRegionalMatch,
          totalScore: totalScore,
          maxScoreCap: 20,
          appliedCertificates: selectedCerts.map((c) => c.name),
        };
      });

      setResults(calculated);
      setLoading(false);
    }, 300);
  };

  // 검색어 필터링된 공공기관 전체 리스트
  const filteredCompanies = publicCompanies.filter((comp) =>
    comp.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '6px 16px', borderRadius: '20px' }}>
            공공데이터포털 ALIO 전체 연동 v3.5
          </span>
          <h1 style={{ fontSize: '32px', color: '#1f2937', marginTop: '12px', marginBottom: '8px' }}>🎯 전국 공공기관 가산점 계산기</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            대한민국 300+개 전체 공공기관을 실시간으로 조회하고 내 가산점을 계산해보세요.
          </p>
        </header>

        {/* 메인 입력 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          
          {/* 1. 대학 지역 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📍 출신 대학 지역 (지역인재 우대 매칭)
            </label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px' }}
            >
              <option value="전북">전북 (전라북도 소재 대학)</option>
              <option value="전남">전남 / 광주</option>
              <option value="대전">대전 / 충청</option>
              <option value="대구">대구 / 경북</option>
              <option value="부산">부산 / 경남</option>
              <option value="강원">강원</option>
              <option value="서울">서울 / 수도권</option>
            </select>
          </div>

          {/* 2. 전체 공공기관 실시간 검색 & 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                🏢 전체 공공기관 목록 ({publicCompanies.length}개 로드됨 / {selectedCompanyNames.length}개 선택)
              </label>
              {apiLoading && <span style={{ fontSize: '12px', color: '#4f46e5' }}>API 데이터 불러오는 중...</span>}
            </div>

            <input
              type="text"
              placeholder="찾고 싶은 공공기관 이름을 입력하세요 (예: 국민연금, 한국전력, 가스공사...)"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '10px', fontSize: '14px' }}
            />

            {/* 전체 기관 스크롤 리스트 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '180px', overflowY: 'auto', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              {filteredCompanies.map((comp) => {
                const isSelected = selectedCompanyNames.includes(comp.name);
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleCompanyToggle(comp.name)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '20px',
                      border: isSelected ? '1px solid #4f46e5' : '1px solid #d1d5db',
                      backgroundColor: isSelected ? '#4f46e5' : 'white',
                      color: isSelected ? 'white' : '#374151',
                      fontSize: '13px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {comp.name} {isSelected && '✓'}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. 자격증 선택 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📜 보유 자격증 선택
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px' }}>
              {CERTIFICATES.map((cert) => {
                const isSelected = selectedCertIds.includes(cert.id);
                return (
                  <div
                    key={cert.id}
                    onClick={() => handleCertChange(cert.id)}
                    style={{
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#f5f3ff' : 'white',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '16px', height: '16px', accentColor: '#4f46e5' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '13px' }}>{cert.name}</div>
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cert.category} 분야</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading || selectedCompanyNames.length === 0}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '16px',
              backgroundColor: selectedCompanyNames.length === 0 ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedCompanyNames.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {loading ? '산출하는 중...' : `${selectedCompanyNames.length}개 선택 기관 가산점 산출해보기`}
          </button>
        </div>

        {/* 결과 카드 */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '16px' }}>📊 선택 기관별 가산점 분석 결과</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {results.map((item, idx) => {
                const percentage = Math.min(100, Math.round((item.totalScore / item.maxScoreCap) * 100));

                return (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '12px',
                      padding: '20px',
                      borderLeft: '6px solid #4f46e5',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>{item.companyName}</h3>
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>소재지/지역: {item.region}</span>
                      </div>

                      {item.isRegionalTalent ? (
                        <span style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          🌱 이전지역인재 가점 적용 ({userRegion})
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                          일반 전형
                        </span>
                      )}
                    </div>

                    <div style={{ marginTop: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 'bold', color: '#4f46e5' }}>+{item.totalScore}점 / {item.maxScoreCap}점 만점</span>
                        <span style={{ fontWeight: '600', color: '#6b7280' }}>달성률 {percentage}%</span>
                      </div>
                      <div style={{ width: '100%', height: '10px', backgroundColor: '#e5e7eb', borderRadius: '5px', overflow: 'hidden' }}>
                        <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: percentage === 100 ? '#10b981' : '#4f46e5', transition: 'width 0.4s ease' }}></div>
                      </div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #f3f4f6', fontSize: '13px', color: '#4b5563' }}>
                      <strong>인정 자격증: </strong>
                      {item.appliedCertificates.length > 0 ? (
                        <span style={{ color: '#059669', fontWeight: '500' }}>{item.appliedCertificates.join(', ')}</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>선택 자격증 없음</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
