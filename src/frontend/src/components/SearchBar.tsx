import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X } from "lucide-react";

export type Suggestion = {
  id: string;
  label: string;   // what is shown
  value?: string;  // what is submitted (default: label)
};

type SearchBarProps = {
  placeholder?: string;
  value?: string;                            // controlled value
  defaultValue?: string;
  debounceMs?: number;                   // debounce for onChange
  suggestions?: Suggestion[];            // optional suggestion list
  onChange?: (value: string) => void;    // debounced
  onSubmit?: (value: string) => void;    // when pressing Enter or clicking search
  onSelectSuggestion?: (s: Suggestion) => void; // when user picks a suggestion
  autoFocus?: boolean;
};

export default function SearchBar({
  placeholder = "Search schools…",
  value: controlledValue,
  defaultValue = "",
  debounceMs = 250,
  suggestions = [],
  onChange,
  onSubmit,
  onSelectSuggestion,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const debounceTimer = useRef<number | null>(null);

  // Use controlled value if provided, otherwise use internal value
  const value = controlledValue !== undefined ? controlledValue : internalValue;
  const setValue = (newValue: string) => {
    if (controlledValue !== undefined) {
      // For controlled mode, just call onChange
      onChange?.(newValue);
    } else {
      // For uncontrolled mode, update internal state
      setInternalValue(newValue);
    }
  };

  // Basic filter for suggestions
  const filtered = useMemo(() => {
    if (!value.trim()) return suggestions.slice(0, 8);
    const v = value.toLowerCase();
    return suggestions
      .filter((s) => s.label.toLowerCase().includes(v))
      .slice(0, 8);
  }, [value, suggestions]);

  // Debounce onChange (only for uncontrolled mode)
  useEffect(() => {
    if (!onChange || controlledValue !== undefined) return; // Skip debounce for controlled mode
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => onChange(internalValue), debounceMs);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [internalValue, debounceMs, onChange, controlledValue]);

  useEffect(() => {
    if (autoFocus && inputRef.current) inputRef.current.focus();
  }, [autoFocus]);

  const submit = () => {
    onSubmit?.(value.trim());
    setOpen(false);
  };

  const handleSelect = (idx: number) => {
    const s = filtered[idx];
    if (!s) return;
    setValue(s.label);
    onSelectSuggestion?.(s);
    onSubmit?.(s.value ?? s.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setOpen(true);
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      if (open && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(activeIndex);
      } else {
        submit();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  };

  const onBlur: React.FocusEventHandler = () => {
    // Close dropdown after focus leaves both input and list
    requestAnimationFrame(() => {
      const a = document.activeElement;
      if (!listRef.current?.contains(a) && a !== inputRef.current) {
        setOpen(false);
        setActiveIndex(-1);
      }
    });
  };

  // ARIA ids
  const listboxId = "search-suggestions";
  const activeOptionId =
    activeIndex >= 0 && filtered[activeIndex]
      ? `search-option-${filtered[activeIndex].id}`
      : undefined;

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all h-12">
        <Search className="ml-3 w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          className="flex-1 px-2 py-2 outline-none bg-transparent min-w-0 h-full"
          placeholder={placeholder}
          role="combobox"
          aria-expanded={open}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={activeOptionId}
        />

        {value && (
          <button
            type="button"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Clear"
            onClick={() => { setValue(""); inputRef.current?.focus(); setOpen(true); }}
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        )}
        <button 
          className="px-4 h-9 mr-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors whitespace-nowrap flex items-center justify-center" 
          onClick={submit} 
          type="button"
        >
          Search
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul
          id={listboxId}
          ref={listRef}
          className="absolute z-50 w-full mt-1.5 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
          aria-label="Suggestions"
        >
          {filtered.map((s, idx) => {
            const isActive = idx === activeIndex;
            const optionId = `search-option-${s.id}`;
            return (
              <li
                key={s.id}
                id={optionId}
                className={`${isActive ? "bg-indigo-50" : ""} border-b border-gray-100 last:border-0`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className="w-full px-2.5 py-1.5 text-left hover:bg-indigo-50 transition-colors"
                  onClick={() => handleSelect(idx)}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  {highlightMatch(s.label, value)}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/** Highlight matched text in suggestions */
function highlightMatch(label: string, query: string) {
  if (!query.trim()) return label;
  const q = query.trim();
  const idx = label.toLowerCase().indexOf(q.toLowerCase());
  if (idx === -1) return label;
  const before = label.slice(0, idx);
  const match = label.slice(idx, idx + q.length);
  const after = label.slice(idx + q.length);
  return (
    <span>
      {before}
      <mark className="bg-yellow-200">{match}</mark>
      {after}
    </span>
  );
}