import React, { useCallback } from 'react';
import { Contact, ContactFormData } from '../../types';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ContactFormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => void;
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
        };

        onInputChange(event);
      }
    }).open();
  }, [onInputChange]);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
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
            <label>휴대전화번호 (최대 3개)</label>
            {formData.phones.map((phone, index) => (
              <div key={index} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input 
                  type="tel" 
                  value={phone} 
                  onChange={(e) => {
                    const newPhones = [...formData.phones];
                    newPhones[index] = e.target.value;
                    const event = {
                      target: {
                        name: 'phones',
                        value: newPhones
                      }
                    };
                    onInputChange(event);
                  }} 
                  required={index === 0}
                  style={{ flex: 1 }}
                />
                {index > 0 && (
                  <button 
                    type="button" 
                    onClick={() => {
                      const newPhones = [...formData.phones];
                      newPhones.splice(index, 1);
                      const event = {
                        target: {
                          name: 'phones',
                          value: newPhones
                        }
                      };
                      onInputChange(event);
                    }}
                    style={{ 
                      backgroundColor: '#ea4335', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px', 
                      padding: '0 10px',
                      cursor: 'pointer'
                    }}
                  >
                    삭제
                  </button>
                )}
              </div>
            ))}
            {formData.phones.length < 3 && (
              <button 
                type="button" 
                onClick={() => {
                  const newPhones = ['', ...formData.phones]; // Add new phone at the beginning
                  const event = {
                    target: {
                      name: 'phones',
                      value: newPhones
                    }
                  };
                  onInputChange(event);
                }}
                style={{ 
                  backgroundColor: '#4285f4', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px', 
                  padding: '5px 15px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                휴대전화번호 추가
              </button>
            )}
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
              <button type="button" className="delete-btn" style={{ backgroundColor: '#ea4335', color: 'white' }} onClick={onDelete}>삭제</button>
            )}
            <div style={{ display: 'flex', gap: '10px', marginLeft: isEditing ? 'auto' : '0' }}>
              <button type="button" onClick={onClose} style={{ whiteSpace: 'nowrap' }}>취소</button>
              <button type="submit">{isEditing ? '수정' : '등록'}</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;
