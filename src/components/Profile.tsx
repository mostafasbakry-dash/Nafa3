import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { User, Camera, Mail, Phone, MapPin, Building, CreditCard, Send, Loader2, ShieldCheck, Lock, Star, TrendingUp } from 'lucide-react';
import { EGYPT_CITIES } from '@/src/types';
import { toast } from 'react-hot-toast';
import { getSupabase } from '@/src/lib/supabase';
import { cn } from '@/src/lib/utils';

export const Profile = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ avgRating: 0, reviewCount: 0, successScore: 0 });
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('pharmacy_profile');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      name: parsed.name || '',
      phone: parsed.phone || '',
      city: parsed.city || '',
      address: parsed.address || '',
      license_no: parsed.license_no || '',
      telegram: parsed.telegram || '',
      profile_pic: parsed.profile_pic || ''
    };
  });

  useEffect(() => {
    const fetchStats = async () => {
      const pharmacy_id = localStorage.getItem('pharmacy_id');
      if (!pharmacy_id) return;

      const supabase = getSupabase();
      if (!supabase) return;

      // Fetch Success Score
      const { count: archiveCount } = await supabase
        .from('sales_archive')
        .select('*', { count: 'exact', head: true })
        .eq('pharmacy_id', Number(pharmacy_id));

      // Fetch Ratings
      const { data: ratings } = await supabase
        .from('ratings')
        .select('stars')
        .eq('to_pharmacy_id', Number(pharmacy_id));

      const avgRating = ratings && ratings.length > 0
        ? ratings.reduce((sum, r) => sum + r.stars, 0) / ratings.length
        : 0;

      setStats({
        avgRating,
        reviewCount: ratings?.length || 0,
        successScore: archiveCount || 0
      });
    };

    fetchStats();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Update Profile form submitted', profile);
    setLoading(true);
    try {
      const pharmacy_id_str = localStorage.getItem('pharmacy_id');
      const pharmacy_id = pharmacy_id_str ? parseInt(pharmacy_id_str) : 0;
      
      const response = await fetch('https://n8n.srv1168218.hstgr.cloud/webhook/save-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          payload: { 
            ...profile, 
            pharmacy_id,
            phone: profile.phone.toString().replace(/\D/g, '') ? parseInt(profile.phone.toString().replace(/\D/g, '')) : 0,
            license_no: profile.license_no.toString().replace(/\D/g, '') ? parseInt(profile.license_no.toString().replace(/\D/g, '')) : 0,
            telegram: profile.telegram
          } 
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Update failed: ${response.status} ${errorText}`);
      }
      
      localStorage.setItem('pharmacy_profile', JSON.stringify(profile));
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error('EXACT Profile Update Error:', err);
      toast.error(t('error_generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">{t('profile')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center shadow-sm">
            <div className="relative w-32 h-32 mx-auto mb-6">
              <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden border-4 border-white shadow-lg">
                {profile.profile_pic ? (
                  <img src={profile.profile_pic} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <button 
                onClick={() => console.log('Change Profile Picture clicked')}
                className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full shadow-lg hover:bg-primary-dark transition-all"
              >
                <Camera size={20} />
              </button>
            </div>
            <h2 className="text-xl font-bold text-slate-900">{profile.name}</h2>
            <p className="text-slate-500 text-sm mb-4">{profile.city}, Egypt</p>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex flex-col items-center justify-center gap-1 mb-1">
                  <div className="flex items-center gap-0.5 text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        className={cn(
                          star <= Math.round(stats.avgRating) 
                            ? "fill-amber-400 text-amber-400" 
                            : "text-slate-200"
                        )}
                      />
                    ))}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-lg font-bold text-slate-900">{stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '0.0'}</span>
                    <span className="text-xs text-slate-400">({stats.reviewCount})</span>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold text-center">{t('cumulative_rating')}</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div className="flex items-center justify-center gap-1 text-emerald-600 mb-1">
                  <TrendingUp size={16} />
                  <span className="text-lg font-bold">{stats.successScore}</span>
                </div>
                <p className="text-[10px] text-slate-400 uppercase font-bold">{t('success_score')}</p>
              </div>
            </div>

            {stats.avgRating >= 4 && stats.successScore >= 5 && (
              <div className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck size={16} />
                {t('verified_pharmacy')}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-900">Security</h3>
            <button 
              onClick={() => console.log('Change Password clicked')}
              className="w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl font-semibold text-sm transition-all text-start flex items-center justify-between"
            >
              Change Password
              <Lock size={16} className="text-slate-400" />
            </button>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('pharmacy_name')}</label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('phone')}</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('city')}</label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <select
                      required
                      value={profile.city}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none appearance-none"
                    >
                      {EGYPT_CITIES.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('address')}</label>
                  <input
                    required
                    value={profile.address}
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('license_no')}</label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      required
                      value={profile.license_no}
                      onChange={(e) => setProfile({ ...profile, license_no: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase px-1">{t('telegram')}</label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      value={profile.telegram}
                      onChange={(e) => setProfile({ ...profile, telegram: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 flex justify-end">
                <button
                  disabled={loading}
                  className="px-8 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
                >
                  {loading ? <Loader2 className="animate-spin" /> : t('save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
