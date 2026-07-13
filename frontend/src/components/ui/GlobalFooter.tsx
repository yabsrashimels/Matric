import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Facebook,
    Instagram,
    Linkedin,
    Github,
    Send,
    Mail,
    Phone,
    Clock,
    ArrowRight,
} from 'lucide-react';

export const GlobalFooter: React.FC = () => {
    const navigate = useNavigate();

    const handleNavigate = (path: string) => {
        navigate(path);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleNewsletterSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        alert('Thank you for subscribing to the Ethio Matric Prep updates.');
    };

    return (
        <footer className="enhanced-site-footer">
            <div className="footer-top-grid">
                <div className="footer-col about-col">
                    <div className="brand-section footer-brand-row">
                        <div className="brand-logo">
                            <div className="brand-logo-inner">
                                <span style={{ fontSize: '0.8rem' }}>🇪🇹</span>
                            </div>
                        </div>
                        <span className="brand-name">Ethio Matric Prep</span>
                    </div>
                    <p className="footer-about-text">
                        A modern study companion for Ethiopian Grade 12 learners, combining syllabus-aligned lessons, mock exams, progress insights, and practical revision tools in one polished experience.
                    </p>
                    <div className="social-links-row">
                        <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-icon-btn facebook" aria-label="Facebook"><Facebook size={18} /></a>
                        <a href="https://telegram.org" target="_blank" rel="noreferrer" className="social-icon-btn telegram" aria-label="Telegram"><Send size={18} /></a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-icon-btn instagram" aria-label="Instagram"><Instagram size={18} /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-icon-btn linkedin" aria-label="LinkedIn"><Linkedin size={18} /></a>
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="social-icon-btn github" aria-label="GitHub"><Github size={18} /></a>
                    </div>
                </div>

                <div className="footer-col links-col">
                    <h4>Quick Links</h4>
                    <ul className="footer-links-list">
                        <li><button type="button" onClick={() => handleNavigate('/')}>Home</button></li>
                        <li><button type="button" onClick={() => handleNavigate('/subjects')}>Subjects</button></li>
                        <li><button type="button" onClick={() => handleNavigate('/mock-exams')}>Mock Exams</button></li>
                        <li><button type="button" onClick={() => handleNavigate('/progress')}>Dashboard</button></li>
                        <li><button type="button" onClick={() => handleNavigate('/planner')}>Study Planner</button></li>
                        <li><button type="button" onClick={() => handleNavigate('/settings')}>System Settings</button></li>
                    </ul>
                </div>

                <div className="footer-col contact-col">
                    <h4>Contact Support</h4>
                    <ul className="footer-contact-list">
                        <li>
                            <Mail size={16} className="contact-icon" />
                            <a href="mailto:support@ethiomatricprep.com">support@ethiomatricprep.com</a>
                        </li>
                        <li>
                            <Phone size={16} className="contact-icon" />
                            <a href="tel:+251955123456">+251 955 123 456</a>
                        </li>
                        <li>
                            <Clock size={16} className="contact-icon" />
                            <span>Mon - Sat, 8:00 AM - 6:00 PM</span>
                        </li>
                    </ul>
                </div>

                <div className="footer-col newsletter-col">
                    <h4>Stay Updated</h4>
                    <p>Receive notifications for syllabus updates, exams, and study notes directly in your inbox.</p>
                    <form onSubmit={handleNewsletterSubmit} className="newsletter-form">
                        <input
                            type="email"
                            placeholder="Enter email address"
                            required
                            className="newsletter-input"
                            aria-label="Email address for newsletter"
                        />
                        <button type="submit" className="btn btn-primary newsletter-submit-btn">
                            Subscribe <ArrowRight size={16} />
                        </button>
                    </form>
                </div>
            </div>

            <div className="animated-divider">
                <div className="divider-glow-line" />
            </div>

            <div className="footer-bottom-row">
                <p className="copyright-text">
                    © {new Date().getFullYear()} Ethio Matric Prep. Crafted for Ethiopia’s Grade 12 national curriculum.
                </p>
                <div className="footer-policy-links">
                    <button type="button" onClick={() => handleNavigate('/settings')}>Privacy Policy</button>
                    <span className="bullet-dot">•</span>
                    <button type="button" onClick={() => handleNavigate('/settings')}>Terms</button>
                    <span className="bullet-dot">•</span>
                    <span className="syllabus-stamp">Syllabus v1.2</span>
                </div>
            </div>
        </footer>
    );
};

export default GlobalFooter;
