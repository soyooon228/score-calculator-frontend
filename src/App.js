import React, { useState, useEffect } from 'react';

function App() {
  // 1. 공공데이터포털(ALIO) 기반 주요 공공기관 데이터셋
  const PUBLIC_COMPANIES_DATA = [
    { id: 1, name: '국민연금공단', region: '전북', category: '준정부기관' },
    { id: 2, name: 'LX 한국국토정보공사', region: '전북', category: '준정부기관' },
    { id: 3, name: '한국전력공사', region: '전남', category: '공기업' },
    { id: 4, name: '한국수자원공사', region: '대전', category: '공기업' },
    { id: 5, name: '한국철도공사 (코레일)', region: '대전', category: '공기업' },
    { id: 6, name: '국민건강보험공단', region: '강원', category: '준정부기관' },
    { id: 7, name: '한국가스공사', region: '대구', category: '공기업' },
    { id: 8, name: '한국도로공사', region: '경북', category: '공기업' },
    { id: 9, name: '한국토지주택공사 (LH)', region: '경남', category: '공기업' },
    { id: 10, name: '한국농어촌공사', region: '전남', category: '준정부기관' },
    { id: 11, name: '한국마사회', region: '경기', category: '공기업' },
    { id: 12, name: '한국조폐공사', region: '대전', category: '공기업' },
    { id: 13, name: '신용보증기금', region: '대구', category: '준정부기관' },
    { id: 14, name: '한국자산관리공사 (캠코)', region: '부산', category: '준정부기관' },
    { id: 15, name: '한국주택금융공사', region: '부산', category: '준정부기관' },
  ];

  // 2. 취업 준비생 최선호 자격증 10종
  const EXTENDED_CERTIFICATES = [
    { id: 1, name: 'SQLD', category: 'DATA', score: 3 },
    { id: 2, name: 'ADsP', category: 'DATA', score: 3 },
    { id: 3, name: 'ADP (데이터분석전문가)', category: 'DATA', score: 5 },
    { id: 4, name: '정보처리기사', category: 'IT', score: 5 },
    { id: 5, name: '컴퓨터활용능력 1급', category: 'IT', score: 3 },
    { id: 6, name: '컴퓨터활용능력 2급', category: 'IT', score: 1.5 },
    { id: 7, name: '한국사능력검정 1급', category: 'HISTORY', score: 5 },
    { id: 8, name: 'KBS한국어능력시험', category: 'LANG', score: 3 },
    { id: 9, name: 'TOEIC 850점 이상', category: 'LANG', score: 5 },
    { id: 10, name: 'TOEIC Speaking / AL 이상', category: 'LANG', score: 3 },
  ];

  // 상태 관리
  const [certificates, setCertificates] = useState(EXTENDED_CERTIFICATES);
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [userRegion, setUserRegion] = useState('전북');
  
  // 공공기관 검색 및 선택 상태
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompanyIds, setSelectedCompanyIds] = useState([1, 2, 3]); // 기본 3개 기관 선택
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 자격증 검색 및 필터 상태
  const [certSearchTerm, setCertSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  // 자격증 체크 토글
  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 공공기관 체크 토글
  const handleCompanyChange = (id) => {
    setSelectedCompanyIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 가산점 계산하기
  const handleCalculate = () => {
    setLoading(true);

    const selectedCerts = certificates.filter((c) => selectedCertIds.includes(c.id));
    const targetCompanies = PUBLIC_COMPANIES_DATA.filter((comp) => selectedCompanyIds.includes(comp.id));

    setTimeout(() => {
      const calculatedResults = targetCompanies.map((comp) => {
        const isRegionalMatch = comp.region === userRegion;
        const certScoreSum = selectedCerts.reduce((acc, curr) => acc + curr.score, 0);
        const regionalBonus = isRegionalMatch ? 5 : 0;
        const totalScore = Math.min(certScoreSum + regionalBonus, 20);

        return {
          companyName: comp.name,
          region: comp.region,
          jobGroup: '전산 / 행정 / 공통',
          stage: '서류전형',
          isRegionalTalent: isRegionalMatch,
          totalScore: totalScore,
          maxScoreCap: 20,
          appliedCertificates: selectedCerts.map((c) => c.name),
        };
      });

      setResults(calculatedResults);
      setLoading(false);
    }, 300);
  };

  // 자격증 필터링
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.name.toLowerCase().includes(certSearchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 공공기관 필터링
  const filteredCompanies = PUBLIC_COMPANIES_DATA.filter((comp) =>
    comp.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '6px 16px', borderRadius: '20px' }}>
            공공데이터(ALIO) 연동 v3.0
          </span>
          <h1 style={{ fontSize: '32px', color: '#1f2937', marginTop: '12px', marginBottom: '8px' }}>🎯 전국 공공기관 가산점 계산기</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            전국 주요 공공기관을 검색하고, 내 자격증과 지역인재 조건에 맞는 가산점을 분석해보세요.
          </p>
        </header>

        {/* 입력 섹션 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          
          {/* 1. 대학 지역 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📍 출신 대학 지역 (이전지역인재 판단용)
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

          {/* 2. 공공기관 검색 및 선택 (신규) */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              🏢 분석할 공공기관 검색 및 선택 ({selectedCompanyIds.length}개 선택됨)
            </label>
            <input
              type="text"
              placeholder="공공기관 이름 검색 (예: 국민연금, 한전, 가스공사...)"
              value={companySearch}
              onChange={(e) => setCompanySearch(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', marginBottom: '10px' }}
            />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '140px', overflowY: 'auto', padding: '8px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
              {filteredCompanies.map((comp) => {
                const isSelected = selectedCompanyIds.includes(comp.id);
                return (
                  <button
                    key={comp.id}
                    onClick={() => handleCompanyChange(comp.id)}
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
                    {comp.name} ({comp.region}) {isSelected && '✓'}
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
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="자격증 검색..."
                value={certSearchTerm}
                onChange={(e) => setCertSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', minWidth: '180px' }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="ALL">전체 분야</option>
                <option value="DATA">데이터</option>
                <option value="IT">정보기술</option>
                <option value="HISTORY">한국사</option>
                <option value="LANG">어학</option>
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '10px', maxHeight: '220px', overflowY: 'auto' }}>
              {filteredCertificates.map((cert) => {
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
                      <div style={{ fontSize: '11px', color: '#9ca3af' }}>{cert.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleCalculate}
            disabled={loading || selectedCompanyIds.length === 0}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '16px',
              backgroundColor: selectedCompanyIds.length === 0 ? '#9ca3af' : '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: selectedCompanyIds.length === 0 ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {loading ? '산출하는 중...' : `${selectedCompanyIds.length}개 선택 기관 가산점 산출해보기`}
          </button>
        </div>

        {/* 결과 카드 */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '16px' }}>📊 선택 기관별 산출 결과</h2>
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
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>본사: {item.region} | {item.jobGroup}</span>
                      </div>

                      {item.isRegionalTalent ? (
                        <span style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          🌱 이전지역인재 가점 적용 ({item.region})
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#f3f4f6', color: '#6b7280', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                          일반 채용 트랙
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
