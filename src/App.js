import React, { useState, useEffect } from 'react';

function App() {
  const [certificates, setCertificates] = useState([]);
  const [selectedCertIds, setSelectedCertIds] = useState([]);
  const [userRegion, setUserRegion] = useState('전북');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  // 백엔드 API 기본 URL (로컬 실행 기준)
  const API_BASE_URL = 'http://localhost:8080/api/v1/scores';

  // 1. 자격증 전체 목록 불러오기
  useEffect(() => {
    fetch(`${API_BASE_URL}/certificates`)
      .then((res) => res.json())
      .then((data) => setCertificates(data))
      .catch((err) => console.error('자격증 목록 로드 실패:', err));
  }, []);

  // 자격증 체크박스 선택/해제 핸들러
  const handleCertChange = (id) => {
    setSelectedCertIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // 2. 가산점 계산 요청
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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>🎯 맞춤 가산점 계산기</h1>
      <p>보유 중인 자격증과 출신 대학 지역을 선택해 지원 가능한 기관의 가산점을 확인해보세요.</p>

      <hr />

      {/* 내 스펙 입력 섹션 */}
      <section style={{ marginBottom: '30px' }}>
        <h2>1. 내 스펙 선택</h2>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ fontWeight: 'bold' }}>출신 대학 지역: </label>
          <select value={userRegion} onChange={(e) => setUserRegion(e.target.value)} style={{ padding: '5px', marginLeft: '10px' }}>
            <option value="전북">전북</option>
            <option value="전남">전남</option>
            <option value="서울">서울</option>
            <option value="경기">경기</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 'bold' }}>보유 자격증 선택:</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '10px' }}>
            {certificates.map((cert) => (
              <label key={cert.id} style={{ border: '1px solid #ccc', padding: '10px', borderRadius: '5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  value={cert.id}
                  checked={selectedCertIds.includes(cert.id)}
                  onChange={() => handleCertChange(cert.id)}
                />{' '}
                {cert.name} <small style={{ color: '#666' }}>({cert.category})</small>
              </label>
            ))}
          </div>
        </div>

        <button
          onClick={handleCalculate}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            fontSize: '16px',
            cursor: 'pointer',
          }}
        >
          {loading ? '계산 중...' : '가산점 산출하기'}
        </button>
      </section>

      {/* 결과 출력 섹션 */}
      {results.length > 0 && (
        <section>
          <h2>2. 기관별 가산점 산출 결과</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {results.map((item, idx) => (
              <div key={idx} style={{ border: '2px solid #28a745', padding: '15px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0 }}>
                    {item.companyName} ({item.jobGroup} - {item.stage})
                  </h3>
                  {item.isRegionalTalent && (
                    <span style={{ backgroundColor: '#17a2b8', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '12px' }}>
                      지역인재 대상 기관
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff', margin: '10px 0' }}>
                  인정 가산점: {item.totalScore}점 / {item.maxScoreCap}점 만점
                </p>

                <p style={{ margin: 0, fontSize: '14px', color: '#555' }}>
                  <b>적용된 자격증:</b> {item.appliedCertificates.length > 0 ? item.appliedCertificates.join(', ') : '없음'}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default App;
