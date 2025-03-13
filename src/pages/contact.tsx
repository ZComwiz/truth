import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './contact.module.css';

export default function Contact(): JSX.Element {
  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(false);

    try {
      const form = e.target;
      const formData = new FormData(form);
      
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData).toString(),
      });
      
      setSubmitted(true);
      setFormState({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
    } catch (err) {
      console.error('Form submission error:', err);
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout title="Contact Us" description="Get in touch with AbsoluteTruth.io">
      <div className={styles.contactContainer}>
        <div className={styles.contactHeader}>
          <h1>Contact Us</h1>
          <p>Have questions, suggestions, or want to contribute to our mission? We'd love to hear from you.</p>
        </div>

        {submitted ? (
          <div className={styles.successMessage}>
            <h2>Thank you for your message!</h2>
            <p>We've received your inquiry and will respond as soon as possible.</p>
            <button onClick={() => setSubmitted(false)} className="button button--primary">
              Send another message
            </button>
          </div>
        ) : (
          <form
            name="contact"
            method="POST"
            data-netlify="true"
            className={styles.contactForm}
            onSubmit={handleSubmit}
          >
            {/* Hidden input required for Netlify forms with JavaScript */}
            <input type="hidden" name="form-name" value="contact" />
            
            <div className={styles.formGroup}>
              <label htmlFor="name">Your Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="email">Your Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formState.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formState.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                rows={6}
                value={formState.message}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className={styles.formActions}>
              <button
                type="submit"
                className="button button--primary"
                disabled={submitting}
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
            
            {error && (
              <div className={styles.errorMessage}>
                <p>There was an error submitting your message. Please try again.</p>
              </div>
            )}
          </form>
        )}
      </div>
    </Layout>
  );
} 