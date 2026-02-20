import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

const resources = {
  en: {
    translation: {
      "app_name": "Nafa3",
      "tagline": "Professional Dead-Stock Exchange",
      "login": "Login",
      "register": "Register",
      "logout": "Logout",
      "dashboard": "Dashboard",
      "marketplace": "Marketplace",
      "my_offers": "My Offers",
      "my_requests": "My Requests",
      "profile": "Profile",
      "settings": "Settings",
      "search_placeholder": "Search by name or barcode...",
      "add_offer": "Add Offer",
      "add_request": "Add Request",
      "city": "City",
      "discount": "Discount",
      "expiry_date": "Expiry Date",
      "pharmacy_name": "Pharmacy Name",
      "address": "Address",
      "phone": "Phone",
      "license_no": "License No",
      "telegram_id": "Telegram ID",
      "save": "Save",
      "cancel": "Cancel",
      "edit": "Edit",
      "delete": "Delete",
      "bulk_upload": "Bulk Upload",
      "download_template": "Download Template",
      "language": "Language",
      "arabic": "العربية",
      "english": "English",
      "stats_total_offers": "Total Offers",
      "stats_total_requests": "Total Requests",
      "stats_total_value": "Total Value",
      "stats_sold_items": "Sold Items",
      "egp": "EGP",
      "near_expiry": "Near Expiry",
      "warning_duplicate": "A drug with the same barcode and expiry date already exists.",
      "success_added": "Added successfully",
      "error_generic": "Something went wrong",
      "city_placeholder": "Select City",
      "all_cities": "All Cities"
    }
  },
  ar: {
    translation: {
      "app_name": "نافع",
      "tagline": "منصة تبادل الأدوية الراكدة",
      "login": "تسجيل الدخول",
      "register": "تسجيل جديد",
      "logout": "تسجيل الخروج",
      "dashboard": "لوحة التحكم",
      "marketplace": "السوق",
      "my_offers": "عروضي",
      "my_requests": "طلباتي",
      "profile": "الملف الشخصي",
      "settings": "الإعدادات",
      "search_placeholder": "ابحث بالاسم أو الباركود...",
      "add_offer": "إضافة عرض",
      "add_request": "إضافة طلب",
      "city": "المدينة",
      "discount": "الخصم",
      "expiry_date": "تاريخ الانتهاء",
      "pharmacy_name": "اسم الصيدلية",
      "address": "العنوان",
      "phone": "رقم الهاتف",
      "license_no": "رقم الترخيص",
      "telegram_id": "معرف تليجرام",
      "save": "حفظ",
      "cancel": "إلغاء",
      "edit": "تعديل",
      "delete": "حذف",
      "bulk_upload": "رفع جماعي",
      "download_template": "تحميل النموذج",
      "language": "اللغة",
      "arabic": "العربية",
      "english": "English",
      "stats_total_offers": "إجمالي العروض",
      "stats_total_requests": "إجمالي الطلبات",
      "stats_total_value": "إجمالي القيمة",
      "stats_sold_items": "العناصر المباعة",
      "egp": "ج.م",
      "near_expiry": "قريب الانتهاء",
      "warning_duplicate": "يوجد دواء بنفس الباركود وتاريخ الانتهاء بالفعل.",
      "success_added": "تمت الإضافة بنجاح",
      "error_generic": "حدث خطأ ما",
      "city_placeholder": "اختر المدينة",
      "all_cities": "كل المدن"
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ar',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
