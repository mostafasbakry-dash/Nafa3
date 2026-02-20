import React from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, Bell, Shield, HelpCircle, Info } from 'lucide-react';

export const Settings = () => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    console.log('Toggle Language clicked');
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-slate-900">{t('settings')}</h1>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-900">Preferences</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Languages size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{t('language')}</p>
                  <p className="text-sm text-slate-500">Switch between Arabic and English</p>
                </div>
              </div>
              <button
                onClick={toggleLanguage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold transition-all"
              >
                {i18n.language === 'ar' ? 'English' : 'العربية'}
              </button>
            </div>

            <div className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <Bell size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Notifications</p>
                  <p className="text-sm text-slate-500">Manage your alert preferences</p>
                </div>
              </div>
              <div className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="font-bold text-lg text-slate-900">Support & Legal</h2>
          </div>
          <div className="divide-y divide-slate-100">
            <button 
              onClick={() => console.log('Privacy Policy clicked')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-start"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <Shield size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Privacy Policy</p>
                  <p className="text-sm text-slate-500">How we handle your data</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => console.log('Help Center clicked')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-start"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                  <HelpCircle size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Help Center</p>
                  <p className="text-sm text-slate-500">FAQs and contact support</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => console.log('About Nafa3 clicked')}
              className="w-full p-6 flex items-center justify-between hover:bg-slate-50 transition-colors text-start"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-50 text-slate-600 rounded-xl">
                  <Info size={24} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">About Nafa3</p>
                  <p className="text-sm text-slate-500">Version 1.0.0</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
