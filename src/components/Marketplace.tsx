import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Filter, SlidersHorizontal, MapPin, Percent, X, Loader2 } from 'lucide-react';
import { Offer, Request as MarketRequest, EGYPT_CITIES } from '@/src/types';
import { OfferCard } from '@/src/components/OfferCard';
import { cn, getDistance } from '@/src/lib/utils';
import { toast } from 'react-hot-toast';
import { getSupabase } from '@/src/lib/supabase';

export const Marketplace = () => {
  const { t } = useTranslation();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<Offer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [minDiscount, setMinDiscount] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState<any>(null);

  const userProfile = JSON.parse(localStorage.getItem('pharmacy_profile') || '{}');
  const [loading, setLoading] = useState(true);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from Inventory Offers...');
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error: fetchError } = await supabase
        .from('"Inventory Offers"')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const allOffers = data || [];

      // Sort by proximity to user's city
      const sorted = [...allOffers].sort((a, b) => {
        const distA = getDistance(userProfile.city, a.city);
        const distB = getDistance(userProfile.city, b.city);
        return distA - distB;
      });

      setOffers(sorted);
      setFilteredOffers(sorted);
    } catch (err) {
      console.error('Fetch Marketplace Error:', err);
      setError(err);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  }, [userProfile.city, t]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  useEffect(() => {
    let result = offers;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(o => 
        (o["English name"] || "").toLowerCase().includes(q) || 
        (o["Arabic Name"] || "").includes(q) || 
        (o.barcode || "").includes(q)
      );
    }

    if (selectedCity) {
      result = result.filter(o => o.city === selectedCity);
    }

    if (minDiscount > 0) {
      result = result.filter(o => o.discount >= minDiscount);
    }

    setFilteredOffers(result);
  }, [searchQuery, selectedCity, minDiscount, offers]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-slate-900">{t('marketplace')}</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search_placeholder')}
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
            />
          </div>
          <button
            onClick={() => {
              console.log('Show Filters clicked');
              setShowFilters(!showFilters);
            }}
            className={cn(
              "p-2 rounded-xl border transition-all",
              showFilters ? "bg-primary text-white border-primary" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
            )}
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <MapPin size={14} />
              {t('city')}
            </label>
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">{t('all_cities')}</option>
              {EGYPT_CITIES.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
              <Percent size={14} />
              {t('min_discount')}
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="0"
                max="90"
                step="5"
                value={minDiscount}
                onChange={(e) => setMinDiscount(parseInt(e.target.value))}
                className="flex-1 accent-primary"
              />
              <span className="font-bold text-primary w-12 text-center">{minDiscount}%</span>
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                console.log('Reset Filters clicked');
                setSelectedCity('');
                setMinDiscount(0);
                setSearchQuery('');
              }}
              className="w-full py-2 text-slate-500 hover:text-slate-800 font-semibold flex items-center justify-center gap-2"
            >
              <X size={16} />
              Reset Filters
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={48} />
          </div>
        ) : filteredOffers.length > 0 ? (
          filteredOffers.map(offer => (
            <OfferCard
              key={offer.id}
              offer={offer}
              actionLabel="Contact Pharmacy"
              onAction={(o) => toast.success(`Contacting ${o.pharmacy_name}...`)}
            />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Search size={40} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">{error ? 'Failed to load offers' : 'No offers found'}</h3>
            <p className="text-slate-500">{error ? 'Please try again later' : 'Try adjusting your search or filters'}</p>
          </div>
        )}
      </div>
    </div>
  );
};
