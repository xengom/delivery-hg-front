import React from 'react';
import { Contact } from '../../types';

interface ContactCardProps {
  contact: Contact;
  onSelect: (contact: Contact) => void;
}

const ContactCard: React.FC<ContactCardProps> = ({ contact, onSelect }) => {
  return (
    <article className="card" onClick={() => onSelect(contact)}>
      <div>
        <h3>{contact.businessName}</h3>
        {contact.phones && contact.phones.length > 0 ? (
          contact.phones.map((phone, index) => (
            <p key={index}>{phone}</p>
          ))
        ) : (
          <p>전화번호 없음</p>
        )}
        <p>{contact.address}</p>
        {contact.note && <p className="note">{contact.note}</p>}
      </div>
      <div className="act">
        {contact.phones && contact.phones.length > 0 && (
          <a href={`sms:${contact.phones[0]}`} aria-label="SMS 보내기" onClick={(e) => e.stopPropagation()}>📧</a>
        )}
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
