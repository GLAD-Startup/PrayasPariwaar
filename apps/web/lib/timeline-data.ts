import { GraduationCap, Droplet, Trees, ShieldCheck, Award } from "lucide-react";

export type MilestoneCategory = "all" | "education" | "health" | "plantation" | "institutional";

export interface TimelineMilestone {
  id: string;
  year: number;
  dateLabel: string;
  category: "education" | "health" | "plantation" | "institutional";
  categoryLabel: string;
  title: string;
  subtitle: string;
  location: string;
  imageUrl: string;
  impactBadge: string;
  summary: string;
  story: string;
  quote?: string;
  keyStats: { label: string; value: string }[];
  highlightTag?: string;
  linkUrl?: string;
  linkLabel?: string;
}

export const MILESTONES: TimelineMilestone[] = [
  {
    id: "m-2011",
    year: 2011,
    dateLabel: "October 2011",
    category: "education",
    categoryLabel: "Free Education",
    title: "First Open-Air Pathshala Under Ancient Banyan Tree",
    subtitle: "Informal evening study circle for riverbank boatmen and daily-wage families",
    location: "Kesi Ghat, Yamuna Bank, Vrindavan",
    imageUrl: "/images/timeline/timeline-2011-pathshala.jpg",
    impactBadge: "18 Children • 3 Student Volunteers",
    summary:
      "With kerosene lanterns, slates, and wooden chalk, local university students started an evening gathering teaching Hindi literacy and arithmetic to out-of-school children along Kesi Ghat.",
    story:
      "Prayas began not in a conference hall, but under the sprawling canopy of an ancient banyan tree overlooking the Yamuna river. Three local college students noticed young children spending their evenings begging or assisting boatmen. Instead of distributing spare coins, the youth brought jute mats, slates, and wooden chalk pencils. Within weeks, eighteen children were memorizing Hindi alphabets and multiplication tables every dusk as evening temple aarti bells echoed across the river.",
    quote: "Education is not charity; it is lighting an indestructible torch in the dark.",
    keyStats: [
      { label: "Initial Learners", value: "18 Children" },
      { label: "Teaching Mode", value: "Slates & Jute Mats" },
      { label: "Founding Sevadars", value: "3 Volunteers" },
    ],
    highlightTag: "Genesis of Seva",
    linkUrl: "/projects/aashayein-education",
    linkLabel: "Support Project Aashayein",
  },
  {
    id: "m-2013",
    year: 2013,
    dateLabel: "March 2013",
    category: "education",
    categoryLabel: "Free Education",
    title: "Establishment of 3 Dedicated Evening Learning Centers",
    subtitle: "Transitioning to structured tuition, free textbooks, and daily nutrition",
    location: "Raman Reti & Village Chhatikara",
    imageUrl: "/images/timeline/timeline-2013-centers.jpg",
    impactBadge: "120+ Daily Learners • Free School Bags & Meals",
    summary:
      "Scaled from an open-air gathering into three permanent evening study circles with syllabus tracking, free textbooks, school bags, and nutritious mid-day milk and snacks.",
    story:
      "As word spread among village households, parents who worked daily construction shifts requested evening learning circles for their older children. Prayas secured community verandas in Raman Reti and Chhatikara. Volunteer mentors established structured assessments, helping children achieve age-appropriate grade levels so they could pass formal government school entrance exams.",
    quote: "Every child should return home with curiosity ignited and stomach full.",
    keyStats: [
      { label: "Daily Students", value: "120+ Children" },
      { label: "Learning Centers", value: "3 Village Hubs" },
      { label: "Nutritional Support", value: "Daily Milk & Fruits" },
    ],
    linkUrl: "/projects/aashayein-education",
    linkLabel: "Explore Study Centers",
  },
  {
    id: "m-2015",
    year: 2015,
    dateLabel: "July 2015",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Launch of 24/7 Emergency Blood Coordination Desk",
    subtitle: "Dedicated round-the-clock voluntary donor dispatch across Mathura district hospitals",
    location: "District Combined Hospital & Sevashrama, Mathura",
    imageUrl: "/images/timeline/timeline-2015-blood-desk.jpg",
    impactBadge: "500+ Donors Enrolled • 45-Min Response Window",
    summary:
      "Initiated a volunteer-operated emergency helpline connecting critical accident trauma cases and high-risk maternity patients with matched voluntary blood donors within 45 minutes.",
    story:
      "Witnessing poor families desperately pleading for rare blood units at hospital counters during late-night emergencies, Prayas volunteers pooled personal telephone directories to form Mathura's first organized emergency donor response desk. The network operates 24/7 with zero fees, mobilizing healthy youth who donate directly at Ramakrishna Mission and District Combined Hospital.",
    quote: "Blood cannot be made in factories; it can only flow from one human heart to another.",
    keyStats: [
      { label: "Registered Donors", value: "500+ Donors" },
      { label: "Avg. Arrival Time", value: "< 45 Minutes" },
      { label: "Cost to Patient", value: "₹0 (100% Free)" },
    ],
    highlightTag: "Lifeline of Braj",
    linkUrl: "/blood-donation",
    linkLabel: "Register as Blood Donor",
  },
  {
    id: "m-2017",
    year: 2017,
    dateLabel: "August 2017",
    category: "plantation",
    categoryLabel: "Ecology & Green Vrindavan",
    title: "Vrindavan Harit Kranti: Parikrama Green Canopy",
    subtitle: "Mass community plantation of native Neem, Peepal, and Kadamba with protective iron cages",
    location: "Braj Parikrama Marg, Vrindavan",
    imageUrl: "/images/timeline/timeline-2017-plantation.jpg",
    impactBadge: "2,500+ Native Trees • 92% Survival Rate",
    summary:
      "Launched systematic afforestation along the sacred 12-kilometer pilgrimage route, pairing every native sapling with an iron tree-guard and neighborhood water stewards.",
    story:
      "Decades of unchecked construction had depleted the ancient green groves (vanas) that define Vrindavan's spiritual ecology. Prayas mobilized shopkeepers, local sadhus, and youth volunteers to dig pits and plant deep-root indigenous species — Neem, Peepal, Pilu, and Kadamba. Unlike symbolic tree plantation drives, Prayas maintained year-round watering rotas and fabricated protective iron guards, achieving an extraordinary 92% survival rate.",
    quote: "Restoring the sacred groves of Braj is our generational offering to the earth.",
    keyStats: [
      { label: "Native Trees Planted", value: "2,500+ Saplings" },
      { label: "Protective Guards", value: "1,800+ Iron Cages" },
      { label: "Survival Rate", value: "92% Verified" },
    ],
    linkUrl: "/projects/vrindavan-harit-kranti",
    linkLabel: "Adopt a Sacred Tree",
  },
  {
    id: "m-2019",
    year: 2019,
    dateLabel: "November 2019",
    category: "institutional",
    categoryLabel: "Trust & Governance",
    title: "Conferred Rotary Seva Ratna & Income Tax 12A Certification",
    subtitle: "Independent chartered audits and formal state empanelment as premier grassroots society",
    location: "Mathura District Headquarters",
    imageUrl: "/images/timeline/timeline-2019-award.jpg",
    impactBadge: "12A Certified • NITI Aayog • Seva Ratna",
    summary:
      "Achieved statutory empanelment under NITI Aayog NGO Darpan and Section 12A non-profit certification, accompanied by the prestigious Rotary Seva Ratna honor.",
    story:
      "Prayas cemented its non-negotiable constitution: 100% of all public donations are allocated directly to program beneficiaries (students, patients, and tree plantation) with zero administrative cuts deducted. Operational expenses, phone bills, and logistics are funded exclusively by founding trustees and lifetime patrons. This radical transparency earned institutional accolades and formal 12A non-profit standing.",
    quote: "Public trust is not demanded; it is painstakingly earned day after day.",
    keyStats: [
      { label: "Statutory Status", value: "12A Registered" },
      { label: "Admin Deductions", value: "0% Always" },
      { label: "NITI Darpan ID", value: "UP/2017/0154210" },
    ],
    linkUrl: "/about",
    linkLabel: "Read Governance Audit",
  },
  {
    id: "m-2020",
    year: 2020,
    dateLabel: "April 2020 – June 2021",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "COVID-19 Emergency Oxygen & Doorstep Ration Lifeline",
    subtitle: "Doorstep delivery of 85+ oxygen machines and 10,000+ grocery kits for widows and daily-wage families",
    location: "Vrindavan Town, Ashrams & Yamuna Khadar",
    imageUrl: "/images/timeline/timeline-2020-covid-relief.jpg",
    impactBadge: "85 Oxygen Units • 10,000+ Ration Kits • 24/7 Relief",
    summary:
      "During catastrophic pandemic waves, volunteer taskforces rushed free oxygen concentrators on motorbikes to suffocating patients and delivered dry food kits to isolated ashrams.",
    story:
      "When the nationwide lockdown halted public transport and overwhelmed regional hospitals, oxygen cylinders vanished across northern India. Prayas set up an emergency sanitization and dispatch hub in Vrindavan. Young sevadars wore masks and carried 10L oxygen machines through cramped historic alleys to elderly sadhus and impoverished families, saving hundreds of lives in critical home care without charging a single rupee.",
    quote: "When the streets went silent, Nishkam Seva stood awake.",
    keyStats: [
      { label: "Oxygen Machines Lent", value: "85 Units" },
      { label: "Dry Ration Kits", value: "10,000+ Bags" },
      { label: "Days on Frontline", value: "420+ Continuous" },
    ],
    highlightTag: "Pandemic Heroism",
    linkUrl: "/medical-equipment",
    linkLabel: "View Equipment Bank",
  },
  {
    id: "m-2022",
    year: 2022,
    dateLabel: "September 2022",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Jan Swasthya Raksha: Rural Diagnostics & Cataract Care",
    subtitle: "Monthly rural medical camps offering free screenings, medicines, and surgical referrals",
    location: "Village Chhatikara, Govardhan & Barsana",
    imageUrl: "/images/timeline/timeline-2022-eye-camp.jpg",
    impactBadge: "3,200+ Patients Examined • 480 Free Spectacles",
    summary:
      "Partnered with specialist doctors to conduct recurring village clinics providing diagnostic checks, diabetes monitoring, pediatric vitamins, and sponsored cataract surgeries.",
    story:
      "For elderly villagers and agricultural laborers living on subsistence wages, traveling to a private hospital for eye tests or chronic blood sugar management was an insurmountable cost. Prayas brought visiting physicians, diagnostic test kits, and free prescription glasses straight to village primary schools, restoring clear sight and health dignity.",
    quote: "Health is the very bedrock of human self-respect.",
    keyStats: [
      { label: "Patients Treated", value: "3,200+ Rural Villagers" },
      { label: "Spectacles Distributed", value: "480 Free Pairs" },
      { label: "Cataract Surgeries", value: "115 Sponsored" },
    ],
    linkUrl: "/projects/jan-swasthya-raksha",
    linkLabel: "Sponsor Medical Camp",
  },
  {
    id: "m-2024",
    year: 2024,
    dateLabel: "January 2024",
    category: "institutional",
    categoryLabel: "Youth & Livelihoods",
    title: "Mathura District Seva Samman & Vocational Skills Guild",
    subtitle: "Conferred highest district civic award; launching vocational stitching and computer lab",
    location: "Mathura Collectorate & Vrindavan Center",
    imageUrl: "/images/timeline/timeline-2024-skills-guild.jpg",
    impactBadge: "DM Seva Samman • 240+ Youth Empowered",
    summary:
      "Conferred the prestigious Seva Samman by the District Magistrate of Mathura, followed by the launch of a digital literacy and vocational training lab for rural youth.",
    story:
      "At the Republic Day ceremony, the District Magistrate of Mathura honored Prayas Pariwaar with the District Seva Samman for unmatched relief operations and volunteer discipline. Building on this momentum, Prayas inaugurated an adolescent empowerment hub equipped with desktop computers and tailoring stations, helping teenage girls and rural boys secure independent livelihoods.",
    quote: "When a young girl acquires digital skills, she transforms the destiny of her entire lineage.",
    keyStats: [
      { label: "Civic Honor", value: "DM Seva Samman 2024" },
      { label: "Youth Trained", value: "240+ Students" },
      { label: "Vocational Placements", value: "65+ Placements" },
    ],
    linkUrl: "/projects/aadhar-career-counseling",
    linkLabel: "Support Career Guild",
  },
  {
    id: "m-2025",
    year: 2025,
    dateLabel: "May 2025",
    category: "health",
    categoryLabel: "Emergency Blood & Health",
    title: "Permanent Free Medical Equipment Lending Bank",
    subtitle: "Full inventory of hospital Fowler beds, BiPAP machines, and 10L oxygen units at zero rental",
    location: "Central Seva Desk, Mathura-Vrindavan Road",
    imageUrl: "/images/timeline/timeline-2025-equipment-bank.jpg",
    impactBadge: "85+ Devices in Free Circulation • ₹35L+ Saved by Families",
    summary:
      "Institutionalized a district-wide repository where economically vulnerable families borrow expensive ICU-grade medical devices for home recovery at zero cost.",
    story:
      "Commercial equipment rental agencies charge between ₹6,000 and ₹18,000 per month for hospital Fowler beds, BiPAP machines, and suction pumps — driving families into predatory debt during critical illnesses. Prayas acquired a permanent inventory of 85+ heavy-duty homecare machines that are delivered and installed in patients' homes with zero rental charge.",
    quote: "No family in Braj should ever fall into poverty just to afford a hospital bed for their elder.",
    keyStats: [
      { label: "Devices in Circulation", value: "85+ Heavy Devices" },
      { label: "Families Supported", value: "450+ Homes" },
      { label: "Commercial Cost Saved", value: "₹35,00,000+" },
    ],
    linkUrl: "/medical-equipment",
    linkLabel: "Request Free Equipment",
  },
  {
    id: "m-2026",
    year: 2026,
    dateLabel: "Present Milestone • 2026",
    category: "education",
    categoryLabel: "Smart Education & Modern Platform",
    title: "Solar Smart Classrooms & Unified Digital NGO Platform",
    subtitle: "Blending 15 years of sacred grassroots tradition with transparent modern technology",
    location: "Barsana, Vrindavan & All Mathura District",
    imageUrl: "/images/timeline/timeline-2026-smart-pathshala.jpg",
    impactBadge: "320+ Daily Students • 8,200+ Blood Units • 5,400+ Trees",
    summary:
      "Equipping rural learning centers with solar power and interactive STEM tablets, synchronized with an automated real-time web portal and mobile app for instant emergency blood matching.",
    story:
      "Fifteen years after three college students unfolded a jute mat under a banyan tree, Prayas Pariwaar reaches its landmark era in 2026. Rural learning centers are now powered by clean solar energy with interactive tablets where village children solve math puzzles, code basic logic, and read digital encyclopedias. Simultaneously, our real-time platform matches emergency blood donors within minutes across Uttar Pradesh.",
    quote: "From slates under the sacred banyan in 2011 to solar smart classrooms in 2026: Nishkam Seva never stops.",
    keyStats: [
      { label: "Daily Tutored Children", value: "320+ Students" },
      { label: "Emergency Blood Units", value: "8,200+ Units" },
      { label: "Native Trees Thriving", value: "5,400+ Trees" },
      { label: "Volunteer Sevadars", value: "180+ Active" },
    ],
    highlightTag: "Present Frontier",
    linkUrl: "/donate",
    linkLabel: "Be Part of Our Journey",
  },
];

export function getCategoryStyle(category: TimelineMilestone["category"]) {
  switch (category) {
    case "education":
      return {
        badgeBg: "bg-amber-100 text-amber-900 border-amber-300",
        pillBg: "bg-amber-500",
        textColor: "text-amber-700",
        borderColor: "border-amber-400",
        glow: "shadow-amber-500/20",
        icon: GraduationCap,
      };
    case "health":
      return {
        badgeBg: "bg-rose-100 text-rose-900 border-rose-300",
        pillBg: "bg-rose-500",
        textColor: "text-rose-700",
        borderColor: "border-rose-400",
        glow: "shadow-rose-500/20",
        icon: Droplet,
      };
    case "plantation":
      return {
        badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300",
        pillBg: "bg-emerald-500",
        textColor: "text-emerald-700",
        borderColor: "border-emerald-400",
        glow: "shadow-emerald-500/20",
        icon: Trees,
      };
    case "institutional":
      return {
        badgeBg: "bg-sky-100 text-sky-900 border-sky-300",
        pillBg: "bg-sky-500",
        textColor: "text-sky-700",
        borderColor: "border-sky-400",
        glow: "shadow-sky-500/20",
        icon: ShieldCheck,
      };
    default:
      return {
        badgeBg: "bg-slate-100 text-slate-900 border-slate-300",
        pillBg: "bg-slate-500",
        textColor: "text-slate-700",
        borderColor: "border-slate-400",
        glow: "shadow-slate-500/20",
        icon: Award,
      };
  }
}
