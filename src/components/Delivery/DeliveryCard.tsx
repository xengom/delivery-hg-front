import React from 'react';
import { Delivery } from '../../types';
import './DeliveryCard.css';

// Function to extract abbreviated address from full address
const getAbbreviatedAddress = (fullAddress: string | undefined): string => {
  if (!fullAddress) return '';

  // Split the address by spaces
  const parts = fullAddress.split(' ');

  // Take the first two parts (usually city and district)
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }

  // If there's only one part, return it
  return parts[0];
};

interface DeliveryCardProps {
  delivery: Delivery;
  formatSettlement: (settlement: string) => string;
  handleStatusChange: (id: string, currentStatus: string) => Promise<void>;
  handleDeliverySelect?: (delivery: Delivery) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const DeliveryCard: React.FC<DeliveryCardProps> = ({
  delivery,
  formatSettlement,
  handleStatusChange,
  handleDeliverySelect,
  isCollapsed,
  toggleCollapse
}) => {
  // CSS classes are used instead of inline styles

  return (
    <article 
      className="card card-container" 
      data-id={delivery.id} 
      data-st={delivery.status}
    >
      <div 
        className="card-header"
        onClick={toggleCollapse}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ flex: 1 }}>
            <div
              onClick={(e) => {
                e.stopPropagation();
                if (handleDeliverySelect) {
                  handleDeliverySelect(delivery);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <p>{delivery.wholesaler || '도매처 없음'}</p>
              <p>{delivery.businessName || '상호명 없음'}</p>
              <hr style={{ flex: 1, margin: '5px 0' }} />
              <div style={{ width: '100%' }}>
                <p>
                  {delivery.recipient?.address?.full ? getAbbreviatedAddress(delivery.recipient.address.full) : ''} {delivery.boxCount}박스 · {formatSettlement(delivery.settlement)} · ₩{delivery.fee || 0}
                </p>
              </div>
            </div>
            <div>

            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center'}}>
            <a href={`sms:${delivery.recipient?.phone || ''}`} aria-label="SMS 보내기" onClick={(e) => e.stopPropagation()}>📧</a>
            <a 
              href={`nmap://search?query=${encodeURIComponent(delivery.recipient?.address?.full || '')}`} 
              aria-label="지도 보기"
              onClick={(e) => e.stopPropagation()}
            >
              🗺
            </a>
            <button 
              className="action-button"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange(delivery.id, delivery.status);
              }}
            >
              {delivery.status === 'RECEIVED' 
                ? '상차완료' 
                : delivery.status === 'PICKED_UP' 
                  ? '배송시작' 
                  : delivery.status === 'DELIVERING' 
                    ? '배송완료' 
                    : delivery.status === 'PENDING_SETTLEMENT' 
                      ? '정산완료' 
                      : '완료'}
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '10%', alignItems: 'center' }}>

          <div className="collapse-indicator" style={{ marginLeft: '10px' }}>
            <span className={`collapse-arrow ${isCollapsed ? '' : 'expanded'}`}>
              ▲
            </span>
          </div>
        </div>
      </div>

      <div 
        className={`card-content ${isCollapsed ? 'collapsed' : 'expanded'}`}
      >
        {delivery.recipient?.address?.full && <p><strong>주소:</strong> {delivery.recipient.address.full}</p>}
        {delivery.recipient?.phone && <p><strong>연락처:</strong> {delivery.recipient.phone}</p>}
        {delivery.notes && <p><strong>비고:</strong> {delivery.notes}</p>}
      </div>
    </article>
  );
};

export default DeliveryCard;
