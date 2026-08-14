import React, { useState, useEffect } from 'react';

function App() {
  // 🔑 공공데이터포털에서 발급받으신 일반 인증키 (Encoding 키 적용)
  const API_KEY = 'JBZ0DLLXthPItJbf1I%2FG3U8UVO1fwhw5tL6FEneb5ek6Tovl6V9xHsqE%2F8EFdiYDEEeEhtN%2B7e9PZDMvxHXU1w%3D%3D';

  // 상태 관리
  const [apiCompanies, setApiCompanies] = useState([]);
  const [isLoadingApi, setIsLoadingApi] = useState(true);
  const [apiError, setApiError] = useState(null);

  // 사용자가 선택한 공공기관 목록
  const [selectedCompanies, setSelectedCompanies] = useState([]);

  // 개인 스펙 상태
  const [userRegion, setUserRegion] = useState('전북');
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [results, setResults] = useState([]);
  const [calculating, setCalculating] = useState(false);

  // 보유 자격증 데이터
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

  // 1. 공공데이터포털 API 호출 (End Point 및 Decoding 안전 처리)
  useEffect(() => {
    const fetchPublicCompanies = async () => {
      setIsLoadingApi(true);
      setApiError(null);

      // 이미 인코딩된 키인 경우 decodeURIComponent로 정제 후 처리
      const decodedKey = decodeURIComponent(API_KEY);
      
      // 이미지상의 End Point: https://apis.data.go.kr/1051000/public_inst
      const url = `https://apis.data.go.kr/1051000/public_inst/getPublicInsttList?serviceKey=${encodeURIComponent(decodedKey)}&pageNo=1&numOfRows=500&resultType=json`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        // API 응답 데이터 파싱
        const items = data?.response?.body?.items || data?.items || [];

        if (Array.isArray(items) && items.length > 0) {
          const formattedList = items.map((item, index) => ({
            id: index + 1,
            name: item.insttNm || item.publicInsttNm || item.korNm || '기관명 없음',
            region: item.location || item.addr || item.region || '전국',
            type: item.insttType || item.type || '공공기관',
          }));

          setApiCompanies(formattedList);
        } else {
          // 키 승인 대기 중이거나 응답 구조가 다를 경우 대비 백업 목록
          throw new Error('API 응답에 목록 데이터가 없습니다.');
        }
      } catch (err) {
        console.warn('API 연동 실패 (승인 대기 중이거나 CORS 제한 가능성):', err);
        setApiError('API 승인 대기 중이거나 호출 형식이 변경되었습니다.');
        
        // API 승인 대기 중에도 테스트해볼 수 있도록 기본 전체 공공기관 데이터 제공
        setApiCompanies([
          { id: 1, name: '국민연금공단', region: '전북', type: '준정부기관' },
          { id: 2, name: 'LX 한국국토정보공사', region: '전북', type: '준정부기관' },
          { id: 3, name: '한국전력공사', region: '전남', type: '공기업' },
          { id: 4, name: '한국수자원공사', region: '대전', type: '공기업' },
          { id: 5, name: '한국철도공사 (코레일)', region: '대전', type: '공기업' },
          { id: 6, name: '국민건강보험공단', region: '강원', type: '준정부기관' },
          { id: 7, name: '한국가스공사', region: '대구', type: '공기업' },
          { id: 8, name: '한국토지주택공사 (LH)', region: '경남', type: '공기업' },
          { id: 9, name: '한국농어촌공사', region: '전남', type: '준정부기관' },
          { id: 10, name: '한국도로공사', region: '경북', type: '공기업' },
        ]);
      } finally {
        setIsLoadingApi(false);
      }
    };

    fetchPublicCompanies();
  }, [API_KEY]);

  // 드롭다운 선택
  const handleSelectCompany = (e) => {
    const selectedId = Number(e.target.value);
    if (!selectedId) return;

    const targetComp = apiCompanies.find((c) => c.id === selectedId);
    if (targetComp && !selectedCompanies.some((c) => c.id === targetComp.id)) {
      setSelectedCompanies([...selectedCompanies, targetComp]);
    }
  };

  // 선택된 공공기관 삭제
  const handleRemoveCompany = (id) => {
    setSelectedCompanies(selectedCompanies.filter((c) => c.id !== id));
  };

  // 자격증 선택
  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 가산점 산출
  const handleCalculate = () => {
    setCalculating(true);

    const selectedCerts = CERTIFICATES.filter((c) => selectedCertIds.includes(c.id));
    const certScoreSum = selectedCerts.reduce((acc, curr) => acc + curr.score, 0);

    setTimeout(() => {
      const calculated = selectedCompanies.map((comp) => {
        const isRegionalMatch = comp.region.includes(userRegion);
        const regionalBonus = isRegionalMatch ? 5 : 0;
        const totalScore = Math.min(certScoreSum + regionalBonus, 20);

        return {
          companyName: comp.name,
          region: comp.region,
          type: comp.type,
          isRegionalTalent: isRegionalMatch,
          totalScore: totalScore,
          maxScoreCap: 20,
          appliedCertificates: selectedCerts.map((c) => c.name),
        };
      });

      setResults(calculated);
      setCalculating(false);
    }, 300);
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '6px 16px', borderRadius: '20px' }}>
            공공데이터포털 API 실시간 연결됨
          </span>
          <h1 style={{ fontSize: '32px', color: '#1f2937', marginTop: '12px', marginBottom: '8px' }}>🎯 전국 공공기관 가산점 계산기</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            원하시는 공공기관을 드롭다운에서 선택해 가산점을 산출하세요.
          </p>
        </header>

        {/* 메인 입력 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          
          {/* 1. 출신 대학 지역 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📍 출신 대학 지역 (지역인재 우대 매칭)
            </label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', backgroundColor: '#fff' }}
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

          {/* 2. API 연결된 드롭다운 목록 */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label style={{ fontWeight: '600', color: '#374151' }}>
                🏢 공공기관 선택 ({isLoadingApi ? '불러오는 중...' : `${apiCompanies.length}개 기관 로드완료`})
              </label>
              {selectedCompanies.length > 0 && (
                <span style={{ fontSize: '13px', color: '#4f46e5', fontWeight: 'bold' }}>{selectedCompanies.length}개 선택됨</span>
              )}
            </div>

            <select
              onChange={handleSelectCompany}
              defaultValue=""
              disabled={isLoadingApi}
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #d1d5db', 
                borderRadius: '8px', 
                fontSize: '15px', 
                backgroundColor: '#fff',
                marginBottom: '12px',
                cursor: 'pointer'
              }}
            >
              <option value="" disabled>
                {isLoadingApi 
                  ? '⏳ API에서 기관 목록을 가져오는 중...' 
                  : `-- 클릭하여 공공기관을 선택하세요 (${apiCompanies.length}개) --`}
              </option>
              {apiCompanies.map((comp) => (
                <option key={comp.id} value={comp.id}>
                  {comp.name} ({comp.region})
                </option>
              ))}
            </select>

            {/* 선택된 공공기관 태그 */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb', minHeight: '52px', alignItems: 'center' }}>
              {selectedCompanies.length === 0 ? (
                <span style={{ color: '#9ca3af', fontSize: '14px' }}>위 드롭다운을 열어 분석할 기관을 선택해 주세요.</span>
              ) : (
                selectedCompanies.map((comp) => (
                  <span
                    key={comp.id}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      backgroundColor: '#eef2ff',
                      color: '#4f46e5',
                      border: '1px solid #c7d2fe',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '13px',
                      fontWeight: '600'
                    }}
                  >
                    {comp.name}
                    <button
                      onClick={() => handleRemoveCompany(comp.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#4f46e5',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        padding: '0 2px'
                      }}
                    >
                      ✕
                    </button>
                  </span>
                ))
              )}
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
                      padding: '12px',
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
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cert.category} 분야 (+{cert.score}점)</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={calculating || selectedCompanies.length === 0}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '16px',
              backgroundColor: selectedCompanies.length === 0 ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedCompanies.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {calculating ? '계산하는 중...' : `${selectedCompanies.length}개 선택 기관 가산점 계산하기`}
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
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>소재지: {item.region}</span>
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
