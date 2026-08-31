import { PhoneCall, Mail, MapPin, Clock, ShieldAlert } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">
          GET IN TOUCH WITH PRAYAS
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-display text-slate-900 leading-tight">
          24/7 Helpline & Office Directory
        </h1>
        <p className="text-slate-600 text-sm sm:text-base">
          Reach our emergency blood coordination desk or equipment facility anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-red-600 text-white rounded-2xl p-8 space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold">24/7 Emergency Blood Helpline</h3>
          <p className="text-xs text-red-100 leading-relaxed">
            Direct priority line for ICU doctors, hospital attendants, and urgent blood inquiries.
          </p>
          <a
            href="tel:+919876543210"
            className="inline-block text-2xl font-black font-display tracking-wide hover:underline"
          >
            +91 98765 43210
          </a>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <MapPin className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Seva Kendra & Bank</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Prayas Seva Bhawan, Main Tonk Road, Near Civil Lines, Jaipur, Rajasthan 302001.
          </p>
          <p className="text-xs text-slate-400">Open 9:00 AM – 8:00 PM for equipment pickup.</p>
        </div>

        <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Email & Inquiries</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            General Inquiries: contact@prayas-sanstha.org
          </p>
          <p className="text-xs text-slate-600 leading-relaxed">
            80G Receipt Support: receipts@prayas-sanstha.org
          </p>
        </div>
      </div>
    </div>
  );
}
