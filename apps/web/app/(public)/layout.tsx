import Link from "next/link";
import Image from "next/image";
import { assetPath } from "../../lib/api";
import { Phone, Droplet, Heart, Trees, Award, Newspaper, BookOpen, Stethoscope, Camera } from "lucide-react";
import Navbar from "../../components/Navbar";
import MobileFooterNav from "../../components/MobileFooterNav";
import SmoothScroll from "../../components/SmoothScroll";
import JsonLd from "../../components/JsonLd";
import { getRootPublicGraph } from "../../lib/schema";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SmoothScroll>
      <JsonLd data={getRootPublicGraph()} />
      <div className="flex flex-col min-h-screen bg-prayas-paper text-prayas-ink">
        {/* Enhanced Masthead & Header Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-grow">{children}</main>

        <MobileFooterNav />

      {/* Grounded Institutional Footer */}
      <footer className="bg-[#1C2421] text-[#EFECE6] pt-12 sm:pt-14 pb-24 lg:pb-10 border-t border-prayas-rule">
        <div className="max-w-7xl 2xl:max-w-[1440px] 3xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 2xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 2xl:gap-12 pb-12 border-b border-[#2C3632]">
            {/* Column 1: Institutional Statement */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-white/95 shadow-sm inline-block">
                  <Image
                    src={assetPath("/images/prayas-logo.png")}
                    alt="Prayas Pariwaar - A Trial to Move Ahead"
                    width={160}
                    height={44}
                    className="h-10 w-auto object-contain"
                  />
                </div>
              </div>
              <p className="text-sm text-[#A0ACA6] leading-relaxed">
                An 18-year-old registered grassroots society in Vrindavan, dedicated to selfless community service (Nishkam Seva) across Mathura district in education, blood coordination, medical equipment lending, and environmental restoration.
              </p>
              <div className="pt-1 text-xs text-[#82908A] space-y-1 font-mono">
                <p>Society Reg: 142/2006-07 (Mathura)</p>
                <p>Income Tax: 12A Registered</p>
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
                  <Link href="/gallery" className="hover:text-white transition-colors flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    Field Seva Photo Gallery
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-white transition-colors">
                    Scheduled & Upcoming Events
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
                  <p><strong className="text-white">Blood Coordinator:</strong> +91 99270 81650</p>
                  <p><strong className="text-white">Equipment Bank:</strong> +91 99270 81650</p>
                  <p><strong className="text-white">Email:</strong> av.prayas@gmail.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Transparency Notice */}
          <div className="pt-8 border-t border-[#2C3632] flex flex-col lg:flex-row items-center justify-between text-xs text-[#82908A] gap-4">
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-center sm:text-left">
              <p>© {new Date().getFullYear()} Prayas Pariwaar. Registered Grassroots Non-Profit Society.</p>
              <span className="hidden sm:inline text-[#47554F]">•</span>
              <div className="inline-flex items-center gap-2 text-xs">
                <span>Developed by</span>
                <a
                  href="https://gladstudio.net"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center transition-all duration-200 hover:scale-105 opacity-90 hover:opacity-100 focus:outline-none"
                  title="GLAD Studio (gladstudio.net)"
                >
                  <Image
                    src={assetPath("/glad-studio-logo.png")}
                    alt="GLAD Studio"
                    width={130}
                    height={36}
                    className="h-6 sm:h-[26px] w-auto object-contain"
                  />
                </a>
              </div>
            </div>

            <div className="flex items-center gap-5">
              <Link href="/about" className="hover:text-white transition-colors">
                Transparency & Governance
              </Link>
              <Link href="/privacy-policy" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/contact" className="hover:text-white transition-colors">
                Contact Office
              </Link>
              <Link href="/admin/login" rel="nofollow" className="hover:text-white transition-colors">
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
