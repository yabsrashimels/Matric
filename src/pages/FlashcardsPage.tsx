import React, { useState } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

interface Flashcard {
  id: number;
  subject: string;
  front: string;
  back: string;
}

const FLASHCARDS: Flashcard[] = [
  { id: 1, subject: 'Mathematics', front: 'What is the Derivative of e^(3x)?', back: '3 * e^(3x) (Using the chain rule: d/dx[e^u] = e^u * du/dx)' },
  { id: 2, subject: 'Physics', front: 'What is the formula for escape velocity from Earth?', back: 'v_e = √(2GM / R), where G is gravitational constant, M is Earth\'s mass, and R is Earth\'s radius' },
  { id: 3, subject: 'Chemistry', front: 'State the rate law of a first-order reaction.', back: 'Rate = k[A]^1. The concentration of reactant is raised to the first power.' },
  { id: 4, subject: 'Biology', front: 'Where does the Glycolysis step of Cellular Respiration take place?', back: 'In the Cytoplasm. (Unlike the Krebs cycle and ETC, which occur in the mitochondria)' },
  { id: 5, subject: 'English', front: 'What is the correct preposition that pairs with the word "accused"?', back: 'accused OF (e.g., "He was accused of stealing the documents")' },
  { id: 6, subject: 'History', front: 'Who was the Emperor of Ethiopia during the Battle of Adwa in 1896?', back: 'Emperor Menelik II (along with Empress Taytu Betul)' },
  { id: 7, subject: 'Geography', front: 'What traditional climate zone represents hot dry lowlands in Ethiopia?', back: 'Kolla (Tropical zone, altitude: 500m to 1500m above sea level)' },
  { id: 8, subject: 'Civics', front: 'What are the two major divisions of rights in the FDRE constitution?', back: 'Human Rights (Articles 14-28) and Democratic Rights (Articles 29-44)' },
  { id: 9, subject: 'Economics', front: 'Define Stagflation in Macroeconomics.', back: 'A state where inflation is high, economic growth rates are slow, and unemployment remains steadily high.' }
];

export const FlashcardsPage: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev === FLASHCARDS.length - 1 ? 0 : prev + 1));
    }, 150); // wait for flip state to reset
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex(prev => (prev === 0 ? FLASHCARDS.length - 1 : prev - 1));
    }, 150);
  };

  const currentCard = FLASHCARDS[currentIndex];

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">Active Recall Flashcards</h1>
        <p className="subtitle-main">
          Reinforce key curriculum definitions, historical timelines, prepositions, and equations. Click any card below to flip and inspect the solution.
        </p>
      </div>

      <div className="flashcards-container">
        <div 
          className={`flashcard-wrapper ${isFlipped ? 'flipped' : ''}`}
          onClick={handleFlip}
          id={`flashcard-card-${currentCard.id}`}
        >
          <div className="flashcard-inner">
            {/* Front Card Face */}
            <div className="flashcard-front">
              <span className="flashcard-tag">{currentCard.subject}</span>
              <p className="flashcard-text">{currentCard.front}</p>
              <span className="flashcard-instruction">👉 Click to flip & reveal answer</span>
            </div>

            {/* Back Card Face */}
            <div className="flashcard-back">
              <span className="flashcard-tag">{currentCard.subject}</span>
              <p className="flashcard-text" style={{ fontSize: '1.05rem' }}>{currentCard.back}</p>
              <span className="flashcard-instruction">Click again to flip back</span>
            </div>
          </div>
        </div>

        {/* Navigation row */}
        <div className="flashcards-nav">
          <button className="btn btn-secondary" onClick={handlePrev} style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0 }}>
            <ChevronLeft size={24} />
          </button>
          
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--text-secondary)' }}>
            Card {currentIndex + 1} of {FLASHCARDS.length}
          </span>

          <button className="btn className=btn-secondary" onClick={handleNext} style={{ borderRadius: '50%', width: '48px', height: '48px', padding: 0, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', cursor: 'pointer' }}>
            <ChevronRight size={24} />
          </button>
        </div>

        <button 
          className="btn btn-secondary" 
          onClick={() => { setIsFlipped(false); setCurrentIndex(0); }}
          style={{ gap: '0.5rem', fontSize: '0.85rem', marginTop: '1rem' }}
        >
          <RefreshCw size={14} /> Restart Flashcard Deck
        </button>
      </div>
    </div>
  );
};
