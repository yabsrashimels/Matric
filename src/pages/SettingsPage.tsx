import React from 'react';
import { useApp } from '../context/AppContext';
import { Volume2, VolumeX, Moon, Sun, RotateCcw, ShieldCheck, Milestone } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme, soundOn, toggleSound, resetProgress, progress } = useApp();

  return (
    <div>
      <div style={{ marginBottom: '2.5rem' }}>
        <h1 className="title-main">System Settings</h1>
        <p className="subtitle-main">
          Configure visual themes, toggle sound synthesis, or manage local storage configurations.
        </p>
      </div>

      <div className="card" style={{ maxWidth: '650px', margin: '0 auto' }}>
        <div className="settings-section">
          
          {/* Theme Toggle row */}
          <div className="settings-row" id="setting-row-theme">
            <div className="settings-info">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {theme === 'dark' ? <Moon size={18} style={{ color: 'var(--ethio-yellow)' }} /> : <Sun size={18} style={{ color: '#eab308' }} />}
                Color Theme
              </h4>
              <p>Toggle between Light mode and Dark mode layouts.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={theme === 'dark'} 
                onChange={toggleTheme}
                id="theme-switch-checkbox"
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Sound Toggle row */}
          <div className="settings-row" id="setting-row-sounds">
            <div className="settings-info">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {soundOn ? <Volume2 size={18} style={{ color: 'var(--ethio-green)' }} /> : <VolumeX size={18} />}
                Synthesized Sounds
              </h4>
              <p>Toggle offline tone feedback on correct and incorrect answers.</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={soundOn} 
                onChange={toggleSound}
                id="sound-switch-checkbox"
              />
              <span className="slider"></span>
            </label>
          </div>

          {/* Stored Data Summary */}
          <div className="settings-row" style={{ borderBottom: 'none' }}>
            <div className="settings-info">
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={18} style={{ color: 'var(--ethio-green)' }} /> Stored State Summary
              </h4>
              <p>Information about local data caches saved on this browser.</p>
              
              <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', backgroundColor: 'var(--bg-primary)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem' }}>
                <div><strong>Level:</strong> {progress.level}</div>
                <div><strong>Total XP:</strong> {progress.xp}</div>
                <div><strong>Completed:</strong> {progress.completedQuestionIds.length} questions</div>
                <div><strong>Bookmarks:</strong> {progress.favorites.length} saved</div>
                <div><strong>Custom Notes:</strong> {Object.keys(progress.notes).length} pages</div>
                <div><strong>Badges Locked:</strong> {6 - progress.unlockedBadges.length} remaining</div>
              </div>
            </div>
          </div>

          {/* Dangerous Reset row */}
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '1rem' }}>
            <h4 style={{ fontWeight: '600', color: 'var(--ethio-red)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <RotateCcw size={18} /> Reset Database
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Warning: Resetting deletes all XP, unlocked achievements, active streaks, notes, bookmarks, and completed metrics from your browser cache. This action is permanent.
            </p>
            <button className="btn btn-accent" onClick={resetProgress} id="reset-progress-btn">
              Clear All Cached Progress
            </button>
          </div>

        </div>
      </div>

      {/* Footer Info */}
      <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
        <p>Ethio Matric Prep is an independent, non-governmental learning portal.</p>
        <p style={{ marginTop: '0.25rem' }}>Addis Ababa, Ethiopia • Platform Version 1.2.0 (Stable)</p>
      </div>
    </div>
  );
};
