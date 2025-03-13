import React from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';

interface DonationPopupProps {
  onClose: () => void;
}

export function DonationPopup({ onClose }: DonationPopupProps): JSX.Element {
  const donationAmounts = [20, 50, 100];

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.popup}>
        <button 
          className={styles.closeButton}
          onClick={onClose}
        >
          ×
        </button>
        <h2 className={styles.title}>Support This Ministry</h2>
        <p className={styles.subtitle}>
          "Every good gift and every perfect gift is from above, coming down from the Father of lights" — James 1:17
        </p>
        <div className={styles.donationButtons}>
          {donationAmounts.map((amount) => (
            <button 
              key={amount} 
              className={styles.donationButton}
            >
              ${amount}
            </button>
          ))}
          <div className={styles.customDonationWrapper}>
            <span className={styles.customDonationPrefix}>$</span>
            <input
              type="number"
              placeholder="Custom amount"
              className={styles.customDonation}
              min="1"
              step="1"
            />
          </div>
        </div>
        <button className={styles.contributeButton}>
          Contribute
        </button>
      </div>
    </>
  );
}

// Export a function to control the popup from anywhere
export const openDonationPopup = () => {
  // Create a custom event
  const event = new CustomEvent('openDonationPopup');
  document.dispatchEvent(event);
}; 