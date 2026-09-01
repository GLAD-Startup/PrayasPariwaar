import Link from "next/link";
import { Phone, Droplet, Heart, Trees, Award, Newspaper, BookOpen, Stethoscope } from "lucide-react";
import Navbar from "@/components/Navbar";
import SmoothScroll from "@/components/SmoothScroll";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <div className="flex flex-col min-h-screen bg-prayas-paper text-prayas-ink">
        {/* Enhanced Masthead & Header Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

      {/* Grounded Institutional Footer */}
      <footer className="bg-[#1C2421] text-[#EFECE6] pt-12 sm:pt-14 pb-10 border-t border-prayas-rule">
        <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 2xl:gap-12 pb-12 border-b border-[#2C3632]">
            {/* Column 1: Institutional Statement */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/95 shadow-sm inline-block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/prayas-logo.png"
                    alt="Prayas Pariwaar - A Trial to Move Ahead"
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-sm text-[#A0ACA6] leading-relaxed">
                An 18-year-old registered grassroots society in Vrindavan, dedicated to selfless community service (Nishkam Seva) across Mathura district in education, blood coordination, medical equipment lending, and environmental restoration.
              </p>
              <div className="pt-1 text-xs text-[#82908A] space-y-1 font-mono">
                <p>Society Reg: 142/2006-07 (Mathura)</p>
                <p>Income Tax: 12A & 80G Certified</p>
                <p>NITI Aayog Darpan: UP/2017/0154210</p>
              </div>
            </div>

            {/* Column 2: Direct Programs */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-4 pb-1 border-b border-[#2C3632]">
                Our Core Programs
              </h4>
              <ul className="space-y-2 text-sm text-[#A0ACA6]">
                <li>
                  <Link href="/blood-donation" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Droplet className="w-3.5 h-3.5 text-red-400" />
                    24/7 Emergency Blood Registry
                  </Link>
                </li>
                <li>
                  <Link href="/medical-equipment" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Stethoscope className="w-3.5 h-3.5 text-emerald-400" />
                    Free Medical Equipment Bank
                  </Link>
                </li>
                <li>
                  <Link href="/projects/aashayein-education" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                    Project Aashayein (Child Education)
                  </Link>
                </li>
                <li>
                  <Link href="/projects/vrindavan-harit-kranti" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Trees className="w-3.5 h-3.5 text-green-400" />
                    Harit Kranti (Native Tree Plantation)
                  </Link>
                </li>
                <li>
                  <Link href="/projects/jan-swasthya-raksha" className="hover:text-white transition-colors">
                    Jan Swasthya Health Camps
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Institutional Links */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-4 pb-1 border-b border-[#2C3632]">
                Organization & Press
              </h4>
              <ul className="space-y-2 text-sm text-[#A0ACA6]">
                <li>
                  <Link href="/about" className="hover:text-white transition-colors">
                    18-Year Legacy & Team
                  </Link>
                </li>
                <li>
                  <Link href="/about/awards" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    Awards & Empanelment
                  </Link>
                </li>
                <li>
                  <Link href="/media" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Newspaper className="w-3.5 h-3.5 text-blue-400" />
                    Media Centre & Press Clips
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Field Dispatches & Events
                  </Link>
                </li>
                <li>
                  <Link href="/volunteer" className="hover:text-white transition-colors">
                    Volunteer Application
                  </Link>
                </li>
                <li>
                  <Link href="/partner/corporate" className="hover:text-white transition-colors">
                    Corporate & CSR Partnerships
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Registered Office */}
            <div>
              <h4 className="font-serif text-sm font-semibold text-white mb-4 pb-1 border-b border-[#2C3632]">
                Registered Seva Karyalaya
              </h4>
              <div className="space-y-2.5 text-sm text-[#A0ACA6]">
                <p className="leading-relaxed">
                  Near Raman Reti, Parikrama Marg,<br />
                  Vrindavan, Mathura District,<br />
                  Uttar Pradesh — 281121, India
                </p>
                <div className="pt-2 space-y-1 text-xs">
                  <p><strong className="text-white">Blood Coordinator:</strong> +91 94122 79000</p>
                  <p><strong className="text-white">Equipment Bank:</strong> +91 98971 23456</p>
                  <p><strong className="text-white">Email:</strong> contact@prayaspariwaar.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Transparency Notice */}
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#82908A] gap-4">
            <p>© {new Date().getFullYear()} Prayas Pariwaar. All community contributions are strictly 80G tax-exempted.</p>
            <div className="flex items-center gap-5">
              <Link href="/about" className="hover:text-white">
                Transparency & Governance
              </Link>
              <Link href="/contact" className="hover:text-white">
                Contact Office
              </Link>
              <Link href="/admin/login" className="hover:text-white">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
    </SmoothScroll>
  );
}
