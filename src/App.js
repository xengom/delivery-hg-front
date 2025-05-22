import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [deliveries, setDeliveries] = useState([]);
  const [activeTab, setActiveTab] = useState('run');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const filteredDeliveries = activeTab === 'run'
    ? deliveries.filter(d => d.status !== 'SETTLED')
    : deliveries.filter(d => d.status === 'SETTLED');

  const formatSettlement = (settlement) => {
    const map = {
      'PREPAID': '선불',
      'COLLECT': '착불',
      'OFFICE': '사무실',
      'RECEIPT_REQUIRED': '수증'
    };
    return map[settlement] || settlement;
  };

  const handleStatusChange = async (id, currentStatus) => {
    let newStatus;
    if (currentStatus === 'PICKED_UP') {
      newStatus = 'DELIVERED';
    } else if (currentStatus === 'DELIVERED') {
      newStatus = 'SETTLED';
    } else {
      return; // Already settled
    }
    
    try {
      await fetch(`/api/deliveries/${id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchDeliveries();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('상태 변경 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="App">
      <header>
        <span id="title">오늘 배달</span>
        <button>☰</button>
      </header>
      
      <nav className="tabs">
        <button 
          className={activeTab === 'run' ? 'active' : ''} 
          onClick={() => setActiveTab('run')}
        >
          진행
        </button>
        <button 
          className={activeTab === 'done' ? 'active' : ''} 
          onClick={() => setActiveTab('done')}
        >
          완료
        </button>
      </nav>
      
      <main id="list">
        {filteredDeliveries.map(d => (
          <article key={d.id} className="card" data-id={d.id} data-st={d.status}>
            <div>
              <h3>{d.recipient?.address?.full || '직접 입력'}</h3>
              <p>{d.boxCount}박스 · ₩{d.fee || 0} · {formatSettlement(d.settlement)}</p>
            </div>
            <div className="act">
              <a href={`sms:${d.recipient?.phone || ''}`} aria-label="SMS 보내기">✉</a>
              <a 
                href={`nmap://search?query=${encodeURIComponent(d.recipient?.address?.full || '')}`} 
                aria-label="지도 보기"
              >
                🗺
              </a>
              <button onClick={() => handleStatusChange(d.id, d.status)}>
                {d.status === 'PICKED_UP' ? '배송' : d.status === 'DELIVERED' ? '정산' : '완료'}
              </button>
            </div>
          </article>
        ))}
      </main>
      
      <button id="fab" onClick={() => setIsModalOpen(true)}>＋</button>
      
      <nav className="bottom">
        <a className="on">배달</a>
        <a>주소록</a>
        <a>통계</a>
      </nav>
      
      {/* Modal would be implemented as a separate component */}
    </div>
  );
}

export default App;