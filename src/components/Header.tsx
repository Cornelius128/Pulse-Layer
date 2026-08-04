'use client';

import React from 'react';
import { Activity, ShieldAlert, Server, Search, RefreshCw, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  stats: {
    total_accounts: number;
    avg_trust_score: number;
    last_ledger: string;
    network_tps: string;
    anomalies_count: number;
  } | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onSearchSubmit?: (q: string) => void;
  onRefresh: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  onRefresh,
}) => {
  const { theme, toggleTheme } = useTheme();

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim() && onSearchSubmit) {
      onSearchSubmit(searchQuery.trim());
    }
  };

  return (
    <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-primary)]/90 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Network Indicator */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="PulseLayer Logo"
              className="w-9 h-9 rounded-lg border border-[var(--border-accent)] shadow-md object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-lg font-extrabold tracking-wider text-[var(--text-primary)]">
                  PULSE<span className="text-[var(--accent-electric)]">LAYER</span>
                </span>
                <span className="text-[10px] font-mono-tech uppercase tracking-widest px-1.5 py-0.5 rounded bg-[var(--accent-electric)]/10 text-[var(--accent-electric)] border border-[var(--accent-electric)]/30">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] hidden sm:block">
                Stellar Account Trust Signal Indexer
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[var(--bg-secondary)] border border-[var(--border-subtle)]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-emerald)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--accent-emerald)]"></span>
            </span>
            <span className="text-xs font-mono-tech text-[var(--text-primary)] hidden sm:inline">
              LIVE INDEXING
            </span>
          </div>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleFormSubmit} className="w-full md:w-80 lg:w-96 relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Paste Stellar address (G...) to score wallet..."
            className="w-full pl-10 pr-20 py-2 text-xs font-mono-tech bg-[var(--bg-secondary)] border border-[var(--border-subtle)] focus:border-[var(--accent-electric)] rounded-lg text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none transition-all shadow-inner"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[10px] font-mono-tech font-bold rounded bg-[var(--accent-electric)] text-black hover:brightness-110 transition-all cursor-pointer"
          >
            SCORE
          </button>
        </form>

        {/* Realtime Stats & Prominent Theme Toggle */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {/* Stats Pills (Scrollable on small screens) */}
          <div className="flex items-center gap-2 text-xs font-mono-tech overflow-x-auto pb-1 md:pb-0">
            <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-1.5 whitespace-nowrap">
              <Server className="w-3.5 h-3.5 text-[var(--accent-electric)]" />
              <span className="text-[var(--text-secondary)]">Ledger:</span>
              <span className="text-[var(--text-primary)] font-bold">#{stats?.last_ledger || '57487890'}</span>
            </div>

            <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-1.5 whitespace-nowrap">
              <Activity className="w-3.5 h-3.5 text-[var(--accent-emerald)]" />
              <span className="text-[var(--text-secondary)]">Index:</span>
              <span className="text-[var(--text-primary)] font-bold">{(stats?.total_accounts || 1055).toLocaleString()}</span>
            </div>

            <div className="px-2.5 py-1.5 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] flex items-center gap-1.5 whitespace-nowrap">
              <ShieldAlert className="w-3.5 h-3.5 text-[var(--accent-amber)]" />
              <span className="text-[var(--text-secondary)]">Avg Trust:</span>
              <span className="text-[var(--accent-electric)] font-bold">{stats?.avg_trust_score || '70.5'}/100</span>
            </div>

            <button
              onClick={onRefresh}
              className="p-2 rounded-lg bg-[var(--bg-secondary)] border border-[var(--border-subtle)] hover:border-[var(--accent-electric)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all cursor-pointer shrink-0"
              title="Refresh On-Chain Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Prominent High-Visibility Theme Switcher Pill */}
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono-tech text-xs font-bold transition-all shadow-md shrink-0 cursor-pointer ${
              theme === 'dark'
                ? 'bg-[#121620] border-[#00F0FF]/40 text-white hover:border-[#00F0FF] hover:shadow-[#00F0FF]/20'
                : 'bg-white border-[#0284C7]/40 text-[#0F172A] hover:border-[#0284C7] hover:shadow-[#0284C7]/20'
            }`}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-[#F59E0B] animate-spin-slow" />
                <span className="text-[#F59E0B]">LIGHT MODE</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-[#0284C7]" />
                <span className="text-[#0284C7]">DARK MODE</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
