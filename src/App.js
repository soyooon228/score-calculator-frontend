import React, { useState, useEffect } from 'react';

function App() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [userRegion, setUserRegion] = useState('전북');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:8080/api/v1/scores';

  useEffect(() => {
    fetch(`${API_BASE_URL}/certificates`)
      .then((res) => res.json())
      .then((data) => setCertificates(data))
      .catch((err) => console.error('자격증 목록 로드 실패:', err));
  }, []);

  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

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
        console.error('계산 실패:', err);
        setLoading(false);
      });
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '40px 20px', fontFamily: "'Pretendard', sans-serif" }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        
        {/* 헤더 영역 */}
        <header style={{ textAlign: 'center', marginBottom: '30px' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#4f46e5', backgroundColor: '#eef2ff', padding: '6px 16px', borderRadius: '20px' }}>
            공공기관 & 기업 채용 맞춤
          </span>
          <h1 style={{ fontSize: '32px', color: '#1f2937', marginTop: '12px', marginBottom: '8px' }}>🎯 가산점 계산기</h1>
          <p style={{ color: '#6b7280', fontSize: '15px' }}>
            내가 가진 자격증과 지역 조건으로 최대로 받을 수 있는 가산점을 확인하세요.
          </p>
        </header>

        {/* 입력 카드 */}
        <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', marginBottom: '30px' }}>
          
          {/* 대학 지역 선택 */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📍 출신 대학 지역 선택 (지역인재 우대 확인용)
            </label>
            <select
              value={userRegion}
              onChange={(e) => setUserRegion(e.target.value)}
              style={{ width: '100%', padding: '12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '15px', color: '#1f2937' }}
            >
              <option value="전북">전북 (전라북도 소재 대학)</option>
              <option value="전남">전남/광주 (전남/광주 소재 대학)</option>
              <option value="서울">서울/수도권</option>
              <option value="기타">기타 지역</option>
            </select>
          </div>

          {/* 자격증 선택 */}
          <div>
            <label style={{ display: 'block', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              📜 보유 자격증 선택 (중복 체크 가능)
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px', marginTop: '10px' }}>
              {certificates.map((cert) => {
                const isSelected = selectedCertIds.includes(cert.id);
                return (
                  <div
                    key={cert.id}
                    onClick={() => handleCertChange(cert.id)}
                    style={{
                      border: isSelected ? '2px solid #4f46e5' : '1px solid #e5e7eb',
                      backgroundColor: isSelected ? '#f5f3ff' : 'white',
                      padding: '14px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
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
                      <div style={{ fontWeight: '600', color: '#1f2937', fontSize: '15px' }}>{cert.name}</div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{cert.category} 분야</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 계산 버튼 */}
          <button
            onClick={handleCalculate}
            disabled={loading}
            style={{
              marginTop: '28px',
              width: '100%',
              padding: '16px',
              backgroundColor: '#4f46e5',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
              transition: 'background-color 0.2s'
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
              {results.map((item, idx) => (
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
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#111827' }}>
                        {item.companyName}
                      </h3>
                      <span style={{ fontSize: '13px', color: '#6b7280' }}>
                        {item.jobGroup} 직무 | {item.stage} 전형
                      </span>
                    </div>

                    {item.isRegionalTalent && (
                      <span style={{ backgroundColor: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        🌱 지역인재 채용 대상
                      </span>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                    <span style={{ fontSize: '28px', fontWeight: '800', color: '#4f46e5' }}>+{item.totalScore}점</span>
                    <span style={{ fontSize: '14px', color: '#9ca3af' }}>/ 만점 {item.maxScoreCap}점</span>
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
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;
