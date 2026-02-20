import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  AlertCircle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { Offer, Request as MarketRequest } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';
import { getSupabase } from '@/src/lib/supabase';
import { toast } from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className={cn("p-3 rounded-xl", color)}>
        <Icon size={24} className="text-white" />
      </div>
      {trend && (
        <div className={cn(
          "flex items-center gap-1 text-xs font-bold",
          trend > 0 ? "text-emerald-600" : "text-rose-600"
        )}>
          {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {Math.abs(trend)}%
        </div>
      )}
    </div>
    <h3 className="text-slate-500 text-sm font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900">{value}</p>
  </div>
);

export const Dashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalOffers: 0,
    totalRequests: 0,
    totalOffersValue: 0,
    soldItems: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [error, setError] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    const pharmacy_id_str = localStorage.getItem('pharmacy_id');
    if (!pharmacy_id_str) {
      setLoading(false);
      return;
    }
    const pharmacy_id = parseInt(pharmacy_id_str);

    setLoading(true);
    setError(null);
    try {
      console.log('Fetching from Inventory Offers...');
      // Fetch Offers for this pharmacy
      const { data: offers, count: offersCount, error: offersError } = await supabase
        .from('"Inventory Offers"')
        .select('*', { count: 'exact' })
        .eq('Pharmacy ID', pharmacy_id);

      if (offersError) throw offersError;

      console.log('Fetching from Inventory Requests...');
      // Fetch Requests for this pharmacy
      const { data: requests, count: requestsCount, error: requestsError } = await supabase
        .from('"Inventory Requests"')
        .select('*', { count: 'exact' })
        .eq('Pharmacy ID', pharmacy_id);

      if (requestsError) throw requestsError;

      // Calculate stats
      const totalOffers = offersCount || 0;
      const totalRequests = requestsCount || 0;
      const totalOffersValue = (offers || []).reduce((sum, item) => {
        const price = typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0;
        const qty = typeof item.Quantity === 'number' ? item.Quantity : parseInt(item.Quantity) || 0;
        return sum + (price * qty);
      }, 0);
      
      // For "Sold Items", we'll check for status='sold'
      const { count: soldCount } = await supabase
        .from('"Inventory Offers"')
        .select('*', { count: 'exact', head: true })
        .eq('Pharmacy ID', pharmacy_id)
        .eq('status', 'sold');

      setStats({
        totalOffers,
        totalRequests,
        totalOffersValue,
        soldItems: soldCount || 0
      });

      // Combine and sort for recent activity
      const activity = [
        ...(offers || []).map(o => ({ ...o, type: 'offer' })),
        ...(requests || []).map(r => ({ ...r, type: 'request' }))
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5);

      setRecentActivity(activity);
    } catch (err) {
      console.error('Dashboard Stats Error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t('dashboard')}</h1>
          <p className="text-slate-500">{t('tagline')}</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => navigate('/my-requests')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg font-semibold text-slate-700 hover:bg-slate-50 transition-all"
          >
            <Plus size={18} />
            {t('add_request')}
          </button>
          <button 
            onClick={() => navigate('/my-offers')}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
          >
            <Plus size={18} />
            {t('add_offer')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title={t('stats_total_offers')} 
          value={stats.totalOffers} 
          icon={Package} 
          color="bg-blue-500"
          trend={12}
        />
        <StatCard 
          title={t('stats_total_requests')} 
          value={stats.totalRequests} 
          icon={ShoppingCart} 
          color="bg-indigo-500"
          trend={-5}
        />
        <StatCard 
          title={t('stats_total_value')} 
          value={formatCurrency(stats.totalOffersValue)} 
          icon={DollarSign} 
          color="bg-emerald-500"
          trend={8}
        />
        <StatCard 
          title={t('stats_sold_items')} 
          value={stats.soldItems} 
          icon={TrendingUp} 
          color="bg-amber-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recent Activity</h2>
            <button 
              onClick={() => navigate('/my-offers')}
              className="text-primary font-semibold text-sm hover:underline"
            >
              View All
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
            {loading ? (
              <div className="p-12 flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={32} />
              </div>
            ) : recentActivity.length > 0 ? (
              recentActivity.map((item, i) => (
                <div key={i} className="p-4 border-b border-slate-100 last:border-0 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                      {item.type === 'offer' ? <Package size={20} /> : <ShoppingCart size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{item["English name"]}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(item.created_at).toLocaleDateString()} • {item.type === 'offer' ? 'New Offer' : 'New Request'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{item.price ? formatCurrency(item.price) : `${item.Quantity} units`}</p>
                    <p className="text-[10px] text-emerald-600 font-bold uppercase">Active</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-slate-500">
                {error ? 'Failed to load activity' : 'No recent activity found.'}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-3">
            <button 
              onClick={() => console.log('Near Expiry Alert clicked')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group text-start"
            >
              <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Near Expiry Alert</p>
                <p className="text-xs text-slate-500">Check items expiring soon</p>
              </div>
            </button>
            <button 
              onClick={() => console.log('Optimization Tips clicked')}
              className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl hover:border-primary hover:shadow-md transition-all group text-start"
            >
              <div className="p-3 rounded-xl bg-slate-100 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <TrendingUp size={24} />
              </div>
              <div>
                <p className="font-bold text-slate-900">Optimization Tips</p>
                <p className="text-xs text-slate-500">Increase sales with discounts</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
