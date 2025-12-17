import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface Token {
  name: string;
  category: string;
  description: string;
  example: string;
}

interface TokenInsertButtonProps {
  onTokenSelect: (token: string) => void;
  tokenLibrary: { [category: string]: Token[] };
}

export default function TokenInsertButton({ onTokenSelect, tokenLibrary }: TokenInsertButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTokenClick = (token: string) => {
    onTokenSelect(token);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
      >
        Insert Token
        <ChevronDown size={14} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {Object.entries(tokenLibrary).map(([category, tokens]) => (
            <div key={category} className="border-b border-gray-100 last:border-b-0">
              <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-700 uppercase">
                {category}
              </div>
              <div className="p-2">
                {tokens.map((token) => (
                  <button
                    key={token.name}
                    type="button"
                    onClick={() => handleTokenClick(token.name)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded mb-1"
                    title={token.description}
                  >
                    <code className="text-blue-600 font-mono text-xs">{token.example}</code>
                    <p className="text-xs text-gray-500 mt-0.5">{token.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}







