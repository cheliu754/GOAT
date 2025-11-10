import React, { useEffect, useMemo, useRef, useState } from "react";
import "./SearchBar.css";

export type Suggestion = {
  id: string;
  label: string;   // what is shown
  value?: string;  // what is submitted (default: label)
};

type SearchBarProps = {
  placeholder?: string;
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
  defaultValue = "",
  debounceMs = 250,
  suggestions = [],
  onChange,
  onSubmit,
  onSelectSuggestion,
  autoFocus = false,
}: SearchBarProps) {
  const [value, setValue] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const debounceTimer = useRef<number | null>(null);

  // Basic filter for suggestions
  const filtered = useMemo(() => {
    if (!value.trim()) return suggestions.slice(0, 8);
    const v = value.toLowerCase();
    return suggestions
      .filter((s) => s.label.toLowerCase().includes(v))
      .slice(0, 8);
  }, [value, suggestions]);

  // Debounce onChange
  useEffect(() => {
    if (!onChange) return;
    if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    debounceTimer.current = window.setTimeout(() => onChange(value), debounceMs);
    return () => {
      if (debounceTimer.current) window.clearTimeout(debounceTimer.current);
    };
  }, [value, debounceMs, onChange]);

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
    <div className="search">
      <div className="search__box">
        <span className="search__icon" aria-hidden>🔎</span>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={onBlur}
          className="search__input"
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
            className="search__clear"
            aria-label="Clear"
            onClick={() => { setValue(""); inputRef.current?.focus(); setOpen(true); }}
          >
            ✕
          </button>
        )}
        <button className="btn search__submit" onClick={submit} type="button">
          Search
        </button>
      </div>

      {open && filtered.length > 0 && (
        <ul
          id={listboxId}
          ref={listRef}
          className="search__list"
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
                className={`search__item ${isActive ? "is-active" : ""}`}
                role="option"
                aria-selected={isActive}
              >
                <button
                  type="button"
                  className="search__pick"
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
      <mark>{match}</mark>
      {after}
    </span>
  );
}
