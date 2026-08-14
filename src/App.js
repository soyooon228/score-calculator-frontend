import React, { useState, useEffect } from 'react';

function App() {
  // 기본 자격증 데이터 (백엔드 연결 실패 시 Fallback 데이터)
  const DEFAULT_CERTIFICATES = [
    { id: 1, name: 'SQLD', category: 'DATA' },
    { id: 2, name: 'ADsP', category: 'DATA' },
    { id: 3, name: '정보처리기사', category: 'IT' },
    { id: 4, name: '한국사능력검정 1급', category: 'HISTORY' },
  ];

  // 상태 관리
  const [certificates, setCertificates] = useState(DEFAULT_CERTIFICATES);
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [userRegion, setUserRegion] = useState('전북');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 검색어 및 카테고리 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const API_BASE_URL = 'http://localhost:8080/api/v1/scores';

  // 1. 백엔드에서 자격증 목록 불러오기 (실패 시 기본 목록 유지)
  useEffect(() => {
    fetch(`${API_BASE_URL}/certificates`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCertificates(data);
        }
      })
      .catch((err) => {
        console.warn('백엔드 미연결로 기본 자격증 목록을 사용합니다.');
      });
  }, []);

  // 자격증 체크박스 토글
  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 가산점 계산하기
  const handleCalculate = () => {
    setLoading(true);

    fetch(`${API_BASE_URL}/calculate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        certificateIds: selectedCertIds,
        userRegion: userRegion,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch((err) => {
        console.warn('백엔드 미연결로 클라이언트에서 임시 계산 결과를 산출합니다.');
        
        // 백엔드 미연결 시 보여줄 프론트엔드 자체 계산 샘플 결과
        const selectedCerts = certificates.filter((c) => selectedCertIds.includes(c.id));
        const certScore = selectedCerts.length * 3; // 개당 3점 임시 부여
        const isJeonbuk = userRegion === '전북';

        const mockResults = [
          {
            companyName: '국민연금공단',
            jobGroup: '전산/데이터',
            stage: '서류',
            isRegionalTalent: isJeonbuk,
            totalScore: Math.min(certScore + (isJeonbuk ? 3 : 0), 10),
            maxScoreCap: 10,
            appliedCertificates: selectedCerts.map((c) => c.name),
          },
          {
            companyName: 'LX 한국국토정보공사',
            jobGroup: '행정/IT',
            stage: '서류',
            isRegionalTalent: isJeonbuk,
            totalScore: Math.min(certScore + (isJeonbuk ? 5 : 0), 15),
            maxScoreCap: 15,
            appliedCertificates: selectedCerts.map((c) => c.name),
          },
        ];

        setResults(mockResults);
        setLoading(false);
      });
  };

  // 자격증 필터링 로직 (검색어 + 카테고리)
  const filteredCertificates = certificates.filter((cert) => {
    const matchesSearch = cert.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || cert.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ maxWidth: '850px', margin: '0 auto' }}>
        
        {/* 헤더 */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '6px 16px', borderRadius: '20px' }}>
            공공기관 & 기업 채용 맞춤 v2.0
          </span>
          <h1 style={{ fontSize: '32px', color: '#1f2937', marginTop: '12px', marginBottom: '8px' }}>🎯 가산점 계산기</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            내가 가진 자격증과 지역 조건으로 최대로 받을 수 있는 가산점을 확인하세요.
          </p>
        </header>

        {/* 입력 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          
          {/* 출신 대학 지역 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📍 출신 대학 지역 (지역인재 우대 확인용)
            </label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px' }}
            >
              <option value="전북">전북 (전라북도 소재 대학)</option>
              <option value="전남">전남/광주</option>
              <option value="서울">서울/수도권</option>
              <option value="기타">기타 지역</option>
            </select>
          </div>

          {/* 자격증 검색 및 카테고리 필터 */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📜 보유 자격증 선택 (중복 체크 가능)
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="자격증 이름 검색 (예: SQLD, 한국사...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ flex: 1, padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px', minWidth: '200px' }}
              />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{ padding: '10px 14px', border: '1px solid #d1d5db', borderRadius: '8px' }}
              >
                <option value="ALL">전체 분야</option>
                <option value="DATA">데이터 (DATA)</option>
                <option value="IT">정보기술 (IT)</option>
                <option value="HISTORY">한국사 (HISTORY)</option>
              </select>
            </div>

            {/* 자격증 체크박스 리스트 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {filteredCertificates.map((cert) => {
                const isSelected = selectedCertIds.includes(cert.id);
                return (
                  <div
                    key={cert.id}
                    onClick={() => handleCertChange(cert.id)}
                    style={{
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#f5f3ff' : 'white',
                      padding: '12px 14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '14px' }}>{cert.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af' }}>{cert.category} 분야</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 계산하기 버튼 */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            style={{
              marginTop: '20px',
              width: '100%',
              padding: '16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
            }}
          >
            {loading ? '계산하는 중...' : '내 가산점 산출해보기'}
          </button>
        </div>

        {/* 결과 카드 섹션 */}
        {results.length > 0 && (
          <div>
            <h2 style={{ fontSize: '20px', color: '#1f2937', marginBottom: '16px' }}>📊 기관별 산출 결과</h2>
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
                        <span style={{ fontSize: '13px', color: '#6b7280' }}>{item.jobGroup} 직무 | {item.stage} 전형</span>
                      </div>

                      {item.isRegionalTalent && (
                        <span style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                          🌱 지역인재 채용 대상
                        </span>
                      )}
                    </div>

                    {/* Progress Bar 달성률 */}
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
                      <strong>적용된 항목: </strong>
                      {item.appliedCertificates.length > 0 ? (
                        <span style={{ color: '#059669', fontWeight: '500' }}>{item.appliedCertificates.join(', ')}</span>
                      ) : (
                        <span style={{ color: '#9ca3af' }}>해당 없음</span>
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
