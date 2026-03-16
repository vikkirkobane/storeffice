"use client";

import { useState } from "react";

interface AddressAutocompleteProps {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
  placeholder?: string;
}

/**
 * Simple address autocomplete using OpenStreetMap Nominatim (free, no API key).
 * NOTE: For production, consider caching and rate limiting.
 */
export function AddressAutocomplete({ value, onChange, placeholder = "Enter address..." }: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSuggestions = async (query: string) => {
    if (query.length < 5) {
      setSuggestions([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      setSuggestions(data);
    } catch (e) {
      console.error("Geocoding error:", e);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    if (val) fetchSuggestions(val);
  };

  const selectSuggestion = (s: any) => {
    const address = s.display_name;
    onChange(address, parseFloat(s.lat), parseFloat(s.lon));
    setSuggestions([]);
  };

  return (
    <div className="relative">
      <input
        type="text"
        className="w-full border rounded p-2"
        placeholder={placeholder}
        value={value}
        onChange={handleInput}
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 w-full bg-white border rounded mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((s, i) => (
            <li key={i} className="p-2 hover:bg-gray-100 cursor-pointer" onClick={() => selectSuggestion(s)}>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
