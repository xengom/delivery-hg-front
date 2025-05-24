import React, { useState, useEffect } from 'react';
import './App.css';
import { Delivery, TopTabType, BottomTabType, FormData } from './types';
import DeliveryTab from './components/DeliveryTab';
import StatsTab from './components/StatsTab';
import AddressTab from './components/AddressTab';
import { apiUrl } from './config/api';

const App: React.FC = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [activeTab, setActiveTab] = useState<TopTabType>('pickup');
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabType>('delivery');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Form state for the modal
  const [formData, setFormData] = useState<FormData>({
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
    let newStatus: string;
    if (currentStatus === 'PICKED_UP') {
      newStatus = 'DELIVERED';
    } else if (currentStatus === 'DELIVERED') {
      newStatus = 'SETTLED';
    } else {
      return; // Already settled
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
      // await fetch(apiUrl('deliveries'), {
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

      {activeBottomTab === 'delivery' && (
        <DeliveryTab
          deliveries={deliveries}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmit}
          generateOrderNumber={generateOrderNumber}
          handleStatusChange={handleStatusChange}
          formatSettlement={formatSettlement}
        />
      )}

      {activeBottomTab === 'stats' && <StatsTab />}

      {activeBottomTab === 'address' && <AddressTab />}

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
    </div>
  );
};

export default App;
