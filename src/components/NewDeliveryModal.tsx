import React from 'react';
import { FormData, Delivery } from '../types';

interface NewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  generateOrderNumber: () => string;
}

const NewDeliveryModal: React.FC<NewDeliveryModalProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  generateOrderNumber
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>새 배달 등록</h2>
        <form onSubmit={onSubmit}>
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
              onChange={onInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>휴대전화번호</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={onInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>주소</label>
            <input 
              type="text" 
              name="address" 
              value={formData.address} 
              onChange={onInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>배송료</label>
            <input 
              type="number" 
              name="fee" 
              value={formData.fee} 
              onChange={onInputChange} 
              required 
            />
          </div>

          <div className="form-group">
            <label>정산방법</label>
            <select 
              name="settlementMethod" 
              value={formData.settlementMethod} 
              onChange={onInputChange}
            >
              <option value="PREPAID">선불</option>
              <option value="COLLECT">착불</option>
              <option value="OFFICE">사무실</option>
              <option value="RECEIPT_REQUIRED">인수증</option>
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
              onChange={onInputChange}
            ></textarea>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose}>취소</button>
            <button type="submit">등록</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeliveryModal;