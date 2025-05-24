import React from 'react';
import { Contact } from '../types';

interface ContactCardProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onSelect }) => {
  return (
    <article className="card" onClick={() => onSelect(contact)}>
      <div>
        <h3>{contact.businessName}</h3>
        <p>{contact.phone}</p>
        <p>{contact.address}</p>
        {contact.note && <p className="note">{contact.note}</p>}
      </div>
      <div className="act">
        <a href={`sms:${contact.phone}`} aria-label="SMS 보내기" onClick={(e) => e.stopPropagation()}>✉</a>
        <a 
          href={`nmap://search?query=${encodeURIComponent(contact.address)}`} 
          aria-label="지도 보기"
          onClick={(e) => e.stopPropagation()}
        >
          🗺
        </a>
      </div>
    </article>
  );
};

export default ContactCard;