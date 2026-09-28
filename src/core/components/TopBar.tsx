import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useJourneyStore } from '../../state/journeyStore';
import { TopicRegistry } from '../../topics/registry';

export const TopBar: React.FC = () => {
  const location = useLocation();
  const { topicId } = useJourneyStore();
  const activeTopic = TopicRegistry.getTopic(topicId);

  return (
    <header className="no-print bg-[#FBF8F4]/90 backdrop-blur-md border-b border-[#EDE6DF] sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <Link
          to="/"
          className="font-serif text-2xl font-medium tracking-tight text-[#2B2233] hover:opacity-90 transition-opacity"
        >
          Clara
        </Link>

        {/* Zone 2: 4-6 clean text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#6E6475]">
          <Link
            to="/"
            className={`hover:text-[#2B2233] transition-colors ${
              location.pathname === '/' ? 'text-[#2B2233] font-semibold' : ''
            }`}
          >
            Topics
          </Link>
          <Link
            to={`/journey/${topicId || 'hrt'}`}
            className={`hover:text-[#2B2233] transition-colors ${
              location.pathname.startsWith('/journey')
                ? 'text-[#2B2233] font-semibold'
                : ''
            }`}
          >
            Decision Guide
          </Link>
          <Link
            to="/history"
            className={`hover:text-[#2B2233] transition-colors ${
              location.pathname === '/history' ? 'text-[#2B2233] font-semibold' : ''
            }`}
          >
            My Decisions
          </Link>
        </nav>

        {/* Zone 3: 1-2 primary actions */}
        <div className="flex items-center gap-3">
          <Link
            to={`/journey/${topicId || 'hrt'}`}
            className="px-4 py-2 text-xs font-medium text-white bg-gradient-to-r from-[#E07A6B] to-[#F2A76B] rounded-xl hover:brightness-105 active:scale-98 transition-all shadow-xs whitespace-nowrap"
          >
            {activeTopic ? activeTopic.name.split(' ')[0] : 'Explore'} Guide
          </Link>
        </div>
      </div>
    </header>
  );
};
