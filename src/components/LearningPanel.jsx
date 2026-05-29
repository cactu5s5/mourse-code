import React, { useState } from 'react';
import { arabicMorse, englishMorse, numbersMorse, symbolsMorse } from '../utils/morseDictionary.js';
import audioEngine from './AudioEngine';

export default function LearningPanel({ onTriggerPulse }) {
  const [activeTab, setActiveTab] = useState('arabic');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingChar, setPlayingChar] = useState(null);

  let activeSet = {};
  if (activeTab === 'arabic') {
    activeSet = arabicMorse;
  } else if (activeTab === 'english') {
    activeSet = englishMorse;
  } else {
    activeSet = { ...numbersMorse, ...symbolsMorse };
  }

  // Filter keys
  const filteredEntries = Object.entries(activeSet).filter(([char, morse]) => {
    if (!searchQuery) return true;
    return char.toLowerCase().includes(searchQuery.toLowerCase()) || morse.includes(searchQuery);
  });

  const handleCardClick = (char, morse) => {
    setPlayingChar(char);
    
    // Play Morse Audio and trigger active pulse animation
    audioEngine.playMorse(
      morse,
      (type, durationMs) => {
        if (onTriggerPulse) onTriggerPulse(type, durationMs);
      },
      () => {
        setPlayingChar(null);
      }
    );
  };

  return (
    <div className="learning-panel-card">
      <div className="learning-header">
        <h3 className="panel-title">
          <span className="signal-dot green-blink" /> SIGNAL DECODING REFERENCE DATABASE
        </h3>
        
        <div className="search-wrapper">
          <input 
            type="text" 
            id="morse-search" 
            placeholder="Search characters or morse (e.g. A, ا, .-)..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <span className="search-icon">🔍</span>
        </div>
      </div>

      <div className="tab-selectors">
        <button 
          className={`tab-btn ${activeTab === 'arabic' ? 'active' : ''}`}
          onClick={() => setActiveTab('arabic')}
        >
          Arabic Alphabet (الأبجدية)
        </button>
        <button 
          className={`tab-btn ${activeTab === 'english' ? 'active' : ''}`}
          onClick={() => setActiveTab('english')}
        >
          English Alphabet
        </button>
        <button 
          className={`tab-btn ${activeTab === 'numbers' ? 'active' : ''}`}
          onClick={() => setActiveTab('numbers')}
        >
          Numbers & Symbols
        </button>
      </div>

      <div className="chart-content">
        {filteredEntries.length === 0 ? (
          <div className="no-results">No signals match the query "{searchQuery}"</div>
        ) : (
          filteredEntries.map(([char, morse]) => (
            <div 
              key={char}
              className={`morse-char-card ${playingChar === char ? 'pulse-playing' : ''}`}
              onClick={() => handleCardClick(char, morse)}
            >
              <div className="char-display">{char}</div>
              <div className="morse-code-display">{morse}</div>
              <div className="morse-visual-sequence">
                {morse.split('').map((symbol, idx) => (
                  <span 
                    key={idx} 
                    className={symbol === '.' ? 'morse-symbol-dot' : 'morse-symbol-dash'}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="preview-status-bar">
        <span className="text-muted">ℹ️ Click any character card to transmit signal & hear Morse code.</span>
      </div>
    </div>
  );
}
