import React, { useState, useEffect, useMemo } from 'react';
import { Delivery, Contact, FormData } from '../../types';
import NewDeliveryModal from './NewDeliveryModal';
import DeliveryCard from './DeliveryCard';
import {dateOfToday} from "../../utils/dateUtils";

interface DeliveryTabProps {
  deliveries: Delivery[];
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  generateOrderNumber: () => string;
  handleStatusChange: (id: string, currentStatus: string) => Promise<void>;
  formatSettlement: (settlement: string) => string;
  contacts: Contact[];
  setFormData?: React.Dispatch<React.SetStateAction<FormData>>;
  handleDeliverySelect?: (delivery: Delivery) => void;
  isEditing?: boolean;
  selectedDelivery?: Delivery | null;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  deliveries,
  isModalOpen,
  setIsModalOpen,
  formData,
  handleInputChange,
  handleSubmit,
  generateOrderNumber,
  handleStatusChange,
  formatSettlement,
  contacts,
  setFormData,
  handleDeliverySelect,
  isEditing,
  selectedDelivery
}) => {
  // State to track if we should show only picked up deliveries
  const [showOnlyPickedUp, setShowOnlyPickedUp] = useState<boolean>(false);

  // State to track if all cards are expanded or collapsed
  const [areAllExpanded, setAreAllExpanded] = useState<boolean>(false);

  // Filter deliveries based on the toggle state
  const filteredDeliveries = useMemo(() => {
    if (showOnlyPickedUp) {
      return deliveries.filter(delivery => delivery.status === 'PICKED_UP');
    }
    return deliveries;
  }, [deliveries, showOnlyPickedUp]);

  // State to track collapsed state of each delivery card
  const [collapsedCards, setCollapsedCards] = useState<Record<string, boolean>>({});

  // Initialize collapsed state for new deliveries
  useEffect(() => {
    const newCollapsedState = { ...collapsedCards };
    let stateChanged = false;

    filteredDeliveries.forEach(delivery => {
      if (collapsedCards[delivery.id] === undefined) {
        newCollapsedState[delivery.id] = true; // Default to collapsed
        stateChanged = true;
      }
    });

    if (stateChanged) {
      setCollapsedCards(newCollapsedState);
    }
  }, [filteredDeliveries]);

  // Toggle collapse state for a single card
  const toggleCardCollapse = (id: string) => {
    setCollapsedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Collapse all cards
  const collapseAll = () => {
    const newState: Record<string, boolean> = {};
    filteredDeliveries.forEach(delivery => {
      newState[delivery.id] = true;
    });
    setCollapsedCards(newState);
    setAreAllExpanded(false);
  };

  // Expand all cards
  const expandAll = () => {
    const newState: Record<string, boolean> = {};
    filteredDeliveries.forEach(delivery => {
      newState[delivery.id] = false;
    });
    setCollapsedCards(newState);
    setAreAllExpanded(true);
  };

  // Toggle between expand all and collapse all
  const toggleExpandCollapse = () => {
    if (areAllExpanded) {
      collapseAll();
    } else {
      expandAll();
    }
  };

  // Calculate the sum of shipping fees for deliveries registered today
  const todayDeliveryFeesSum = useMemo(() => {
    // Get today's date in YYMMDD format
    const datePrefix = dateOfToday();

    // Filter deliveries registered today and sum their fees
    return deliveries
      .filter(delivery => delivery.id.startsWith(datePrefix))
      .reduce((sum, delivery) => sum + (delivery.fee || 0), 0);
  }, [deliveries]);

  return (
    <>
      <div style={{ 
        padding: '10px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {/* Always show today's delivery fee total */}
        <div style={{ 
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          오늘 배송건의 배송료 합계: {todayDeliveryFeesSum.toLocaleString()}원
        </div>

        {/* Three buttons in a row */}
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          {/* Button 1: Toggle to show only completed pickups */}
          <button 
            onClick={() => setShowOnlyPickedUp(!showOnlyPickedUp)}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: showOnlyPickedUp ? '#4CAF50' : '#f1f1f1', 
              color: showOnlyPickedUp ? 'white' : 'black',
              border: '1px solid #ddd', 
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1'
            }}
          >
            {showOnlyPickedUp ? '모든 배송건 보기' : '상차완료인 건만 보기'}
          </button>

          {/* Button 2: Toggle between expand all and collapse all */}
          <button 
            onClick={toggleExpandCollapse}
            style={{ 
              padding: '5px 10px', 
              backgroundColor: areAllExpanded ? '#4CAF50' : '#f1f1f1', 
              color: areAllExpanded ? 'white' : 'black',
              border: '1px solid #ddd', 
              borderRadius: '4px',
              cursor: 'pointer',
              flex: '1'
            }}
          >
            {areAllExpanded ? '모두 접기' : '모두 펼치기'}
          </button>
        </div>
      </div>

      <main id="list">
        {filteredDeliveries.map(delivery => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            formatSettlement={formatSettlement}
            handleStatusChange={handleStatusChange}
            handleDeliverySelect={handleDeliverySelect}
            isCollapsed={collapsedCards[delivery.id]}
            toggleCollapse={() => toggleCardCollapse(delivery.id)}
          />
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
        contacts={contacts}
        setFormData={setFormData}
        isEditing={isEditing}
        selectedDelivery={selectedDelivery}
      />
    </>
  );
};

export default DeliveryTab;
