import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Search, X, Check, PlusCircle } from 'lucide-react';
import { filterItemsByPrefix } from '../data/syriaData';

interface SearchableSelectProps {
  id: string;
  label: string;
  required?: boolean;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  allowCustomEntry?: boolean;
  error?: string;
  hint?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  id,
  label,
  required,
  options,
  value,
  onChange,
  disabled = false,
  allowCustomEntry = false,
  error,
  hint,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter options as user types (letter by letter prefix filtering with 'ال' ignored)
  const filteredOptions = useMemo(() => {
    return filterItemsByPrefix(options, searchQuery);
  }, [options, searchQuery]);

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSelectOption = (option: string) => {
    onChange(option);
    setSearchQuery('');
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('');
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleCustomSubmit = () => {
    if (searchQuery.trim()) {
      onChange(searchQuery.trim());
      setIsOpen(false);
    }
  };

  const isExactMatch = options.some(
    (opt) => opt.trim().toLowerCase() === searchQuery.trim().toLowerCase()
  );

  return (
    <div ref={containerRef} className="relative w-full text-right" id={`wrapper-${id}`}>
      <label htmlFor={id} className="block text-sm font-semibold text-gray-200 mb-1.5">
        {label} {required && <span className="text-orange-400 font-bold">* (إجباري)</span>}
      </label>

      {/* Control Input */}
      <div
        onClick={() => {
          if (!disabled) {
            setIsOpen(true);
            inputRef.current?.focus();
          }
        }}
        className={`w-full relative flex items-center px-4 py-3 rounded-xl bg-white/[0.04] border text-white transition-all cursor-pointer ${
          disabled
            ? 'opacity-45 cursor-not-allowed border-white/5 bg-white/[0.01]'
            : errorsTheme(error, isOpen)
        }`}
      >
        <Search className="w-4 h-4 text-gray-400 ml-2.5 shrink-0" />

        {/* Input allows typing search query directly */}
        <input
          ref={inputRef}
          id={id}
          type="text"
          disabled={disabled}
          value={isOpen ? searchQuery : value}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearchQuery('');
          }}
          placeholder=""
          className="w-full bg-transparent text-white outline-none border-none text-right font-medium"
        />

        {/* Action icons */}
        <div className="flex items-center gap-1.5 mr-2 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="مسح الاختيار"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-orange-400' : ''
            }`}
          />
        </div>
      </div>

      {hint && !error && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}

      {/* Floating Dropdown Menu */}
      {isOpen && !disabled && (
        <div
          id={`dropdown-${id}`}
          className="absolute z-50 top-full mt-2 w-full max-h-60 overflow-y-auto rounded-2xl bg-[#0a1226] border border-orange-500/30 shadow-[0_12px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl p-1.5 scrollbar-thin scrollbar-thumb-orange-600/40"
        >
          {/* Custom option prompt if user types something not in list */}
          {allowCustomEntry && searchQuery.trim() && !isExactMatch && (
            <button
              type="button"
              onClick={handleCustomSubmit}
              className="w-full text-right px-3 py-2.5 rounded-xl bg-orange-600/20 hover:bg-orange-600/35 text-orange-200 font-semibold text-xs sm:text-sm flex items-center justify-between border border-orange-500/40 mb-1.5 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-orange-400 shrink-0" />
                <span>إدخال يدوي: "{searchQuery.trim()}"</span>
              </span>
              <span className="text-[11px] bg-orange-500/30 text-orange-200 px-2 py-0.5 rounded-full">
                اعتماد
              </span>
            </button>
          )}

          {/* Options List */}
          {filteredOptions.length > 0 ? (
            <div className="space-y-0.5">
              {filteredOptions.map((opt) => {
                const isSelected = opt === value;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleSelectOption(opt)}
                    className={`w-full text-right px-3.5 py-2.5 rounded-xl text-sm transition-colors flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-orange-600 text-white font-bold'
                        : 'text-gray-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && <Check className="w-4 h-4 text-white shrink-0" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-4 px-3 text-center text-xs text-gray-400">
              {allowCustomEntry ? (
                <div>
                  <p className="mb-2">لم يتم العثور على خيار مطابق.</p>
                  <button
                    type="button"
                    onClick={handleCustomSubmit}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>إضافة "{searchQuery.trim()}" كإدخال مخصص</span>
                  </button>
                </div>
              ) : (
                'لا توجد نتائج مطابقة'
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

function errorsTheme(error?: string, isOpen?: boolean): string {
  if (error) {
    return 'border-red-500/80 bg-red-500/5 focus-within:ring-2 focus-within:ring-red-500/30';
  }
  if (isOpen) {
    return 'border-orange-500 bg-white/[0.07] ring-2 ring-orange-500/40';
  }
  return 'border-white/15 hover:border-white/30';
}
