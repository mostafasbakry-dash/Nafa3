export const EGYPT_CITIES = [
  "Cairo", "Giza", "Alexandria", "Dakahlia", "Red Sea", "Beheira", "Fayoum", "Gharbia", "Ismailia", "Monufia", "Minya", "Qalyubia", "New Valley", "Sharqia", "Suez", "Aswan", "Assiut", "Beni Suef", "Port Said", "Damietta", "South Sinai", "Kafr El Sheikh", "Matrouh", "Luxor", "Qena", "North Sinai", "Sohag"
].sort();

export interface Drug {
  id: string;
  barcode: string;
  name_en: string;
  name_ar: string;
  price: number;
  manufacturer?: string;
}

export interface PharmacyProfile {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  license_no: string;
  email: string;
  telegram_id: string;
  profile_pic?: string;
}

export interface Offer {
  id: string;
  "Pharmacy ID": string;
  drug_id: string;
  "English name": string;
  "Arabic Name": string;
  barcode: string;
  "Expiry date": string;
  discount: number;
  price: number;
  Quantity: number;
  city: string;
  pharmacy_name: string;
  pharmacy_address: string;
  created_at: string;
}

export interface Request {
  id: string;
  "Pharmacy ID": string;
  drug_id: string;
  "English name": string;
  "Arabic Name": string;
  barcode: string;
  Quantity: number;
  created_at: string;
}
