
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI } from '@google/genai';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';

import { Artifact, Session } from './types';
import { INITIAL_PLACEHOLDERS, PORTFOLIO_DATA, CAREER_DATA, PRODUCTS, ProductInfo } from './constants';
import { generateId } from './utils';

import DottedGlowBackground from './components/DottedGlowBackground';
import NeuralMesh from './components/NeuralMesh';
import ArtifactCard from './components/ArtifactCard';
import SideDrawer from './components/SideDrawer';
import pwIcon from './img/pw_icon.png';
import rfLogo from './img/RF_logo.png';
import { 
    ThinkingIcon, 
    SparklesIcon, 
    ArrowUpIcon,
    CodeIcon,
    GridIcon
} from './components/Icons';

function App() {
  const [view, setView] = useState<'home' | 'about' | 'lab'>('home');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionIndex, setCurrentSessionIndex] = useState<number>(-1);
  const [focusedArtifactIndex, setFocusedArtifactIndex] = useState<number | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<ProductInfo | null>(null);
  
  const [inputValue, setInputValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  
  // Lab Specific Controls
  const [labConfig, setLabConfig] = useState({
      framework: 'CBT (Cognitive Behavioral)',
      persona: 'Adult General',
      aesthetic: 'Calm & Minimal'
  });

  const [drawerState, setDrawerState] = useState<{
      isOpen: boolean;
      mode: 'code' | null;
      title: string;
      data: any; 
  }>({ isOpen: false, mode: null, title: '', data: null });

  const inputRef = useRef<HTMLInputElement>(null);
  const portfolioTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      const interval = setInterval(() => {
          setPlaceholderIndex(prev => (prev + 1) % INITIAL_PLACEHOLDERS.length);
      }, 3000);
      return () => clearInterval(interval);
  }, []);

  // Portfolio scroll control
  useEffect(() => {
      const trackWrapper = portfolioTrackRef.current?.parentElement;
      if (!trackWrapper) return;

      let scrollTimeout: NodeJS.Timeout;
      const handleScroll = () => {
          const track = portfolioTrackRef.current;
          if (!track) return;
          
          // Stop animation when user scrolls
          track.style.animationPlayState = 'paused';
          
          // Resume animation after scroll stops
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
              if (track) {
                  track.style.animationPlayState = 'running';
              }
          }, 1500);
      };

      trackWrapper.addEventListener('scroll', handleScroll);
      trackWrapper.addEventListener('wheel', handleScroll);

      return () => {
          trackWrapper.removeEventListener('scroll', handleScroll);
          trackWrapper.removeEventListener('wheel', handleScroll);
          clearTimeout(scrollTimeout);
      };
  }, []);

  const handleSendMessage = useCallback(async (manualPrompt?: string) => {
    const promptToUse = manualPrompt || inputValue;
    const trimmedInput = promptToUse.trim();
    
    if (!trimmedInput || isLoading) return;
    if (!manualPrompt) setInputValue('');

    setIsLoading(true);
    const sessionId = generateId();

    const placeholderArtifacts: Artifact[] = Array(2).fill(null).map((_, i) => ({
        id: `${sessionId}_${i}`,
        styleName: i === 0 ? 'Primary Concept' : 'Alternative Approach',
        html: '',
        status: 'streaming',
    }));

    const newSession: Session = {
        id: sessionId,
        prompt: trimmedInput,
        timestamp: Date.now(),
        artifacts: placeholderArtifacts
    };

    setSessions(prev => [...prev, newSession]);
    setCurrentSessionIndex(sessions.length); 

    try {
        const apiKey = process.env.API_KEY;
        const ai = new GoogleGenAI({ apiKey });

        const generateArtifact = async (artifact: Artifact, variant: string) => {
            const systemPrompt = `You are a world-class Digital Therapeutics (DTx) UI/UX Designer. 
            Framework: ${labConfig.framework}. Persona: ${labConfig.persona}. Aesthetic: ${labConfig.aesthetic}.
            Create a high-fidelity healthcare UI component for: "${trimmedInput}". 
            Variant focus: ${variant}.
            Use Tailwind-like CSS classes. Return RAW HTML ONLY with embedded CSS in <style> tags. 
            Ensure accessibility (ARIA) and therapeutic color palettes (Teals, Lavenders, Soft Greys).`;

            const responseStream = await ai.models.generateContentStream({
                model: 'gemini-3-flash-preview',
                contents: [{ parts: [{ text: systemPrompt }], role: "user" }],
            });

            let accumulatedHtml = '';
            for await (const chunk of responseStream) {
                accumulatedHtml += chunk.text;
                setSessions(prev => prev.map(sess => sess.id === sessionId ? {
                    ...sess, artifacts: sess.artifacts.map(art => art.id === artifact.id ? { ...art, html: accumulatedHtml } : art)
                } : sess));
            }
            
            let finalHtml = accumulatedHtml.replace(/```html|```/g, '').trim();
            setSessions(prev => prev.map(sess => sess.id === sessionId ? {
                ...sess, artifacts: sess.artifacts.map(art => art.id === artifact.id ? { ...art, html: finalHtml, status: 'complete' } : art)
            } : sess));
        };

        await Promise.all([
            generateArtifact(placeholderArtifacts[0], "Standard Therapeutic Path"),
            generateArtifact(placeholderArtifacts[1], "Minimalist High-Accessibility Path")
        ]);

    } catch (e) {
        console.error(e);
    } finally {
        setIsLoading(false);
    }
  }, [inputValue, isLoading, sessions.length, labConfig]);

  const switchView = (newView: 'home' | 'about' | 'lab') => {
      setView(newView);
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
        <nav className="atflow-nav">
            <div className="nav-logo" onClick={() => switchView('home')}>atflow</div>
            <div className="nav-links">
                <a href="#" onClick={(e) => { e.preventDefault(); switchView('about'); }} className={view === 'about' ? 'active' : ''}>About</a>
                <a href="#products" onClick={() => switchView('home')}>Products</a>
                <a href="#portfolio" onClick={() => switchView('home')}>Portfolio</a>
                <a href="#careers" onClick={() => switchView('home')}>Careers</a>
               
            </div>
        </nav>

        {/* Product Detail Modal */}
        {selectedProduct && (
            <div className="product-modal-overlay" onClick={() => setSelectedProduct(null)}>
                <div className="product-modal-content" onClick={e => e.stopPropagation()}>
                    <button className="modal-close-btn" onClick={() => setSelectedProduct(null)}>&times;</button>
                    <div className="modal-inner">
                        <div className="modal-header-info">
                            <div 
                                className="modal-app-icon"
                                style={
                                    selectedProduct.id === 'purple-whale' || selectedProduct.id === 'research-flow'
                                        ? undefined
                                        : { background: selectedProduct.iconColor }
                                }
                            >
                                {selectedProduct.id === 'purple-whale' && (
                                    <img src={pwIcon} alt="Purple Whale icon" className="product-icon-image" />
                                )}
                                {selectedProduct.id === 'research-flow' && (
                                    <img src={rfLogo} alt="Research Flow logo" className="product-icon-image" />
                                )}
                                {selectedProduct.id !== 'purple-whale' && selectedProduct.id !== 'research-flow' && selectedProduct.title[0]}
                            </div>
                            <div className="modal-title-area">
                                <h2>{selectedProduct.title}</h2>
                                <div className="product-tags">
                                    {selectedProduct.tags.map(t => <span key={t} className="tag">{t}</span>)}
                                </div>
                            </div>
                        </div>
                        <div className="modal-body-layout">
                            <div className="modal-desc-section">
                                <p className="long-desc">{selectedProduct.longDesc}</p>
                                <div className="store-links">
                                    <a href={selectedProduct.appStoreLink} className="store-btn app-store">App Store</a>
                                    {selectedProduct.playStoreLink && (
                                        <a href={selectedProduct.playStoreLink} className="store-btn play-store">Play Store</a>
                                    )}
                                    {selectedProduct.id === 'design-lab' && (
                                        <button className="store-btn lab-btn" onClick={() => { setSelectedProduct(null); switchView('lab'); }}>Open Lab</button>
                                    )}
                                </div>
                            </div>
                            <div className="modal-screenshots">
                                {selectedProduct.screenshots.map((s, i) => (
                                    <img key={i} src={s} alt={`${selectedProduct.title} screenshot ${i+1}`} className="screenshot-img" />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <main className="immersive-app">
            <DottedGlowBackground 
                gap={30} radius={1.2} 
                color="rgba(168, 85, 247, 0.05)" 
                glowColor="rgba(45, 212, 191, 0.2)" 
                speedScale={0.1} 
            />

            {view === 'home' && (
                <div className="home-view">
                    <section className="section-container hero-section">
                         <NeuralMesh />
                         <div className="atflow-hero">
                             <h1>Technology with a Heartbeat.</h1>
                             <p>Where human empathy meets AI to create a vibrant life found in positive flow.</p>
                             <button className="design-lab-trigger" onClick={() => switchView('about')}>
                                 <span className="sparkle-icon-wrapper"><SparklesIcon /></span>
                              Discover atflow
                             </button>
                         </div>
                    </section>

                    <section id="products" className="section-container">
                        <h2 className="section-title">Our Solutions</h2>
                        <p className="section-subtitle">Specialized platforms designed for mental care and healthcare research.</p>
                        <div className="product-grid">
                             {PRODUCTS.map((product) => (
                             <div key={product.id} className="product-card" onClick={() => setSelectedProduct(product)}>
                                    <div 
                                        className="product-icon-placeholder"
                                        style={
                                            product.id === 'purple-whale' || product.id === 'research-flow'
                                                ? undefined
                                                : { background: product.iconColor }
                                        }
                                    >
                                        {product.id === 'purple-whale' && (
                                            <img src={pwIcon} alt="Purple Whale icon" className="product-icon-image" />
                                        )}
                                        {product.id === 'research-flow' && (
                                            <img src={rfLogo} alt="Research Flow logo" className="product-icon-image" />
                                        )}
                                        {product.id !== 'purple-whale' && product.id !== 'research-flow' && product.title[0]}
                                    </div>
                                    <div className="product-card-body">
                                        <h3>{product.title}</h3>
                                        <p>{product.shortDesc}</p>
                                        <div className="product-tags">
                                            {product.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                        </div>
                                    </div>
                                    <div className="card-arrow">→</div>
                                </div>
                             ))}
                        </div>
                    </section>

                    <section id="portfolio" className="portfolio-section">
                        <div className="section-container">
                            <h2 className="section-title">Portfolio</h2>
                            <p className="section-subtitle">Co-working with industry leaders to deliver professional healthcare solutions.</p>
                        </div>
                        <div className="portfolio-track-wrapper">
                            <div className="portfolio-track" ref={portfolioTrackRef}>
                                {[...PORTFOLIO_DATA, ...PORTFOLIO_DATA, ...PORTFOLIO_DATA].map((item, idx) => (
                                    <div key={idx} className="portfolio-card">
                                        <span className="client-name">{item.client}</span>
                                        <h3>{item.title}</h3>
                                        <p className="card-description">{item.description}</p>
                                        <div className="product-tags">
                                            {item.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section id="careers" className="section-container">
                        <h2 className="section-title">Careers</h2>
                        <div className="career-unified-section glass-panel highlight-border">
                            <div className="career-culture">
                                <h3 className="culture-headline">Work with Heart, Live with Flow.</h3>
                                <p className="culture-text">
                                    Working in digital healthcare is about creating impact, not just doing a job. We believe that to bring wellness to the world, our team must be well first.
                                </p>
                                <ul className="benefit-bullets">
                                    <li>Remote work & Satellite offices</li>
                                    <li>Family-friendly schedules</li>
                                    <li>Selective working hours & Open engagement</li>
                                </ul>
                            </div>
                            <div className="career-roles-group">
                                <div className="career-list">
                                    {CAREER_DATA.map((job, idx) => (
                                        <div key={idx} className="career-item" onClick={() => window.open('https://airtable.com/appHfkk8lRDCVOosh/pag2uMlTkFfuRKEJV/form', '_blank')}>
                                            <div className="role-info">
                                                <h4>{job.role}</h4>
                                                <p>{job.type} • {job.location}</p>
                                            </div>
                                            <div className="role-arrow">→</div>
                                        </div>
                                    ))}
                                </div>
                                <button className="register-button" onClick={() => window.open('https://airtable.com/appHfkk8lRDCVOosh/pag2uMlTkFfuRKEJV/form', '_blank')}>
                                    Join our Talent Pool
                                </button>
                            </div>
                        </div>
                    </section>

                    <section id="contact" className="section-container">
                        <h2 className="section-title">Contact Us</h2>
                        <div className="contact-grid">
                            <div className="contact-info">
                                <div className="contact-item">
                                    <h4>Email</h4>
                                    <p>contact@atflow.kr</p>
                                </div>
                                <div className="contact-item">
                                    <h4>Office</h4>
                                    <p>Suite 227, 38 Achasan-ro, Seongdong-gu, Seoul, Republic of Korea <a href="https://maps.app.goo.gl/ng3VzD6HX1Ft4Qih7" target="_blank" rel="noopener noreferrer">[Google Maps]</a> <a href="https://naver.me/FsRVeSwM" target="_blank" rel="noopener noreferrer">[Naver Maps]</a> </p>  
                                </div>
                                <div className="contact-item">
                                    <h4>Partnerships</h4>
                                    <p>We collaborate across the entire healthcare ecosystem—from clinical research with hospitals to service expansion with health-tech enterprises.</p>
                                </div>
                            </div>
                            <div className="contact-form glass-panel highlight-border">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input type="text" placeholder="Your name" />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input type="email" placeholder="email@example.com" />
                                </div>
                                <div className="form-group">
                                    <label>Message</label>
                                    <textarea placeholder="How can we help?" rows={4}></textarea>
                                </div>
                                <button className="submit-btn" onClick={() => alert('Message sent!')}>
                                    Send Message
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {view === 'about' && (
                <div className="about-page">
                    <section className="section-container hero-section" style={{minHeight: '50vh'}}>
                         <NeuralMesh />
                         <div className="atflow-hero">
                             <h1 style={{fontSize: 'clamp(2.5rem, 8vw, 5rem)'}}>About atflow</h1>
                             <p style={{fontSize: '1.2rem', maxWidth: '800px', margin: '0 auto'}}>Bridging technology and care through digital innovation.</p>
                         </div>
                    </section>

                    <section className="section-container about-content-grid">
                        <div className="about-card glass-panel highlight-border">
                            <h3>Our Journey</h3>
                            <p>Since October 2020, AtFlow has been bridging technology and care. As a strategic partner to leading academic hospitals, global pharmaceutical companies, and diverse digital health enterprises, we drive innovation across critical milestones in the healthcare ecosystem.</p>
                        </div>
                        <div className="about-card glass-panel">
                            <h3>Built by Industry Veterans</h3>
                            <p>We are grounded in deep expertise. Our core team consists of senior Product Strategists, Engineers, and UX Designers, each bringing 15 to 20 years of experience from the top-tier software industry. We apply this world-class technical mastery to build safer, more effective healthcare solutions together with our partners.</p>
                        </div>
                    </section>

                    <section className="section-container milestones-section">
                        <h2 className="section-title">Our Credentials</h2>
                        <div className="milestone-grid">
                            <div className="milestone-item glass-panel">
                                <span className="year-badge">2025</span>
                                <h4>Corporate R&D Center</h4>
                                <p>Established dedicated research wing for DTx innovation.</p>
                            </div>
                            <div className="milestone-item glass-panel">
                                <span className="year-badge">2022</span>
                                <h4>Certified Venture Enterprise</h4>
                                <p>Recognized for technical excellence and growth potential.</p>
                            </div>
                            <div className="milestone-item glass-panel">
                                <span className="year-badge">2021</span>
                                <h4>Women-Owned Business</h4>
                                <p>Certified as a leader in healthcare technology diversity.</p>
                            </div>
                        </div>
                    </section>

                    <section className="section-container">
                         <div className="cta-box glass-panel highlight-border" style={{textAlign: 'center', padding: '60px', borderRadius: '40px'}}>
                             <h2> Let’s Create the Next Flow Together.</h2>
                             <p style={{marginBottom: '32px', color: 'var(--text-secondary)'}}>Join us in shaping the future of Digital Therapeutics.</p>
                             <div style={{display: 'flex', gap: '16px', justifyContent: 'center'}}>
                              
                                <button 
                                    className="design-lab-trigger" 
                                    style={{background: 'rgba(255,255,255,0.05)', borderColor: 'var(--border-color)'}} 
                                    onClick={() => window.open('https://airtable.com/appYeNgLaaayWONCH/pagZkujpcf7Y00nQg/form', '_blank')}
                                >
                                    Contact Us
                                </button>
                             </div>
                         </div>
                    </section>
                </div>
            )}

            {view === 'lab' && (
                <div className="design-lab-page">
                    <aside className="lab-sidebar glass-panel">
                        <div className="sidebar-header">
                            <h3>Studio Parameters</h3>
                            <p>Define your clinical focus</p>
                        </div>
                        
                        <div className="param-group">
                            <label>Clinical Framework</label>
                            <select 
                                value={labConfig.framework} 
                                onChange={(e) => setLabConfig(prev => ({...prev, framework: e.target.value}))}
                            >
                                <option>CBT (Cognitive Behavioral)</option>
                                <option>ACT (Acceptance & Commitment)</option>
                                <option>DBT (Dialectical Behavioral)</option>
                                <option>Mindfulness & Meditation</option>
                            </select>
                        </div>

                        <div className="param-group">
                            <label>Target Persona</label>
                            <select 
                                value={labConfig.persona} 
                                onChange={(e) => setLabConfig(prev => ({...prev, persona: e.target.value}))}
                            >
                                <option>Adult General</option>
                                <option>Pediatric (Child-friendly)</option>
                                <option>Geriatric (High Accessibility)</option>
                                <option>High-Stress Professional</option>
                            </select>
                        </div>

                        <div className="param-group">
                            <label>Design Aesthetic</label>
                            <select 
                                value={labConfig.aesthetic} 
                                onChange={(e) => setLabConfig(prev => ({...prev, aesthetic: e.target.value}))}
                            >
                                <option>Calm & Minimal</option>
                                <option>Trustworthy & Clinical</option>
                                <option>Vibrant & Energetic</option>
                                <option>Deep Immersion</option>
                            </select>
                        </div>

                        <div className="lab-tips glass-panel">
                            <h4>Pro Tip</h4>
                            <p>Try "Emotion diary with heart-rate visualization" to see how the AI handles biometric data integration.</p>
                        </div>
                    </aside>

                    <div className="lab-workspace">
                        <div className="workspace-header">
                            <div className="status-indicator">
                                <div className={`dot ${isLoading ? 'pulse' : 'active'}`}></div>
                                <span>{isLoading ? 'AI is thinking...' : 'AI Engine Ready'}</span>
                            </div>
                            <div className="lab-tools">
                                <button className="tool-btn"><GridIcon /> Gallery</button>
                                <button className="tool-btn"><CodeIcon /> Export</button>
                            </div>
                        </div>

                        <div className="stage-container">
                            {sessions.length === 0 ? (
                                <div className="lab-empty-state">
                                    <SparklesIcon />
                                    <h2>Start your first Design Flow</h2>
                                    <p>Describe a mental healthcare component and watch the AI create it based on your parameters.</p>
                                    <div className="quick-starts">
                                        {INITIAL_PLACEHOLDERS.slice(0, 3).map(p => (
                                            <button key={p} onClick={() => handleSendMessage(p)}>{p}</button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="artifact-grid scrollable-area">
                                    {sessions.map((session) => (
                                        <div key={session.id} className="session-block">
                                            <div className="session-label">Generation: {session.prompt}</div>
                                            <div className="variants-row">
                                                {session.artifacts.map((artifact) => (
                                                    <ArtifactCard 
                                                        key={artifact.id}
                                                        artifact={artifact}
                                                        isFocused={false}
                                                        onClick={() => {}}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )).reverse()}
                                </div>
                            )}
                        </div>

                        <div className="lab-command-center">
                            <div className="input-wrapper lab-input">
                                <input 
                                    ref={inputRef}
                                    placeholder={INITIAL_PLACEHOLDERS[placeholderIndex]}
                                    type="text" 
                                    value={inputValue} 
                                    onChange={(e) => setInputValue(e.target.value)} 
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} 
                                    disabled={isLoading} 
                                />
                                <button className="send-button" onClick={() => handleSendMessage()} disabled={isLoading}>
                                    {isLoading ? <ThinkingIcon /> : <ArrowUpIcon />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            

            <footer className="atflow-footer">
                &copy; {new Date().getFullYear()} atflow Co., Ltd. All rights reserved.
            </footer>
        </main>
    </>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<React.StrictMode><App /></React.StrictMode>);
}
