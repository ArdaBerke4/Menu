import { useState, useEffect } from 'react';

export function DebouncedColorInput({ value, onChange, onFocus, disabled = false }: any) {
  const [local, setLocal] = useState(value);

  useEffect(() => {
    setLocal(value);
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      if (local !== value) onChange(local);
    }, 300);
    return () => clearTimeout(t);
  }, [local, value, onChange]);

  return (
    <div className="flex gap-2 relative z-0">
      <input
        type="color"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onFocus={onFocus}
        disabled={disabled}
        className="w-14 h-14 p-1 border-2 border-brand-dark bg-white shrink-0 cursor-pointer disabled:opacity-50"
      />
      <input
        type="text"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onFocus={onFocus}
        disabled={disabled}
        className="flex-1 px-4 py-3 border-2 border-brand-dark bg-white uppercase font-bold disabled:opacity-50 focus:outline-none"
        placeholder="#000000"
      />
    </div>
  );
}
