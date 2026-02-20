import React from 'react';
import { useTranslation } from 'react-i18next';
import { Calendar, Tag, MapPin, Building2, ArrowRight } from 'lucide-react';
import { Offer } from '@/src/types';
import { formatCurrency, cn } from '@/src/lib/utils';
import { format } from 'date-fns';

interface OfferCardProps {
  offer: Offer;
  onAction?: (offer: Offer) => void;
  actionLabel?: string;
  isOwner?: boolean;
  [key: string]: any;
}

export const OfferCard = ({ offer, onAction, actionLabel, isOwner }: OfferCardProps) => {
  const { t, i18n } = useTranslation();
  const isRtl = i18n.language === 'ar';
  const isNearExpiry = new Date(offer["Expiry date"]).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 90; // 90 days

  return (
    <div className={cn(
      "bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg transition-all group",
      isNearExpiry && "border-orange-200 bg-orange-50/30"
    )}>
      <div className="p-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-slate-900 group-hover:text-primary transition-colors">
              {isRtl ? offer["Arabic Name"] : offer["English name"]}
            </h3>
            <p className="text-xs font-mono text-slate-400 mt-1">{offer.barcode}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
              {offer.discount}% OFF
            </div>
            {isNearExpiry && (
              <div className="bg-orange-100 text-orange-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider">
                {t('near_expiry')}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={16} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold">{t('expiry_date')}</span>
              <span className="text-sm font-medium">{format(new Date(offer["Expiry date"]), 'MMM yyyy')}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <Tag size={16} className="text-slate-400" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-slate-400 font-bold">{t('price')}</span>
              <span className="text-sm font-bold text-primary">{formatCurrency(offer.price)}</span>
            </div>
          </div>
        </div>

        {!isOwner && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <div className="flex items-start gap-2 text-slate-600">
              <Building2 size={16} className="text-slate-400 mt-1 shrink-0" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{offer.pharmacy_name}</span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin size={12} />
                  <span>{offer.city}, {offer.pharmacy_address}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {onAction && (
          <button
            onClick={() => {
              console.log(`Offer Card Action clicked for offer: ${offer.id}`);
              onAction(offer);
            }}
            className="w-full mt-6 py-3 bg-slate-900 hover:bg-primary text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
          >
            {actionLabel || t('view_details')}
            <ArrowRight size={18} className={cn(isRtl && "rotate-180")} />
          </button>
        )}
      </div>
    </div>
  );
};
