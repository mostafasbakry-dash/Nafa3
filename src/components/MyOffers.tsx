import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, Trash2, Edit2, Loader2, AlertCircle, X, ShieldCheck, Info } from 'lucide-react';
import { Offer, Drug } from '@/src/types';
import { DrugSearch } from '@/src/components/DrugSearch';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { BulkUpload } from '@/src/components/BulkUpload';
import { cn } from '@/src/lib/utils';
import { getSupabase } from '@/src/lib/supabase';

export const MyOffers = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [formData, setFormData] = useState({
    expiry_date: '',
    discount: 20,
    quantity: 1,
    price: 0
  });

  const pharmacy_id_str = localStorage.getItem('pharmacy_id');
  const pharmacy_id = pharmacy_id_str ? parseInt(pharmacy_id_str) : 0;

  const fetchOffers = useCallback(async () => {
    if (!pharmacy_id) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from Inventory Offers...');
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error: fetchError } = await supabase
        .from('"Inventory Offers"')
        .select('*')
        .eq('Pharmacy ID', pharmacy_id)
        .order('Expiry date', { ascending: true });

      if (fetchError) throw fetchError;
      setOffers(data || []);
    } catch (err) {
      console.error('Fetch Offers Error:', err);
      setError(err);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  }, [pharmacy_id, t]);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleAddOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add Offer form submitted', formData, selectedDrug);
    if (!selectedDrug) return;

    // Check for duplicates (Barcode + Expiry)
    const duplicate = offers.find(o => o.barcode === selectedDrug.barcode && o.expiry_date === formData.expiry_date);
    if (duplicate) {
      if (!window.confirm(t('warning_duplicate'))) return;
    }

    setLoading(true);
    try {
      const pharmacy_id_str = localStorage.getItem('pharmacy_id');
      const pharmacy_id = pharmacy_id_str ? parseInt(pharmacy_id_str) : 0;
      
      // Ensure ISO date format (YYYY-MM-DD)
      // If input type="month" gives "YYYY-MM", we append "-01"
      const isoExpiryDate = formData.expiry_date.length === 7 
        ? `${formData.expiry_date}-01` 
        : formData.expiry_date;

      const payload = {
        ...formData,
        "Expiry date": isoExpiryDate,
        "Pharmacy ID": pharmacy_id,
        drug_id: selectedDrug.id,
        "English name": selectedDrug.name_en,
        "Arabic Name": selectedDrug.name_ar,
        barcode: selectedDrug.barcode ? parseInt(selectedDrug.barcode.toString().replace(/\D/g, '')) : 0,
        Quantity: formData.quantity,
        price: formData.price,
        discount: formData.discount
      };

      const response = await fetch('https://n8n.srv1168218.hstgr.cloud/webhook/add-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) throw new Error('Failed to add offer');

      toast.success(t('success_added'));
      setShowAddModal(false);
      setSelectedDrug(null);
      fetchOffers(); // Refresh the list
    } catch (err) {
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOffer = async (id: string) => {
    console.log(`Delete Offer clicked: ${id}`);
    if (!window.confirm(t('confirm_delete'))) return;
    
    try {
      // Deletion sync with n8n
      await fetch(`https://n8n.srv1168218.hstgr.cloud/webhook/add-offer?id=${id}`, {
        method: 'DELETE',
      });
      fetchOffers();
      toast.success(t('delete_success'));
    } catch (err) {
      toast.error(t('error_generic'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('my_offers')}</h1>
          <p className="text-slate-500">Manage your inventory and stock</p>
        </div>
        <button
          onClick={() => {
            console.log('Open Add Offer Modal clicked');
            const pid = localStorage.getItem('pharmacy_id');
            if (!pid) {
              toast.error('Please complete your pharmacy profile first to start adding items');
              navigate('/profile');
              return;
            }
            setShowAddModal(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary-dark transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
          {t('add_offer')}
        </button>
      </div>

      <BulkUpload />

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('drug')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('expiry_date')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('discount')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('price')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('quantity')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.length > 0 ? (
                offers.map((offer) => (
                  <tr key={offer.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{offer["English name"]}</span>
                        <span className="text-xs text-slate-500">{offer.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded text-xs font-bold",
                        new Date(offer["Expiry date"]).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 90
                          ? "bg-orange-100 text-orange-700"
                          : "bg-slate-100 text-slate-700"
                      )}>
                        {format(new Date(offer["Expiry date"]), 'MMM yyyy')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-primary">{offer.discount}%</span>
                    </td>
                    <td className="px-6 py-4 font-bold">{offer.price} {t('egp')}</td>
                    <td className="px-6 py-4">{offer.Quantity}</td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => {
                            console.log(`Edit Offer clicked: ${offer.id}`);
                          }}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    {error ? 'Failed to load items' : 'No items found'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="bg-primary p-6 text-white flex justify-between items-center">
              <h2 className="text-xl font-bold">{t('add_offer')}</h2>
              <button 
                onClick={() => {
                  console.log('Close Add Offer Modal clicked');
                  setShowAddModal(false);
                }} 
                className="hover:bg-white/20 p-1 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddOffer} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('search_drug')}</label>
                {!selectedDrug ? (
                  <DrugSearch onSelect={(drug) => {
                    setSelectedDrug(drug);
                    setFormData({ ...formData, price: drug.price || 0 });
                  }} />
                ) : (
                  <div className="space-y-3 animate-in fade-in duration-300">
                    <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-2 text-primary font-bold">
                        <ShieldCheck size={18} />
                        <span>Drug Verified</span>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setSelectedDrug(null)} 
                        className="text-slate-400 hover:text-red-500 text-xs font-bold uppercase"
                      >
                        {t('change')}
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-1">English Name</label>
                        <input 
                          disabled 
                          value={selectedDrug.name_en || ''} 
                          className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Arabic Name</label>
                        <input 
                          disabled 
                          value={selectedDrug.name_ar || ''} 
                          className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-medium text-right"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase px-1">Barcode</label>
                        <input 
                          disabled 
                          value={selectedDrug.barcode || ''} 
                          className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {selectedDrug && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-300">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('expiry_date')}</label>
                    <input
                      type="month"
                      required
                      value={formData.expiry_date}
                      onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('discount')} %</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('quantity')}</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 0 })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">{t('price')} ({t('egp')})</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                    />
                  </div>
                </div>
              )}

              <button
                disabled={loading || !selectedDrug || !selectedDrug.barcode || parseInt(selectedDrug.barcode.toString().replace(/\D/g, '')) === 0 || !formData.price || formData.price <= 0}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : t('add_offer')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
