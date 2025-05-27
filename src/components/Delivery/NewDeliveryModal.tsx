import React, { useCallback, useState, useEffect } from 'react';
import { FormData, Delivery, Contact } from '../../types';

interface NewDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormData;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  generateOrderNumber: () => string;
  contacts: Contact[];
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
  isEditing?: boolean;
  selectedDelivery?: Delivery | null;
}

const NewDeliveryModal: React.FC<NewDeliveryModalProps> = ({
  isOpen,
  onClose,
  formData,
  onInputChange,
  onSubmit,
  generateOrderNumber,
  contacts,
  setFormData,
  isEditing,
  selectedDelivery
}) => {
  const [suggestions, setSuggestions] = useState<Contact[]>([]);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

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

  // Filter contacts based on business name input
  const handleBusinessNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onInputChange(e);

    if (value.length > 0) {
      const filteredContacts = contacts.filter(contact => 
        contact.businessName.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filteredContacts);
      setShowSuggestions(filteredContacts.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Auto-fill form data when a contact is selected
  const handleSelectContact = (contact: Contact) => {
    // Create a single event that updates all fields at once
    // This is a more direct approach than creating separate events
    const event = {
      target: {
        name: 'all',
        value: {
          businessName: contact.businessName,
          phone: contact.phones && contact.phones.length > 0 ? contact.phones[0] : '',
          address: contact.address,
          notes: contact.note || '',
          wholesaler: '', // Default empty value for wholesaler
          boxCount: formData.boxCount || '1' // Keep existing box count or default to 1
        }
      }
    };

    // Call a special handler for this event
    handleAllFieldsChange(event);

    // Hide suggestions
    setShowSuggestions(false);
  };

  // Special handler for updating all fields at once
  const handleAllFieldsChange = (event: any) => {
    if (event.target.name === 'all') {
      const values = event.target.value;

      if (setFormData) {
        // If setFormData is provided, use it to update all fields at once
        setFormData(prevFormData => ({
          ...prevFormData,
          businessName: values.businessName,
          phone: values.phone,
          address: values.address,
          notes: values.notes,
          wholesaler: values.wholesaler || '',
          boxCount: values.boxCount || formData.boxCount || '1'
        }));
      } else {
        // Otherwise, fall back to using onInputChange for individual fields
        const businessNameEvent = {
          target: { name: 'businessName', value: values.businessName }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(businessNameEvent);

        const phoneEvent = {
          target: { name: 'phone', value: values.phone }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(phoneEvent);

        const addressEvent = {
          target: { name: 'address', value: values.address }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(addressEvent);

        const notesEvent = {
          target: { name: 'notes', value: values.notes }
        } as React.ChangeEvent<HTMLTextAreaElement>;
        onInputChange(notesEvent);

        const wholesalerEvent = {
          target: { name: 'wholesaler', value: values.wholesaler || '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(wholesalerEvent);

        const boxCountEvent = {
          target: { name: 'boxCount', value: values.boxCount || formData.boxCount || '1' }
        } as React.ChangeEvent<HTMLInputElement>;
        onInputChange(boxCountEvent);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isEditing ? '배달 수정' : '새 배달 등록'}</h2>
        <form onSubmit={onSubmit}>
          <div className="form-group">
            <label>주문번호</label>
            <input 
              type="text" 
              value={isEditing && selectedDelivery ? selectedDelivery.id : generateOrderNumber()} 
              disabled
            />
          </div>

          <div className="form-group">
            <label>도매처</label>
            <input
                type="text"
                name="wholesaler"
                value={formData.wholesaler || ''}
                onChange={onInputChange}
            />
          </div>

          <div className="form-group">
            <label>상호명</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="businessName" 
                value={formData.businessName} 
                onChange={handleBusinessNameChange} 
                required 
              />
              {showSuggestions && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  backgroundColor: 'white', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px', 
                  zIndex: 10,
                  maxHeight: '200px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map(contact => (
                    <div 
                      key={contact.id} 
                      onClick={() => handleSelectContact(contact)}
                      style={{ 
                        padding: '8px 12px', 
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {contact.businessName}
                    </div>
                  ))}
                </div>
              )}
            </div>
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
            <label>비고</label>
            <textarea
                name="notes"
                value={formData.notes}
                onChange={onInputChange}
            ></textarea>
          </div>
          <div className="form-group">
            <label>박스 수</label>
            <input 
              type="text" 
              name="boxCount" 
              value={formData.boxCount} 
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
              value={formData.settlementMethod === 'PREPAID' ? '정산완료' : '접수'} 
              disabled 
            />
            <small>{formData.settlementMethod === 'PREPAID' ? '선불은 정산완료로 표시됩니다' : '선불 외에는 접수로 표시됩니다'}</small>
          </div>
          <div className="form-actions">
            <button type="button" onClick={onClose} style={{ whiteSpace: 'nowrap' }}>취소</button>
            <button type="submit">{isEditing ? '수정' : '등록'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewDeliveryModal;
