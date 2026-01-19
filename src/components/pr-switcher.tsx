"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, GitPullRequest, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * PRSwitcher - Sprint 8 Story
 *
 * Dropdown component for quick PR navigation within a repository:
 * - Shows current PR with number and title
 * - Dropdown lists all PRs in the repo
 * - Highlights current PR with checkmark
 * - Groups by state (open/closed)
 */

interface PROption {
  number: number;
  title: string;
  state: 'open' | 'closed';
  user: {
    login: string;
    avatar_url: string;
  };
}

interface PRSwitcherProps {
  owner: string;
  repo: string;
  currentPRNumber: number;
  pullRequests: PROption[];
  className?: string;
}

export function PRSwitcher({
  owner,
  repo,
  currentPRNumber,
  pullRequests,
  className = '',
}: PRSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentPR = pullRequests.find((pr) => pr.number === currentPRNumber);
  const openPRs = pullRequests.filter((pr) => pr.state === 'open');
  const closedPRs = pullRequests.filter((pr) => pr.state === 'closed');

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close on escape
  useEffect(() => {
    if (!isOpen) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const handleSelect = (prNumber: number) => {
    if (prNumber !== currentPRNumber) {
      router.push(`/repositories/${owner}/${repo}/pull/${prNumber}`);
    }
    setIsOpen(false);
  };

  if (pullRequests.length <= 1) {
    // No need for switcher if only one PR
    return null;
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border bg-card',
          'hover:bg-accent transition-colors text-sm',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <GitPullRequest className="h-4 w-4 text-green-600" />
        <span className="font-medium">#{currentPRNumber}</span>
        <span className="text-muted-foreground max-w-[200px] truncate">
          {currentPR?.title}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute top-full left-0 mt-1 w-80 max-h-96 overflow-auto',
            'rounded-lg border bg-card shadow-lg z-50'
          )}
          role="listbox"
        >
          {/* Open PRs */}
          {openPRs.length > 0 && (
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Open ({openPRs.length})
              </div>
              {openPRs.map((pr) => (
                <PROption
                  key={pr.number}
                  pr={pr}
                  isSelected={pr.number === currentPRNumber}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {/* Divider */}
          {openPRs.length > 0 && closedPRs.length > 0 && (
            <div className="border-t my-1" />
          )}

          {/* Closed PRs */}
          {closedPRs.length > 0 && (
            <div className="p-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Closed ({closedPRs.length})
              </div>
              {closedPRs.map((pr) => (
                <PROption
                  key={pr.number}
                  pr={pr}
                  isSelected={pr.number === currentPRNumber}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PROptionProps {
  pr: PROption;
  isSelected: boolean;
  onSelect: (number: number) => void;
}

function PROption({ pr, isSelected, onSelect }: PROptionProps) {
  return (
    <button
      onClick={() => onSelect(pr.number)}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-2 rounded-md text-left',
        'hover:bg-accent transition-colors',
        isSelected && 'bg-accent'
      )}
      role="option"
      aria-selected={isSelected}
    >
      <GitPullRequest
        className={cn(
          'h-4 w-4 flex-shrink-0',
          pr.state === 'open' ? 'text-green-600' : 'text-purple-600'
        )}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">#{pr.number}</span>
          <span className="text-sm text-muted-foreground truncate">
            {pr.title}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          @{pr.user.login}
        </div>
      </div>
      {isSelected && (
        <Check className="h-4 w-4 text-primary flex-shrink-0" />
      )}
    </button>
  );
}
