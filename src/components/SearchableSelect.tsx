/**
 * @license
 * AgriSense AI - Government-Grade Real-Data Agriculture Platform
 * Lead Architect & Executive Owner: Sai Venkat Akkineni
 * High-Precision Searchable Dropdown / Combobox Component
 * Zero Pills - Next.js / Vercel Enterprise Aesthetic
 */

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string;
  category?: string;
  subtext?: string;
}

interface SearchableSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | SelectOption)[];
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  required?: boolean;
  helperText?: string;
  grouped?: boolean;
  className?: string;
  allowCustomInput?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = 'Select option...',
  searchPlaceholder = 'Search...',
  disabled = false,
  required = false,
  helperText,
  grouped = false,
  className = '',
  allowCustomInput = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Normalize options to SelectOption
  const normalizedOptions: SelectOption[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { label: opt, value: opt };
      }
      return opt;
    });
  }, [options]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchTerm.trim()) return normalizedOptions;
    const term = searchTerm.toLowerCase().trim();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.category && opt.category.toLowerCase().includes(term)) ||
        (opt.subtext && opt.subtext.toLowerCase().includes(term))
    );
  }, [normalizedOptions, searchTerm]);

  // Grouped options if needed
  const groupedOptions = React.useMemo(() => {
    if (!grouped) return null;
    const map = new Map<string, SelectOption[]>();
    for (const opt of filteredOptions) {
      const cat = opt.category || 'General';
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(opt);
    }
    return map;
  }, [filteredOptions, grouped]);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
  };

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : value;

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
        <span>
          {label} {required && <span className="text-red-500">*</span>}
        </span>
        {value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[11px] text-slate-400 hover:text-slate-600 transition font-normal"
          >
            Clear
          </button>
        )}
      </label>

      {/* Trigger Button / Input */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (!disabled && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown')) {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 bg-white border rounded-lg text-xs transition cursor-pointer select-none ${
          disabled
            ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
            : isOpen
            ? 'border-emerald-600 ring-2 ring-emerald-600/20 text-slate-900 shadow-sm'
            : 'border-slate-300 text-slate-900 hover:border-slate-400'
        }`}
      >
        <div className="truncate flex-1 text-left">
          {displayLabel ? (
            <span className="font-medium text-slate-900 truncate block">{displayLabel}</span>
          ) : (
            <span className="text-slate-400 truncate block">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center space-x-1 shrink-0 ml-2">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              title="Clear selection"
            >
              <X className="w-3 h-3" />
            </button>
          )}
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-150 ${
              isOpen ? 'rotate-180 text-emerald-600' : ''
            }`}
          />
        </div>
      </div>

      {helperText && <p className="text-[10px] text-slate-400 mt-1">{helperText}</p>}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {/* Search Header */}
          <div className="p-2 border-b border-slate-100 bg-slate-50/70">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-md text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600/30"
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setIsOpen(false);
                  if (e.key === 'Enter' && filteredOptions.length > 0) {
                    e.preventDefault();
                    handleSelect(filteredOptions[0].value);
                  }
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-400">
              <span>{filteredOptions.length} available</span>
              {allowCustomInput && searchTerm.trim() && (
                <button
                  type="button"
                  onClick={() => handleSelect(searchTerm.trim())}
                  className="text-emerald-700 hover:underline font-medium"
                >
                  Use &quot;{searchTerm.trim()}&quot;
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-50 p-1">
            {filteredOptions.length === 0 ? (
              <div className="py-4 px-3 text-center text-xs text-slate-400">
                No matching options found.
                {allowCustomInput && searchTerm.trim() && (
                  <button
                    type="button"
                    onClick={() => handleSelect(searchTerm.trim())}
                    className="block mx-auto mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold hover:bg-emerald-100"
                  >
                    Select &quot;{searchTerm.trim()}&quot; as custom filter
                  </button>
                )}
              </div>
            ) : grouped && groupedOptions ? (
              Array.from(groupedOptions.entries()).map(([cat, items]) => (
                <div key={cat} className="py-1">
                  <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50/50">
                    {cat} ({items.length})
                  </div>
                  {items.map((opt) => {
                    const isSelected = opt.value.toLowerCase() === value.toLowerCase();
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => handleSelect(opt.value)}
                        className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-emerald-50 text-emerald-900 font-semibold'
                            : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div>{opt.label}</div>
                          {opt.subtext && <div className="text-[10px] text-slate-400">{opt.subtext}</div>}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              ))
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value.toLowerCase() === value.toLowerCase();
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`w-full text-left px-2.5 py-1.5 rounded text-xs transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-emerald-50 text-emerald-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{opt.label}</div>
                      {opt.subtext && <div className="text-[10px] text-slate-400">{opt.subtext}</div>}
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
