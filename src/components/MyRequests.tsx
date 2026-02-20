import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Plus, Trash2, Loader2, X, ShieldCheck } from 'lucide-react';
import { Request as MarketRequest, Drug } from '@/src/types';
import { DrugSearch } from '@/src/components/DrugSearch';
import { toast } from 'react-hot-toast';
import { getSupabase } from '@/src/lib/supabase';

export const MyRequests = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<MarketRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [quantity, setQuantity] = useState(1);

  const pharmacy_id_str = localStorage.getItem('pharmacy_id');
  const pharmacy_id = pharmacy_id_str ? parseInt(pharmacy_id_str) : 0;

  const fetchRequests = useCallback(async () => {
    if (!pharmacy_id) return;
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from Inventory Requests...');
      const supabase = getSupabase();
      if (!supabase) return;

      const { data, error: fetchError } = await supabase
        .from('"Inventory Requests"')
        .select('*')
        .eq('Pharmacy ID', pharmacy_id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setRequests(data || []);
    } catch (err) {
      console.error('Fetch Requests Error:', err);
      setError(err);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  }, [pharmacy_id, t]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleAddRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Add Request form submitted', { selectedDrug, quantity });
    if (!selectedDrug) return;

    setLoading(true);
    try {
      const pharmacy_id_str = localStorage.getItem('pharmacy_id');
      const pharmacy_id = pharmacy_id_str ? parseInt(pharmacy_id_str) : 0;
      
      const payload = {
        "Pharmacy ID": pharmacy_id,
        drug_id: selectedDrug.id,
        "English name": selectedDrug.name_en,
        "Arabic Name": selectedDrug.name_ar,
        barcode: selectedDrug.barcode ? parseInt(selectedDrug.barcode.toString().replace(/\D/g, '')) : 0,
        Quantity: quantity
      };

      const response = await fetch('https://n8n.srv1168218.hstgr.cloud/webhook/add-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload }),
      });

      if (!response.ok) throw new Error('Failed to add request');

      toast.success(t('success_added'));
      setShowAddModal(false);
      setSelectedDrug(null);
      setQuantity(1);
      fetchRequests(); // Refresh the list
    } catch (err) {
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRequest = async (id: string) => {
    console.log(`Delete Request clicked: ${id}`);
    if (!window.confirm(t('confirm_delete'))) return;
    try {
      // Deletion sync with n8n
      await fetch(`https://n8n.srv1168218.hstgr.cloud/webhook/add-request?id=${id}`, {
        method: 'DELETE',
      });
      fetchRequests();
      toast.success(t('delete_success'));
    } catch (err) {
      toast.error(t('error_generic'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('my_requests')}</h1>
          <p className="text-slate-500">List the drugs you are looking for</p>
        </div>
        <button
          onClick={() => {
            console.log('Open Add Request Modal clicked');
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
          {t('add_request')}
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('drug')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('quantity')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">{t('created_at')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-center">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length > 0 ? (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-900">{request["English name"]}</span>
                        <span className="text-xs text-slate-500">{request.barcode}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold">{request.Quantity}</td>
                    <td className="px-6 py-4 text-slate-500 text-sm">
                      {new Date(request.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button 
                          onClick={() => handleDeleteRequest(request.id)}
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
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
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
              <h2 className="text-xl font-bold">{t('add_request')}</h2>
              <button 
                onClick={() => {
                  console.log('Close Add Request Modal clicked');
                  setShowAddModal(false);
                }} 
                className="hover:bg-white/20 p-1 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAddRequest} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase">{t('search_drug')}</label>
                {!selectedDrug ? (
                  <DrugSearch onSelect={(drug) => setSelectedDrug(drug)} />
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
                <div className="space-y-1 animate-in slide-in-from-bottom-4 duration-300">
                  <label className="text-xs font-bold text-slate-500 uppercase">{t('quantity')}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary shadow-sm"
                  />
                </div>
              )}

              <button
                disabled={loading || !selectedDrug || !selectedDrug.barcode || parseInt(selectedDrug.barcode.toString().replace(/\D/g, '')) === 0 || !quantity || quantity <= 0}
                className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="animate-spin" /> : t('add_request')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
