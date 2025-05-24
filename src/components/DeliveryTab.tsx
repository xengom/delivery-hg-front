import React from 'react';
import { Delivery, TopTabType } from '../types';
import NewDeliveryModal from './NewDeliveryModal';

interface DeliveryTabProps {
  deliveries: Delivery[];
  activeTab: TopTabType;
  setActiveTab: (tab: TopTabType) => void;
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  formData: any;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  generateOrderNumber: () => string;
  handleStatusChange: (id: string, currentStatus: string) => Promise<void>;
  formatSettlement: (settlement: string) => string;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  deliveries,
  activeTab,
  setActiveTab,
  isModalOpen,
  setIsModalOpen,
  formData,
  handleInputChange,
  handleSubmit,
  generateOrderNumber,
  handleStatusChange,
  formatSettlement
}) => {
  const filteredDeliveries = activeTab === 'pickup'
    ? deliveries.filter(d => d.status !== 'SETTLED')
    : deliveries.filter(d => d.status === 'SETTLED');

  return (
    <>
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

      <NewDeliveryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        generateOrderNumber={generateOrderNumber}
      />
    </>
  );
};

export default DeliveryTab;