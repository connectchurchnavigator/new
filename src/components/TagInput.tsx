'use client';

import { useState } from 'react';

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  suggestions?: string[];
  colorClass?: string;
}

/**
 * A simple chip/tag input: type + Enter (or click a suggestion) to
 * add, click the × to remove. Used for preaching specialisms,
 * ministry areas, available-for, and languages in the wizard.
 */
export function TagInput({ value, onChange, placeholder, suggestions = [], colorClass = 'chip-purple' }: TagInputProps) {
  const [draft, setDraft] = useState('');

  function addTag(tag: string) {
    const clean = tag.trim();
    if (!clean || value.includes(clean)) return;
    onChange([...value, clean]);
    setDraft('');
  }

  function removeTag(tag: string) {
    onChange(value.filter((t) => t !== tag));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1 mb-2 min-h-[1px]">
        {value.map((tag) => (
          <span key={tag} className={`chip ${colorClass} !mr-1`}>
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="ml-1 opacity-60 hover:opacity-100">
              ×
            </button>
          </span>
        ))}
      </div>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addTag(draft);
          }
        }}
        placeholder={placeholder}
        className="w-full border-[1.5px] border-border rounded-xl px-3.5 py-2.5 text-sm outline-none focus:border-purple"
      />

      {suggestions.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {suggestions
            .filter((s) => !value.includes(s))
            .map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => addTag(s)}
                className="text-xs border-[1.5px] border-border rounded-full px-3 py-1 text-gray hover:border-purple hover:text-purple"
              >
                + {s}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
