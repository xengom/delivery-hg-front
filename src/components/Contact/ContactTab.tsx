import React, { useState } from 'react';
import { Contact, ContactFormData } from '../../types';
import ContactCard from './ContactCard';
import ContactModal from './ContactModal';
import { nanoid } from 'nanoid';
import { apiUrl } from '../../config/api';

interface ContactTabProps {
  contacts: Contact[];
  setContacts: React.Dispatch<React.SetStateAction<Contact[]>>;
}

const ContactTab: React.FC<ContactTabProps> = ({ contacts, setContacts }) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Form state for the modal
  const [formData, setFormData] = useState<ContactFormData>({
    businessName: '',
    phones: [''], // Initialize with one empty phone number
    address: '',
    note: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: any } }) => {
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
      phones: [''], // Initialize with one empty phone number
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
      phones: contact.phones || [''], // Use contact's phones or initialize with one empty phone
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
        const updatedContact = {
          ...selectedContact,
          businessName: formData.businessName,
          phones: formData.phones.filter(phone => phone.trim() !== ''), // Remove empty phone numbers
          address: formData.address,
          note: formData.note
        };

        // API call would go here
        // await fetch(apiUrl(`contacts/${selectedContact.id}`), {
        //   method: 'PUT',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(updatedContact)
        // });

        // For now, just update local state
        setContacts(contacts.map(c => c.id === selectedContact.id ? updatedContact : c));
      } else {
        // Create new contact
        const newContact = {
          id: nanoid(),
          businessName: formData.businessName,
          phones: formData.phones.filter(phone => phone.trim() !== ''), // Remove empty phone numbers
          address: formData.address,
          note: formData.note
        };

        // API call would go here
        // await fetch(apiUrl('contacts'), {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify(newContact)
        // });

        // For now, just add to local state
        setContacts([...contacts, newContact]);
      }

      // Reset form and close modal
      setFormData({
        businessName: '',
        phones: [''], // Initialize with one empty phone number
        address: '',
        note: ''
      });
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving contact:', error);
      alert('연락처 저장 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      // API call would go here
      // await fetch(apiUrl(`contacts/${selectedContact.id}`), {
      //   method: 'DELETE'
      // });

      // For now, just update local state
      setContacts(contacts.filter(c => c.id !== selectedContact.id));
      setIsModalOpen(false);
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
        onDelete={handleDeleteContact}
      />
    </div>
  );
};

export default ContactTab;
