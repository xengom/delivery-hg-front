import React, { useState, useEffect } from 'react';
import './App.css';
import { Delivery, BottomTabType, FormData, Contact } from './types';
import DeliveryTab from './components/Delivery/DeliveryTab';
import StatsTab from './components/Stats/StatsTab';
import ContactTab from './components/Contact/ContactTab';
import { apiUrl } from './config/api';
import { nanoid } from 'nanoid';
import {dateOfToday} from "./utils/dateUtils";

const App: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabType>('delivery');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Form state for the modal
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    phone: '',
    address: '',
    fee: '',
    settlementMethod: 'PREPAID', // Default to 선불
    notes: '',
    wholesaler: '',
    boxCount: '1' // Default to 1
  });

  useEffect(() => {
    fetchDeliveries();
    fetchContacts();
  }, []);

  const fetchContacts = async (): Promise<void> => {
    try {
      const response = await fetch(apiUrl('contacts'));
      const data = await response.json();
      setContacts(data);
    } catch (error) {
      console.error('Error fetching contacts:', error);
      // For demo purposes, load some sample data if API fails
      setContacts([
        {
          id: '1',
          businessName: '새 007천사',
          phones: ['01050465595'],
          address: '평택시 지산천로84',
          note: ''
        },
        {
          id: '2',
          businessName: '새 518꽃집(인천가족공원)',
          phones: [],
          address: '부평구 평온로61',
          note: ''
        },
        {
          id: '3',
          businessName: '새 MSS플라워',
          phones: ['01027495281'],
          address: '용인시 수지구 동천동878',
          note: ''
        },
        {
          id: '4',
          businessName: '새 가든브리즈',
          phones: ['01023041022', '01012345678'], // Added a second phone number as an example
          address: '수원시 영통구 대학로101',
          note: '드림스퀘어1층108호 가게 잘안보임 대로 안경점 뒤 코너측'
        },
        {
          id: '5',
          businessName: '새 가톨릭대부천성모병원장례식장',
          phones: ['032-340-7300'],
          address: '부천시 소사로327',
          note: ''
        },
        {
          id: '6',
          businessName: '새 구하리교회',
          phones: ['01027824244', '01098765432', '01011112222'], // Added multiple phone numbers as an example
          address: '기흥구 마북로109',
          note: '본당앞에 올려놓을것'
        },
        {
          id: '7',
          businessName: '새 그로브블룸',
          phones: ['010-7739-8340'],
          address: '김포시 초당로61번길17',
          note: '104호 비0602*'
        }
      ]);
    }
  };

  const fetchDeliveries = async (): Promise<void> => {
    try {
      const response = await fetch(apiUrl('deliveries'));
      const data = await response.json();
      setDeliveries(data);
    } catch (error) {
      console.error('Error fetching deliveries:', error);
    }
  };

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
    // Find the delivery by ID
    const delivery = deliveries.find(d => d.id === id);
    if (!delivery) {
      console.error('Delivery not found:', id);
      return;
    }

    let newStatus: string;
    if (currentStatus === 'RECEIVED') {
      // 접수 -> 상차완료
      newStatus = 'PICKED_UP';
    } else if (currentStatus === 'PICKED_UP') {
      // 상차완료 -> 배송중
      newStatus = 'DELIVERING';
    } else if (currentStatus === 'DELIVERING') {
      // 배송중 -> 정산전 or 정산완료 (if PREPAID)
      if (delivery.settlement === 'PREPAID') {
        newStatus = 'SETTLED';
      } else {
        newStatus = 'PENDING_SETTLEMENT';
      }
    } else if (currentStatus === 'PENDING_SETTLEMENT') {
      // 정산전 -> 정산완료
      newStatus = 'SETTLED';
    } else {
      return; // Already completed
    }

    try {
      await fetch(apiUrl(`deliveries/${id}/status`), {
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

  // Generate order number in format YYMMDD-001 with sequential numbering
  const generateOrderNumber = (): string => {
    const datePrefix = dateOfToday();

    // Find the highest number for today's date
    let maxNumber = 0;
    deliveries.forEach(delivery => {
      if (delivery.id.startsWith(datePrefix)) {
        const numberPart = parseInt(delivery.id.split('-')[1]);
        if (numberPart > maxNumber) {
          maxNumber = numberPart;
        }
      }
    });

    // Increment the number and pad to 3 digits
    const nextNumber = (maxNumber + 1).toString().padStart(3, '0');

    return `${datePrefix}-${nextNumber}`;
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Check if a business name exists in contacts
  const findContactByBusinessName = (businessName: string): Contact | undefined => {
    return contacts.find(contact => contact.businessName === businessName);
  };

  // Check if contact details have changed
  const hasContactDetailsChanged = (contact: Contact, formData: FormData): boolean => {
    // Check if the primary phone number has changed
    const primaryPhoneChanged = contact.phones && contact.phones.length > 0 
      ? contact.phones[0] !== formData.phone 
      : formData.phone !== '';

    return (
      primaryPhoneChanged ||
      contact.address !== formData.address ||
      contact.note !== formData.notes
    );
  };

  // Update or add contact to address book
  const updateOrAddContact = (formData: FormData): void => {
    const existingContact = findContactByBusinessName(formData.businessName);

    if (existingContact) {
      // If contact exists but details have changed, update it
      if (hasContactDetailsChanged(existingContact, formData)) {
        // Update the contact, adding the new phone number at the beginning if it's not empty and not already in the list
        let updatedPhones = [...(existingContact.phones || [])];

        // Add the new phone number at the beginning if it's not empty and not already in the list
        if (formData.phone && formData.phone.trim() !== '' && !updatedPhones.includes(formData.phone)) {
          updatedPhones = [formData.phone, ...updatedPhones];
          // Limit to 3 phone numbers
          if (updatedPhones.length > 3) {
            updatedPhones = updatedPhones.slice(0, 3);
          }
        }

        const updatedContact = {
          ...existingContact,
          phones: updatedPhones,
          address: formData.address,
          note: formData.notes
        };
        setContacts(contacts.map(c => c.id === existingContact.id ? updatedContact : c));
      }
    } else {
      // If contact doesn't exist, add it
      const newContact = {
        id: nanoid(),
        businessName: formData.businessName,
        phones: formData.phone && formData.phone.trim() !== '' ? [formData.phone] : [],
        address: formData.address,
        note: formData.notes
      };
      setContacts([...contacts, newContact]);
    }
  };

  // Handle delivery selection for editing
  const handleDeliverySelect = (delivery: Delivery): void => {
    setSelectedDelivery(delivery);
    setIsEditing(true);

    // Populate form data with selected delivery
    setFormData({
      businessName: delivery.businessName || '',
      phone: delivery.recipient?.phone || '', // Keep using single phone for delivery form
      address: delivery.recipient?.address?.full || '',
      fee: delivery.fee?.toString() || '',
      settlementMethod: delivery.settlement,
      notes: delivery.notes || '',
      wholesaler: delivery.wholesaler || '',
      boxCount: delivery.boxCount?.toString() || '1'
    });

    setIsModalOpen(true);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedDelivery) {
        // Update existing delivery
        const updatedDelivery = {
          ...selectedDelivery,
          recipient: {
            address: { full: formData.address },
            phone: formData.phone
          },
          businessName: formData.businessName,
          fee: parseInt(formData.fee) || 0,
          settlement: formData.settlementMethod,
          notes: formData.notes,
          wholesaler: formData.wholesaler,
          boxCount: parseInt(formData.boxCount || '1')
        };

        // API call would go here
        // await fetch(apiUrl(`deliveries/${selectedDelivery.id}`), {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updatedDelivery)
        // });

        // For now, just update local state
        setDeliveries(deliveries.map(d => d.id === selectedDelivery.id ? updatedDelivery : d));
      } else {
        // Create new delivery with auto-generated fields
        const orderNumber = generateOrderNumber();
        const newDelivery = {
          id: orderNumber,
          status: 'RECEIVED', // Default to 접수 (신규 배달 등록시 디폴트값)
          recipient: {
            address: { full: formData.address },
            phone: formData.phone
          },
          businessName: formData.businessName,
          boxCount: formData.boxCount || '1',
          fee: parseInt(formData.fee) || 0,
          settlement: formData.settlementMethod,
          notes: formData.notes,
          wholesaler: formData.wholesaler
        };

        // API call would go here
        // await fetch(apiUrl('deliveries'), {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newDelivery)
        // });

        // For now, just add to local state
        setDeliveries([...deliveries, newDelivery as Delivery]);
      }

      // Update or add contact to address book
      updateOrAddContact(formData);

      // Reset form and close modal
      setFormData({
        businessName: '',
        phone: '',
        address: '',
        fee: '',
        settlementMethod: 'PREPAID',
        notes: '',
        wholesaler: '',
        boxCount: '1'
      });
      setIsModalOpen(false);
      setSelectedDelivery(null);
      setIsEditing(false);
    } catch (error) {
      console.error('Error saving delivery:', error);
      alert('배달 저장 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="App">
      <header>
        <span id="title">행복한 꽃배달</span>
        {/*<button>☰</button>*/}
      </header>

      {activeBottomTab === 'delivery' && (
        <DeliveryTab
          deliveries={deliveries}
          isModalOpen={isModalOpen}
          setIsModalOpen={(isOpen) => {
            // Reset edit mode and selected delivery when opening the modal for a new delivery
            if (isOpen && !isModalOpen) {
              setIsEditing(false);
              setSelectedDelivery(null);
              setFormData({
                businessName: '',
                phone: '',
                address: '',
                fee: '',
                settlementMethod: 'PREPAID',
                notes: '',
                wholesaler: '',
                boxCount: '1'
              });
            }
            setIsModalOpen(isOpen);
          }}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          generateOrderNumber={generateOrderNumber}
          handleStatusChange={handleStatusChange}
          formatSettlement={formatSettlement}
          contacts={contacts}
          setFormData={setFormData}
          handleDeliverySelect={handleDeliverySelect}
          isEditing={isEditing}
          selectedDelivery={selectedDelivery}
        />
      )}

      {activeBottomTab === 'stats' && <StatsTab />}

      {activeBottomTab === 'contact' && <ContactTab contacts={contacts} setContacts={setContacts} />}

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
          className={activeBottomTab === 'contact' ? 'on' : ''} 
          onClick={() => setActiveBottomTab('contact')}
        >
          주소록
        </a>
      </nav>
    </div>
  );
};

export default App;
