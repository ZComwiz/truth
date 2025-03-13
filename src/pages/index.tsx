import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { VersionedBook } from '@site/src/components/VersionedBook';
import styles from '@site/src/pages/index.module.css';
import { useVersionContent } from '@site/src/utils/contentLoader';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      cacheTime: Infinity,
    },
  },
});

function DownloadSection() {
  return (
    <section className={styles.downloadSection}>
      <div className={styles.container}>
        <h2 className={styles.sectionTitle}>Books for the Greater Glory of God</h2>
        <p className={styles.sectionSubtitle}>
          Free resources to deepen your understanding of Truth and Faith
        </p>
        <VersionedBook id="god-is-real" />
      </div>
    </section>
  );
}

function EmailSection() {
  return (
    <section className={clsx('section', styles.emailSection)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Join Our Faith Journey
        </Heading>
        <p className={styles.sectionSubtitle}>
          Receive updates on new spiritual resources and Catholic teachings
        </p>
        <div className={styles.emailContainer}>
          <form className={styles.emailForm}>
            <input
              type="email"
              placeholder="Your email address"
              className={styles.emailInput}
              required
            />
            <button type="submit" className={styles.subscribeButton}>
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function DonationSection() {
  const donationAmounts = [20, 50, 100];
  return (
    <section className={clsx('section', styles.donationSection)}>
      <div className="container">
        <Heading as="h2" className={styles.sectionTitle}>
          Support This Ministry
        </Heading>
        <p className={styles.sectionSubtitle}>
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
      </div>
    </section>
  );
}

export default function Home(): JSX.Element {
  const {siteConfig} = useDocusaurusContext();
  
  return (
    <QueryClientProvider client={queryClient}>
      <Layout
        title={siteConfig.title}
        description="Exploring Divine Truth through Philosophy and Faith">
        <main>
          <DownloadSection />
          <EmailSection />
          <DonationSection />
        </main>
      </Layout>
    </QueryClientProvider>
  );
}
