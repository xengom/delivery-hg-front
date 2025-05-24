import React, { useState, useEffect } from 'react';
import { Contact, ContactFormData } from '../types';
import ContactCard from './ContactCard';
import ContactModal from './ContactModal';
import { nanoid } from 'nanoid';
import { apiUrl } from '../config/api';

const AddressTab: React.FC = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Form state for the modal
  const [formData, setFormData] = useState<ContactFormData>({
    businessName: '',
    phone: '',
    address: '',
    note: ''
  });

  useEffect(() => {
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
          phone: '01050465595',
          address: '평택시 지산천로84',
          note: ''
        },
        {
          id: '2',
          businessName: '새 518꽃집(인천가족공원)',
          phone: '',
          address: '부평구 평온로61',
          note: ''
        },
        {
          id: '3',
          businessName: '새 MSS플라워',
          phone: '01027495281',
          address: '용인시 수지구 동천동878',
          note: ''
        },
        {
          id: '4',
          businessName: '새 가든브리즈',
          phone: '01023041022',
          address: '수원시 영통구 대학로101',
          note: '드림스퀘어1층108호 가게 잘안보임 대로 안경점 뒤 코너측'
        },
        {
          id: '5',
          businessName: '새 가톨릭대부천성모병원장례식장',
          phone: '032-340-7300',
          address: '부천시 소사로327',
          note: ''
        },
        {
          id: '6',
          businessName: '새 구하리교회',
          phone: '01027824244',
          address: '기흥구 마북로109',
          note: '본당앞에 올려놓을것'
        },
        {
          id: '7',
          businessName: '새 그로브블룸',
          phone: '010-7739-8340',
          address: '김포시 초당로61번길17',
          note: '104호 비0602*'
        }
      ]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddContact = () => {
    setIsEditing(false);
    setFormData({
      businessName: '',
      phone: '',
      address: '',
      note: ''
    });
    setIsModalOpen(true);
  };

  const handleSelectContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditing(true);
    setFormData({
      businessName: contact.businessName,
      phone: contact.phone,
      address: contact.address,
      note: contact.note || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isEditing && selectedContact) {
        // Update existing contact
        const updatedContact: Contact = {
          ...selectedContact,
          businessName: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          note: formData.note
        };

        // API call would go here
        // await fetch(apiUrl(`contacts/${selectedContact.id}`), {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updatedContact)
        // });

        // Update local state
        setContacts(contacts.map(c => 
          c.id === selectedContact.id ? updatedContact : c
        ));
      } else {
        // Create new contact
        const newContact: Contact = {
          id: nanoid(),
          businessName: formData.businessName,
          phone: formData.phone,
          address: formData.address,
          note: formData.note
        };

        // API call would go here
        // await fetch(apiUrl('contacts'), {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newContact)
        // });

        // Update local state
        setContacts([...contacts, newContact]);
      }

      // Reset form and close modal
      setFormData({
        businessName: '',
        phone: '',
        address: '',
        note: ''
      });
      setIsModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('연락처 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDelete = async () => {
    if (!selectedContact) return;

    try {
      // API call would go here
      // await fetch(apiUrl(`contacts/${selectedContact.id}`), {
      //   method: 'DELETE'
      // });

      // Update local state
      setContacts(contacts.filter(c => c.id !== selectedContact.id));
      setIsModalOpen(false);
      setSelectedContact(null);
    } catch (error) {
      console.error('Error deleting contact:', error);
      alert('연락처 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="tab-content">
      <main id="list">
        {contacts.map(contact => (
          <ContactCard 
            key={contact.id} 
            contact={contact} 
            onSelect={handleSelectContact} 
          />
        ))}
      </main>

      <button id="fab" onClick={handleAddContact}>＋</button>

      <ContactModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onInputChange={handleInputChange}
        onSubmit={handleSubmit}
        isEditing={isEditing}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AddressTab;
