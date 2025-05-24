import React, { useCallback } from 'react';
import { Contact, ContactFormData } from '../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ContactFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
  onDelete?: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  isEditing,
  onDelete
}) => {
  if (!isOpen) return null;

  // Function to open Daum Postcode popup
  const openPostcode = useCallback(() => {
    // @ts-ignore - Daum Postcode is loaded from external script
    new window.daum.Postcode({
      oncomplete: function(data: any) {
        // Get the full address
        let fullAddress = data.address;
        let extraAddress = '';

        // Add extra address information if available
        if (data.addressType === 'R') {
          if (data.bname !== '') {
            extraAddress += data.bname;
          }
          if (data.buildingName !== '') {
            extraAddress += (extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName);
          }
          fullAddress += (extraAddress !== '' ? ` (${extraAddress})` : '');
        }

        // Update form data with the selected address
        const event = {
          target: {
            name: 'address',
            value: fullAddress
          }
        } as React.ChangeEvent<HTMLInputElement>;

        onInputChange(event);
      }
    }).open();
  }, [onInputChange]);

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{isEditing ? '연락처 수정' : '새 연락처 등록'}</h2>
        <form onSubmit={onSubmit}>
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
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                name="address" 
                value={formData.address} 
                onChange={onInputChange} 
                required 
                readOnly
                style={{ flex: 1 }}
              />
              <button 
                type="button" 
                onClick={openPostcode}
                style={{ 
                  backgroundColor: '#4285f4', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '0 15px',
                  cursor: 'pointer'
                }}
              >
                주소검색
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>메모</label>
            <textarea 
              name="note" 
              value={formData.note} 
              onChange={onInputChange}
            ></textarea>
          </div>

          <div className="form-actions">
            {isEditing && onDelete && (
              <button type="button" className="delete-btn" onClick={onDelete}>삭제</button>
            )}
            <div style={{ display: 'flex', gap: '10px', marginLeft: isEditing ? 'auto' : '0' }}>
              <button type="button" onClick={onClose}>취소</button>
              <button type="submit">{isEditing ? '수정' : '등록'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
