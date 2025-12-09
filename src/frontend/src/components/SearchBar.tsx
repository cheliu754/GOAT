import type { KeyboardEventHandler } from "react";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type SearchBarProps = {
  placeholder?: string;
  value?: string;                            // controlled value
  defaultValue?: string;
  debounceMs?: number;                   // debounce for onChange
  onChange?: (value: string) => void;    // debounced
  onSubmit?: (value: string) => void;    // when pressing Enter or clicking search
  autoFocus?: boolean;
};

export default function SearchBar({
  placeholder = "Search schools…",
  value: controlledValue,
  defaultValue = "",
  debounceMs = 250,
  onChange,
  onSubmit,
  autoFocus = false,
}: SearchBarProps) {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
  };

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Escape") {
      setValue("");
    }
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="flex items-center gap-1.5 bg-white border border-gray-300 rounded-lg shadow-sm hover:border-indigo-400 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-100 transition-all h-12">
        <Search className="ml-3 w-4 h-4 text-gray-400 flex-shrink-0" aria-hidden />

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          className="flex-1 px-2 py-2 outline-none bg-transparent min-w-0 h-full"
          placeholder={placeholder}
        />

        {value && (
          <button
            type="button"
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="Clear"
            onClick={() => { setValue(""); inputRef.current?.focus(); }}
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
    </div>
  );
}
