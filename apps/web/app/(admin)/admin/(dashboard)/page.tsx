import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Droplet,
  Stethoscope,
  Users,
  Heart,
  ArrowUpRight,
  Building2,
  Bell,
  Image as ImageIcon,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FolderPlus,
  Plus,
  HeartHandshake,
} from "lucide-react";

import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

async function getGalleryOverview() {
  if ((prisma as any).galleryPhoto && (prisma as any).galleryAlbum) {
    try {
      const [photosCount, albumsCount, recentPhotos] = await Promise.all([
        (prisma as any).galleryPhoto.count(),
        (prisma as any).galleryAlbum.count(),
        (prisma as any).galleryPhoto.findMany({ take: 6, orderBy: { createdAt: "desc" } }),
      ]);
      return { photosCount, albumsCount, recentPhotos: recentPhotos || [] };
    } catch (e) {}
  }

  try {
    const storagePath = path.join(process.cwd(), "public", "uploads", "gallery-data.json");
    if (fs.existsSync(storagePath)) {
      const data = JSON.parse(fs.readFileSync(storagePath, "utf-8"));
      return {
        photosCount: data.photos?.length || 0,
        albumsCount: data.albums?.length || 0,
        recentPhotos: (data.photos || []).slice(0, 6),
      };
    }
  } catch (e) {}

  return { photosCount: 0, albumsCount: 3, recentPhotos: [] };
}

export default async function AdminDashboardPage() {
  const [
    pendingBloodCount,
    totalDonorsCount,
    pendingEquipmentCount,
    pendingVolunteersCount,
    pendingInquiriesCount,
    unreadMessagesCount,
    donationsAggregate,
    recentBloodRequests,
    recentVolunteers,
    totalEquipmentCount,
    availableEquipmentCount,
    galleryOverview,
  ] = await Promise.all([
    prisma.bloodRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.user.count({ where: { bloodGroup: { not: null } } }).catch(() => 0),
    prisma.equipmentRequest.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.volunteer.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.partnershipInquiry.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.contactMessage.count({ where: { isRead: false } }).catch(() => 0),
    prisma.donation.aggregate({
      _sum: { amount: true },
      where: { status: "SUCCESS" },
    }).catch(() => ({ _sum: { amount: 0 } })),
    prisma.bloodRequest.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.volunteer.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
    }).catch(() => []),
    prisma.medicalEquipment.count().catch(() => 0),
    prisma.medicalEquipment.count({ where: { status: "AVAILABLE" } }).catch(() => 0),
    getGalleryOverview(),
  ]);

  const galleryPhotosCount = galleryOverview.photosCount;
  const galleryAlbumsCount = galleryOverview.albumsCount;
  const recentGalleryPhotos = galleryOverview.recentPhotos;

  const totalDonations = donationsAggregate._sum?.amount || 0;
  const totalEquipment = totalEquipmentCount;
  const availableEquipment = availableEquipmentCount;

  const kpis = [
    {
      title: "Blood Requests",
      count: pendingBloodCount,
      subtitle: pendingBloodCount > 0 ? "Requires active matching" : "All cases matched",
      href: "/admin/blood-requests",
      icon: Droplet,
      accent: "text-rose-600",
      bgAccent: "bg-rose-50 border-rose-200",
      pill: pendingBloodCount > 0 ? `${pendingBloodCount} Pending` : "Clear",
      pillColor: pendingBloodCount > 0 ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      title: "Voluntary Donors",
      count: totalDonorsCount,
      subtitle: `${totalDonorsCount} Registered in Registry`,
      href: "/admin/blood-donors",
      icon: HeartHandshake,
      accent: "text-rose-600",
      bgAccent: "bg-rose-50 border-rose-200",
      pill: "Registry",
      pillColor: "bg-rose-100 text-rose-800 border-rose-200",
    },
    {
      title: "Equipment Leases",
      count: pendingEquipmentCount,
      subtitle: `${availableEquipment}/${totalEquipment} units available`,
      href: "/admin/equipment",
      icon: Stethoscope,
      accent: "text-emerald-700",
      bgAccent: "bg-emerald-50 border-emerald-200",
      pill: "Medical Bank",
      pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      title: "Volunteer Roster",
      count: pendingVolunteersCount,
      subtitle: "New seva applications",
      href: "/admin/volunteers",
      icon: Users,
      accent: "text-amber-700",
      bgAccent: "bg-amber-50 border-amber-200",
      pill: pendingVolunteersCount > 0 ? "Review Needed" : "Updated",
      pillColor: "bg-amber-100 text-amber-800 border-amber-200",
    },
    {
      title: "Photo Gallery Hub",
      count: galleryPhotosCount,
      subtitle: `${galleryAlbumsCount} Seva Albums Created`,
      href: "/admin/gallery",
      icon: ImageIcon,
      accent: "text-emerald-700",
      bgAccent: "bg-emerald-50 border-emerald-200",
      pill: "Field Media",
      pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
    {
      title: "Total Seva Funds",
      count: `₹${totalDonations.toLocaleString("en-IN")}`,
      subtitle: "Direct Grassroots Impact",
      href: "/admin/donations",
      icon: Heart,
      accent: "text-emerald-700",
      bgAccent: "bg-emerald-50 border-emerald-200",
      pill: "Contributions",
      pillColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* 1. Header Banner */}
      <div className="border border-prayas-rule bg-white rounded-2xl p-6 2xl:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>24/7 Operations Desk • Vrindavan & Mathura District</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl 2xl:text-4xl font-bold text-prayas-ink">
            Administrative Operations & Dispatch Desk
          </h1>
          <p className="text-xs sm:text-sm text-prayas-muted leading-relaxed">
            Real-time management of emergency voluntary blood coordination, medical equipment lending, volunteer taskforce, and field photo gallery.
          </p>
        </div>

        {/* Quick Actions in Header */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            href="/admin/gallery"
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all shadow-md flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" />
            <span>Upload Photo</span>
          </Link>

          <Link
            href="/gallery"
            target="_blank"
            className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-prayas-rule bg-prayas-stone hover:bg-white text-prayas-ink transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Public Gallery</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 2. Top Metric KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5 sm:gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Link
              key={idx}
              href={kpi.href}
              className="border border-prayas-rule bg-white hover:border-[#2E5339]/50 rounded-2xl p-4 sm:p-4.5 2xl:p-5 shadow-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between space-y-3 group"
            >
              <div className="flex items-start justify-between gap-1">
                <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${kpi.bgAccent} border flex items-center justify-center ${kpi.accent} group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full border uppercase tracking-wider truncate max-w-[100px] ${kpi.pillColor}`}>
                  {kpi.pill}
                </span>
              </div>

              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-prayas-muted block truncate">
                  {kpi.title}
                </span>
                <p className="font-serif text-xl sm:text-2xl 2xl:text-3xl font-bold text-prayas-ink group-hover:text-[#2E5339] transition-colors">
                  {kpi.count}
                </p>
                <span className="text-[11px] text-prayas-muted block truncate">
                  {kpi.subtitle}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. Main Dashboard Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 2xl:gap-8">
        {/* Left Column (8 Cols): Recent Blood Queue + Live Photos Stream */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-prayas-rule pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-prayas-crimson">
                  <Droplet className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <h2 className="font-serif text-base sm:text-lg font-bold text-prayas-ink">
                    Emergency Blood Requirements Desk
                  </h2>
                  <p className="text-[11px] text-prayas-muted">
                    Recent hospital blood cases logged across Mathura & Vrindavan
                  </p>
                </div>
              </div>

              <Link
                href="/admin/blood-requests"
                className="inline-flex items-center gap-1.5 text-xs text-prayas-crimson font-bold hover:underline self-start sm:self-auto"
              >
                <span>Manage Full Queue ({pendingBloodCount})</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {recentBloodRequests.length === 0 ? (
              <div className="py-12 text-center text-prayas-muted text-xs space-y-2">
                <CheckCircle2 className="w-8 h-8 text-prayas-neem mx-auto" />
                <p className="font-bold text-prayas-ink">All verified hospital blood requirements are met</p>
                <p>No active emergencies pending in queue.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-prayas-ink">
                  <thead className="bg-prayas-stone border-y border-prayas-rule text-prayas-muted uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Patient & Hospital</th>
                      <th className="py-3 px-3">Blood Group</th>
                      <th className="py-3 px-3">Urgency</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-prayas-rule">
                    {recentBloodRequests.map((item) => {
                      const isCritical = item.urgency === "CRITICAL";
                      return (
                        <tr key={item.id} className="hover:bg-prayas-stone/40 transition-colors">
                          <td className="py-3 px-3">
                            <div className="font-bold text-prayas-ink">{item.patientName}</div>
                            <div className="text-[11px] text-prayas-muted flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span>{item.hospitalName}, {item.city}</span>
                            </div>
                          </td>

                          <td className="py-3 px-3">
                            <span className="font-mono font-bold text-prayas-crimson bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                              {item.bloodGroup.replace("_", "+")}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isCritical ? "bg-red-100 text-red-900 border border-red-200 animate-pulse" : "bg-amber-50 text-amber-900 border border-amber-200"
                            }`}>
                              {item.urgency}
                            </span>
                          </td>

                          <td className="py-3 px-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              item.status === "PENDING"
                                ? "bg-amber-100 text-amber-900 border border-amber-200"
                                : item.status === "APPROVED"
                                ? "bg-blue-100 text-blue-900 border border-blue-200"
                                : "bg-emerald-100 text-emerald-900 border border-emerald-200"
                            }`}>
                              {item.status.replace("_", " ")}
                            </span>
                          </td>

                          <td className="py-3 px-3 font-mono text-[11px] text-slate-600">
                            {item.contactPhone}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DYNAMIC UPLOADED PHOTO GALLERY SECTION ON DASHBOARD */}
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 sm:p-6 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-prayas-ink">
                    Uploaded Photo Gallery Archive ({galleryPhotosCount} photos)
                  </h3>
                  <p className="text-[11px] text-prayas-muted">
                    Recent field photos uploaded to Seva albums
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/admin/gallery"
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 text-white hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Upload More</span>
                </Link>
                <Link
                  href="/gallery"
                  target="_blank"
                  className="text-xs text-emerald-800 font-bold hover:underline hidden sm:inline"
                >
                  View Public Page →
                </Link>
              </div>
            </div>

            {recentGalleryPhotos.length === 0 ? (
              <div className="p-8 text-center text-xs text-prayas-muted bg-prayas-stone/20 rounded-xl space-y-2">
                <ImageIcon className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="font-bold text-prayas-ink">No photos uploaded yet</p>
                <p>Click "Upload More" above to add on-ground seva photos to the public gallery.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {recentGalleryPhotos.map((photo: any) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-prayas-rule bg-prayas-stone shadow-sm group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.url}
                      alt={photo.title || "Seva Photo"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-2 flex flex-col justify-end text-white text-[9px]">
                      <span className="font-bold line-clamp-1">{photo.title || photo.category}</span>
                      <span className="text-slate-300">{photo.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (4 Cols): Volunteers + Seva Karyalaya Status */}
        <div className="lg:col-span-4 space-y-6">
          <div className="border border-prayas-rule bg-white rounded-2xl p-5 shadow-card space-y-4">
            <div className="flex items-center justify-between border-b border-prayas-rule pb-3">
              <h3 className="font-serif text-sm font-bold text-prayas-ink flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                <span>Recent Volunteer Applicants</span>
              </h3>
              <Link
                href="/admin/volunteers"
                className="text-[11px] text-amber-700 font-bold hover:underline"
              >
                View All →
              </Link>
            </div>

            {recentVolunteers.length === 0 ? (
              <p className="text-xs text-prayas-muted py-4 text-center">
                No recent volunteer applications.
              </p>
            ) : (
              <div className="space-y-3">
                {recentVolunteers.map((vol) => (
                  <div
                    key={vol.id}
                    className="p-3 rounded-xl bg-prayas-stone/50 border border-prayas-rule space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between font-bold text-prayas-ink">
                      <span>{vol.name}</span>
                      <span className="text-[10px] text-prayas-muted font-normal">
                        {(Array.isArray(vol.areasOfInterest) && vol.areasOfInterest[0]) || vol.city || "Vrindavan"}
                      </span>
                    </div>
                    <p className="text-[11px] text-prayas-muted truncate">
                      {vol.email} • {vol.phone}
                    </p>
                    <div className="pt-1 flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        {vol.skills ? vol.skills.split(",")[0] : "Education Seva"}
                      </span>
                      <span className="text-slate-400">
                        {new Date(vol.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Seva Karyalaya Status Notice */}
          <div className="border border-emerald-900/20 bg-[#1C2421] text-white rounded-2xl p-5 shadow-card space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4" />
              <span>Vrindavan Headquarters Desk</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Prayas Pariwaar Seva Karyalaya (Near Raman Reti, Parikrama Marg) operates daily from 8:00 AM to 8:00 PM for medical equipment dispatches and blood matching.
            </p>
            <div className="pt-2 border-t border-slate-700/80 text-[11px] text-slate-400 space-y-1 font-mono">
              <p>Helpline: +91 94122 79000</p>
              <p>Equipment Desk: +91 98971 23456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
