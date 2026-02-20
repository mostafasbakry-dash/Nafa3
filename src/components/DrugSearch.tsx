import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Loader2 } from 'lucide-react';
import { getSupabase } from '@/src/lib/supabase';
import { Drug } from '@/src/types';
import { cn } from '@/src/lib/utils';

interface DrugSearchProps {
  onSelect: (drug: Drug) => void;
  className?: string;
}

export const DrugSearch = ({ onSelect, className }: DrugSearchProps) => {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Drug[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDrugs = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      const supabase = getSupabase();
      if (!supabase) {
        console.error('Supabase client not initialized');
        return;
      }

      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('Master')
          .select('*')
          .or(`"Arabic Name".ilike.%${query}%,"English name".ilike.%${query}%`)
          .limit(10);

        console.log('Supabase search results:', data);
        if (error) throw error;

        // Map the results to our Drug type since we are now selecting '*'
        const mappedData = (data || []).map((item: any) => ({
          id: item.id,
          barcode: item['Item Barcode'],
          price: item['Price'],
          manufacturer: item.manufacturer,
          name_en: item['English name'],
          name_ar: item['Arabic Name']
        }));

        setResults(mappedData);
        setIsOpen(true);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchDrugs, 300);
    return () => clearTimeout(debounce);
  }, [query]);

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search_placeholder')}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" size={20} />
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-80 overflow-y-auto">
          {results.map((drug) => (
            <button
              key={drug.id}
              onClick={() => {
                console.log(`Drug selected from search: ${drug.name_en} (${drug.barcode})`);
                onSelect(drug);
                setQuery('');
                setIsOpen(false);
              }}
              className="w-full text-start px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex flex-col gap-1"
            >
              <div className="flex justify-between items-start">
                <span className="font-semibold text-slate-900">{drug.name_en}</span>
                <span className="text-xs font-mono text-slate-400">{drug.barcode}</span>
              </div>
              <span className="text-sm text-slate-500">{drug.name_ar}</span>
              <span className="text-xs text-primary font-medium">{drug.manufacturer}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
