import React, { useState, useEffect } from 'react';
import './App.css';

// Define types for the delivery data
interface Address {
  full: string;
}

interface Recipient {
  address?: Address;
  phone?: string;
}

interface Delivery {
  id: string;
  status: 'PICKED_UP' | 'DELIVERED' | 'SETTLED';
  recipient?: Recipient;
  boxCount: number;
  fee?: number;
  settlement: 'PREPAID' | 'COLLECT' | 'OFFICE' | 'RECEIPT_REQUIRED';
}

type TopTapType = 'pickup' | 'delivered' | 'settled';
type BottomTopTapType = 'delivery' | 'stats' | 'address';

const App: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<TopTapType>('pickup');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTopTapType>('delivery');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form state for the modal
  const [formData, setFormData] = useState({
    businessName: '',
    phone: '',
    address: '',
    fee: '',
    settlementMethod: 'PREPAID', // Default to 선불
    notes: ''
  });

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async (): Promise<void> => {
    try {
      const response = await fetch('/api/deliveries');
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

  const filteredDeliveries = activeTab === 'pickup'
    ? deliveries.filter(d => d.status !== 'SETTLED')
    : deliveries.filter(d => d.status === 'SETTLED');

  const formatSettlement = (settlement: string): string => {
    const map: Record<string, string> = {
      'PREPAID': '선불',
      'COLLECT': '착불',
      'OFFICE': '사무실',
      'RECEIPT_REQUIRED': '인수증'
    };
    return map[settlement] || settlement;
  };

  const handleStatusChange = async (id: string, currentStatus: string): Promise<void> => {
    let newStatus: string;
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

  // Generate order number in format YYMMDDHHmmss-{random number}
  const generateOrderNumber = (): string => {
    const now = new Date();
    const year = now.getFullYear().toString().slice(2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}-${randomNum}`;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const orderNumber = generateOrderNumber();

      // Create new delivery with auto-generated fields
      const newDelivery = {
        id: orderNumber,
        status: 'PICKED_UP', // Default to 배송준비
        recipient: {
          address: { full: formData.address },
          phone: formData.phone
        },
        businessName: formData.businessName,
        boxCount: 1, // Default value
        fee: parseInt(formData.fee) || 0,
        settlement: formData.settlementMethod,
        notes: formData.notes,
        // Settlement status is determined by settlement method
      };

      // API call would go here
      // await fetch('/api/deliveries', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newDelivery)
      // });

      // For now, just add to local state
      setDeliveries([...deliveries, newDelivery as Delivery]);

      // Reset form and close modal
      setFormData({
        businessName: '',
        phone: '',
        address: '',
        fee: '',
        settlementMethod: 'PREPAID',
        notes: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating delivery:', error);
      alert('배달 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="App">
      <header>
        <span id="title">행복한 꽃배달</span>
        {/*<button>☰</button>*/}
      </header>

      <nav className="tabs">
        <button 
          className={activeTab === 'pickup' ? 'active' : ''} 
          onClick={() => setActiveTab('pickup')}
        >
          진행중
        </button>
        <button
            className={activeTab === 'delivered' ? 'active' : ''}
            onClick={() => setActiveTab('delivered')}
        >
          배송완료
        </button>
        <button 
          className={activeTab === 'settled' ? 'active' : ''} 
          onClick={() => setActiveTab('settled')}
        >
          정산완료
        </button>
      </nav>

      <main id="list">
        {activeBottomTab === 'delivery' && (
          <>
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
          </>
        )}

        {activeBottomTab === 'stats' && (
          <div className="tab-content">
            <h2>통계</h2>
            <p>통계 정보가 여기에 표시됩니다.</p>
          </div>
        )}

        {activeBottomTab === 'address' && (
          <div className="tab-content">
            <h2>주소록</h2>
            <p>주소록 정보가 여기에 표시됩니다.</p>
          </div>
        )}
      </main>

      <button id="fab" onClick={() => setIsModalOpen(true)}>＋</button>

      <nav className="bottom">
        <a 
          className={activeBottomTab === 'delivery' ? 'on' : ''} 
          onClick={() => setActiveBottomTab('delivery')}
        >
          배달
        </a>
        <a 
          className={activeBottomTab === 'stats' ? 'on' : ''} 
          onClick={() => setActiveBottomTab('stats')}
        >
          통계
        </a>
        <a 
          className={activeBottomTab === 'address' ? 'on' : ''} 
          onClick={() => setActiveBottomTab('address')}
        >
          주소록
        </a>
      </nav>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>새 배달 등록</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>주문번호</label>
                <input 
                  type="text" 
                  value={generateOrderNumber()} 
                  disabled 
                  placeholder="자동 생성됩니다" 
                />
                <small>자동 생성됩니다</small>
              </div>

              <div className="form-group">
                <label>상호명</label>
                <input 
                  type="text" 
                  name="businessName" 
                  value={formData.businessName} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>휴대전화번호</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>주소</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>배송료</label>
                <input 
                  type="number" 
                  name="fee" 
                  value={formData.fee} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>

              <div className="form-group">
                <label>정산방법</label>
                <select 
                  name="settlementMethod" 
                  value={formData.settlementMethod} 
                  onChange={handleInputChange}
                >
                  <option value="PREPAID">선불</option>
                  <option value="COLLECT">착불</option>
                  <option value="OFFICE">사무실</option>
                  <option value="RECEIPT_REQUIRED">수증</option>
                </select>
              </div>

              <div className="form-group">
                <label>배송상태</label>
                <input 
                  type="text" 
                  value="배송준비" 
                  disabled 
                />
                <small>기본값: 배송준비</small>
              </div>

              <div className="form-group">
                <label>정산상태</label>
                <input 
                  type="text" 
                  value={formData.settlementMethod === 'PREPAID' ? '정산완료' : '정산전'} 
                  disabled 
                />
                <small>{formData.settlementMethod === 'PREPAID' ? '선불은 정산완료로 표시됩니다' : '선불 외에는 정산전으로 표시됩니다'}</small>
              </div>

              <div className="form-group">
                <label>비고</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleInputChange}
                ></textarea>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setIsModalOpen(false)}>취소</button>
                <button type="submit">등록</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
