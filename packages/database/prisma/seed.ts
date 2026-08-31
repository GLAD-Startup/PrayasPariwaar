import { PrismaClient, Role, BloodGroup, UrgencyLevel, BloodRequestStatus, EquipmentStatus, ProjectCategory, ProjectStatus, PostType, MediaType, VolunteerStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding Prayas Pariwaar database with Vrindavan institutional data...");

  // 1. Clean existing records in dependency order
  await prisma.notification.deleteMany();
  await prisma.postImage.deleteMany();
  await prisma.post.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.project.deleteMany();
  await prisma.equipmentRequest.deleteMany();
  await prisma.medicalEquipment.deleteMany();
  await prisma.bloodRequest.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.partnershipInquiry.deleteMany();
  await prisma.contactMessage.deleteMany();
  await prisma.siteStat.deleteMany();
  await prisma.award.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.mediaCoverage.deleteMany();
  await prisma.page.deleteMany();
  await prisma.pushToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users (Admin, Editor, Coordinators)
  const passwordHash = await bcrypt.hash("admin123", 10);
  const editorHash = await bcrypt.hash("editor123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@prayaspariwaar.com",
      passwordHash,
      name: "Prayas General Secretary",
      phone: "+91 9412279001",
      role: Role.ADMIN,
      city: "Vrindavan",
      bio: "Founding member and general coordinator of Prayas Pariwaar Vrindavan.",
    },
  });

  const editor = await prisma.user.create({
    data: {
      email: "editor@prayaspariwaar.com",
      passwordHash: editorHash,
      name: "Field Seva Coordinator",
      phone: "+91 9897123456",
      role: Role.EDITOR,
      city: "Mathura",
      bio: "Editorial and fieldwork communications lead.",
    },
  });

  console.log("✅ Seeded Admin & Editor users");

  // 3. Static CMS Pages (Mission & Vision, About, Awards Overview)
  await prisma.page.createMany({
    data: [
      {
        slug: "mission-vision",
        title: "Our Mission & Guiding Philosophy",
        content: `Prayas Pariwaar was founded in 2006 by a group of dedicated local citizens and youth in Vrindavan with a single pledge: to provide direct, transparent, and non-commercial assistance to the most vulnerable families across Mathura district.

Our philosophy is rooted in Nishkam Seva (selfless community service). Over the past 18 years, Prayas has evolved from an informal neighborhood support group into a recognized grassroots society managing a 24/7 volunteer blood coordination desk, a free medical equipment bank, regular education assistance for rural children, and native environmental restoration.

Every rupee donated, every unit of blood arranged, and every medical device lent is tracked and accounted for with complete transparency. We operate with zero administrative overhead deducted from public donations.`,
        metaTitle: "Mission & Vision | Prayas Pariwaar Vrindavan",
        metaDescription: "The 18-year legacy of grassroots community service, education, blood donation, and medical assistance in Vrindavan, UP.",
      },
      {
        slug: "about-us",
        title: "18 Years of Grassroots Seva in Vrindavan",
        content: `In 2006, when emergency medical resources and blood availability in Mathura district were scarce, Prayas began as an emergency response network. Volunteers carried handwritten registries of blood donors and delivered spare oxygen cylinders to homebound elderly patients on bicycles and two-wheelers.

Today, Prayas Pariwaar serves as a trusted lifeline for thousands of families across Vrindavan, Mathura, Govardhan, Barsana, and surrounding rural villages. Our operations are completely volunteer-run, supported by local doctors, shopkeepers, educators, and compassionate donors across India.`,
        metaTitle: "About Prayas Pariwaar | 18-Year Community NGO in Mathura District",
        metaDescription: "Learn about the history, team, and grassroots community programs of Prayas Pariwaar in Vrindavan, Uttar Pradesh.",
      },
    ],
  });

  // 4. Live Site Stats
  await prisma.siteStat.createMany({
    data: [
      { label: "Years of Grassroots Service", value: 18, icon: "Clock", order: 1 },
      { label: "Emergency Blood Units Arranged", value: 420, icon: "Heart", order: 2 },
      { label: "Children & Students Supported", value: 1250, icon: "BookOpen", order: 3 },
      { label: "Medical Devices in Free Circulation", value: 85, icon: "ShieldAlert", order: 4 },
      { label: "Native Neem & Peepal Saplings Planted", value: 5400, icon: "Trees", order: 5 },
    ],
  });

  // 5. Featured Projects
  const p1 = await prisma.project.create({
    data: {
      title: "Project Aashayein: Rural & Slum Child Education",
      slug: "aashayein-education",
      category: ProjectCategory.EDUCATION,
      status: ProjectStatus.ACTIVE,
      description: `Project Aashayein supports over 300 children from marginalized families in rural Mathura and semi-urban settlements of Vrindavan. We provide free school supplies, textbooks, uniforms, after-school remedial tutoring, and nutritious mid-day snacks to ensure that poverty never interrupts a child's right to learn.`,
      coverImage: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 350000,
      raisedAmount: 215000,
      createdById: admin.id,
      metaTitle: "Project Aashayein - Child Education in Vrindavan | Prayas Pariwaar",
      metaDescription: "Supporting underprivileged children with education, books, and remedial study centers in Mathura district.",
    },
  });

  const p2 = await prisma.project.create({
    data: {
      title: "Vrindavan Harit Kranti: Native Tree Plantation",
      slug: "vrindavan-harit-kranti",
      category: ProjectCategory.PLANTATION,
      status: ProjectStatus.ACTIVE,
      description: `Rapid urban development in the holy pilgrimage town of Vrindavan has depleted traditional groves (vanas). Prayas leads regular community plantation drives of deep-rooted native species — Neem, Peepal, Banyan, and Pilu — along the Parikrama Marg, schools, and village pastures with geo-tagging and year-round tree-guard maintenance.`,
      coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 200000,
      raisedAmount: 180000,
      createdById: admin.id,
      metaTitle: "Vrindavan Harit Kranti - Tree Plantation Drive | Prayas Pariwaar",
      metaDescription: "Restoring the sacred groves of Vrindavan and Mathura with native Neem and Peepal tree plantation campaigns.",
    },
  });

  const p3 = await prisma.project.create({
    data: {
      title: "Jan Swasthya Raksha: Free Health & Eye Care Camps",
      slug: "jan-swasthya-raksha",
      category: ProjectCategory.HEALTH,
      status: ProjectStatus.ACTIVE,
      description: `Monthly general health checkups, geriatric eye screening for cataract surgery, diagnostic tests, and free distribution of prescribed medicines for sadhus, widows, and low-income daily wage earners across Vrindavan.`,
      coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 250000,
      raisedAmount: 160000,
      createdById: admin.id,
      metaTitle: "Jan Swasthya Raksha - Free Healthcare Camps | Prayas Pariwaar",
      metaDescription: "Providing free medical consultations, eye checkups, and medicines in rural Mathura.",
    },
  });

  const p4 = await prisma.project.create({
    data: {
      title: "Aadhar Career & Digital Vocational Counseling",
      slug: "aadhar-career-counseling",
      category: ProjectCategory.AWARENESS,
      status: ProjectStatus.ACTIVE,
      description: `Guiding rural high-school students with computer literacy, vocational aptitude testing, civil service coaching guidance, and anti-substance abuse awareness across government schools in Mathura.`,
      coverImage: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80",
      goalAmount: 150000,
      raisedAmount: 95000,
      createdById: admin.id,
      metaTitle: "Project Aadhar - Career & Digital Literacy | Prayas Pariwaar",
      metaDescription: "Empowering rural youth with career counseling, digital skills, and awareness campaigns.",
    },
  });

  // Project Images
  await prisma.projectImage.createMany({
    data: [
      {
        projectId: p1.id,
        url: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
        caption: "Students during evening remedial study classes in Raman Reti settlement.",
        order: 1,
      },
      {
        projectId: p1.id,
        url: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
        caption: "Annual notebook and school bag distribution.",
        order: 2,
      },
      {
        projectId: p2.id,
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        caption: "Volunteers planting Neem saplings along the outer Parikrama Marg.",
        order: 1,
      },
      {
        projectId: p3.id,
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        caption: "Doctor examining elderly patients during Chhatikara village camp.",
        order: 1,
      },
    ],
  });

  // 6. Recent Activity & Event Posts
  const post1 = await prisma.post.create({
    data: {
      title: "Monsoon Plantation Drive: 350 Native Saplings Planted at Parikrama Marg",
      slug: "monsoon-plantation-drive-parikrama-marg",
      type: PostType.EVENT,
      excerpt: "Over 45 volunteers and local students gathered on Sunday morning to plant Neem, Peepal, and Banyan saplings along the outer pilgrim route.",
      content: `On Sunday morning, Prayas Pariwaar organized its 14th seasonal plantation drive of the year along the outer stretch of the Vrindavan Parikrama Marg. 

With participation from local youth, shopkeepers, and student volunteers, 350 saplings of indigenous Neem (Azadirachta indica), Peepal (Ficus religiosa), and Pilu (Salvadora persica) were planted. Each sapling was secured with a protective bamboo tree-guard, and local neighborhood caretakers have taken pledge for their daily watering.

"Restoring green cover along our pilgrimage routes is both our ecological duty and spiritual seva to the soil of Braj," said coordinator Shri Radhey Mohan.`,
      coverImage: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
      eventDate: new Date("2026-08-23"),
      location: "Parikrama Marg, Vrindavan",
      authorId: editor.id,
      published: true,
      publishedAt: new Date("2026-08-24"),
      metaTitle: "Monsoon Plantation Drive in Vrindavan | Prayas Pariwaar Field Report",
      metaDescription: "Field report from Prayas Pariwaar's 350-sapling plantation drive along Parikrama Marg, Vrindavan.",
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: "Free Pediatric & Dental Screening Camp at Chhatikara Primary School",
      slug: "pediatric-health-camp-chhatikara",
      type: PostType.EVENT,
      excerpt: "140 rural students received comprehensive pediatric, dental, and nutritional checkups with free distribution of essential vitamins.",
      content: `In partnership with visiting specialist doctors from Mathura District Hospital, Prayas Pariwaar conducted a full-day pediatric and dental health assessment at Government Primary School, Village Chhatikara.

A total of 140 children underwent general health screening, height-weight percentile tracking, and dental hygiene checkups. Free calcium syrups, iron supplements, deworming tablets, and dental kits were distributed. 12 children diagnosed with vision impairment were registered for free prescription spectacles funded by our medical assistance corpus.`,
      coverImage: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
      eventDate: new Date("2026-08-16"),
      location: "Village Chhatikara, Mathura",
      authorId: editor.id,
      published: true,
      publishedAt: new Date("2026-08-17"),
      metaTitle: "Pediatric Health Camp Report | Prayas Pariwaar Chhatikara",
      metaDescription: "Health screening and medicine distribution for 140 rural children in Mathura district.",
    },
  });

  const post3 = await prisma.post.create({
    data: {
      title: "Milestone: Volunteer Blood Network Successfully Meets 400th Emergency Request",
      slug: "emergency-blood-network-400th-request",
      type: PostType.ACHIEVEMENT,
      excerpt: "Our 24/7 volunteer emergency blood coordination desk reached the milestone of arranging 400 successful life-saving transfusions without charging a single rupee.",
      content: `Yesterday evening, when a road accident victim admitted at Nayati Medicity Hospital urgently required rare AB-negative blood, our automated volunteer dispatch network and on-ground coordinators mobilized a matched donor from Govardhan within 40 minutes.

This emergency response marked the 400th verified blood transfusion coordinated by Prayas Pariwaar since our digital tracking initiative began. We express our deepest gratitude to our network of 850+ registered voluntary blood donors across Mathura and Agra districts.`,
      coverImage: "https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&w=1200&q=80",
      eventDate: new Date("2026-08-08"),
      location: "Vrindavan & Mathura District",
      authorId: admin.id,
      published: true,
      publishedAt: new Date("2026-08-09"),
      metaTitle: "400 Emergency Blood Requests Met | Prayas Pariwaar Milestone",
      metaDescription: "Prayas volunteer blood donor registry celebrates 400 successful life-saving transfusions in Mathura district.",
    },
  });

  // Post Images
  await prisma.postImage.createMany({
    data: [
      {
        postId: post1.id,
        url: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80",
        caption: "Volunteers digging planting pits at sunrise.",
        order: 1,
      },
      {
        postId: post2.id,
        url: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=800&q=80",
        caption: "Pediatrician consulting with school children and parents.",
        order: 1,
      },
    ],
  });

  // 7. Emergency Blood Requests (Live & Urgent sample hospital cases)
  await prisma.bloodRequest.createMany({
    data: [
      {
        patientName: "Smt. Kamla Devi",
        hospitalName: "Ramakrishna Mission Sevashrama",
        city: "Vrindavan",
        bloodGroup: BloodGroup.O_POSITIVE,
        unitsNeeded: 2,
        urgency: UrgencyLevel.CRITICAL,
        status: BloodRequestStatus.PENDING,
        contactPhone: "+91 9897123456",
        notes: "Emergency post-operative requirement. Patient admitted in ICU Bed 4.",
      },
      {
        patientName: "Master Aarav Sharma",
        hospitalName: "District Combined Hospital",
        city: "Mathura",
        bloodGroup: BloodGroup.B_NEGATIVE,
        unitsNeeded: 1,
        urgency: UrgencyLevel.HIGH,
        status: BloodRequestStatus.PENDING,
        contactPhone: "+91 9412987654",
        notes: "Routine monthly transfusion for Thalassemia patient. Scheduled for 2:00 PM.",
      },
      {
        patientName: "Shri Gopal Das",
        hospitalName: "Nayati Medicity Hospital",
        city: "Mathura",
        bloodGroup: BloodGroup.A_POSITIVE,
        unitsNeeded: 2,
        urgency: UrgencyLevel.HIGH,
        status: BloodRequestStatus.PENDING,
        contactPhone: "+91 9758112233",
        notes: "Cardiac procedure requirement. Replacement donor needed.",
      },
    ],
  });

  // 8. Medical Equipment Bank
  await prisma.medicalEquipment.createMany({
    data: [
      {
        name: "10L High-Flow Medical Oxygen Concentrator",
        slug: "oxygen-concentrator-10l",
        category: "Respiratory Support",
        description: "Medical-grade 10-liter continuous oxygen concentrator with dual flow output and oxygen purity indicator. Ideal for elderly patients recovering from pneumonia or chronic respiratory ailments at home.",
        quantity: 12,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Foldable Lightweight Hospital Wheelchair",
        slug: "foldable-hospital-wheelchair",
        category: "Mobility Assistance",
        description: "Heavy-duty chrome plated steel frame wheelchair with cushioned armrests, footrests, and safety brakes. Lightweight and easily foldable for transport in auto-rickshaws or small cars.",
        quantity: 24,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "2-Function Adjustable Hospital Fowler Bed",
        slug: "hospital-fowler-bed",
        category: "Patient Beds & Care",
        description: "Manual crank-operated 2-function hospital bed with headrest and leg-rest elevation, side safety railings, and IV drip stand attachments for homebound patients.",
        quantity: 8,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Anti-Bedsore Alternating Pressure Air Mattress",
        slug: "anti-bedsore-air-mattress",
        category: "Patient Beds & Care",
        description: "Medical bubble air mattress with ultra-quiet automatic pump designed to prevent bedsores and pressure ulcers in bedridden patients.",
        quantity: 15,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Adjustable Aluminum Walking Frame (Walker)",
        slug: "aluminum-walking-frame",
        category: "Mobility Assistance",
        description: "Sturdy, lightweight adjustable height walking frame with non-slip rubber tips, suitable for post-surgery rehabilitation and elderly support.",
        quantity: 18,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=800&q=80",
      },
      {
        name: "Heavy-Duty Compressor Nebulizer Machine",
        slug: "compressor-nebulizer",
        category: "Respiratory Support",
        description: "High-efficiency medication nebulizer for asthmatic children and elderly patients suffering from seasonal bronchitis.",
        quantity: 10,
        status: EquipmentStatus.AVAILABLE,
        imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80",
      },
    ],
  });

  // 9. Institutional Awards & Recognitions
  await prisma.award.createMany({
    data: [
      {
        title: "Mathura District Administration Seva Samman",
        description: "Conferred by the District Magistrate of Mathura for outstanding public service during natural calamities and COVID-19 medical assistance.",
        year: 2024,
        imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80",
        order: 1,
      },
      {
        title: "Uttar Pradesh Grassroots NGO Excellence Award",
        description: "Awarded by the State Social Welfare Board for 18 years of sustained rural education and community health initiatives in Braj region.",
        year: 2022,
        imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80",
        order: 2,
      },
      {
        title: "Rotary Seva Ratna for Blood Donor Mobilization",
        description: "Recognized by Rotary Club of Mathura-Vrindavan for maintaining the largest voluntary emergency blood donor registry in the district.",
        year: 2019,
        imageUrl: "https://images.unsplash.com/photo-1578269174936-2709b6aeb913?auto=format&fit=crop&w=800&q=80",
        order: 3,
      },
    ],
  });

  // 10. Testimonials
  await prisma.testimonial.createMany({
    data: [
      {
        quote: "When my mother suffered from severe pneumonia at home, buying an oxygen concentrator was completely out of our reach. Prayas Pariwaar provided a 10L machine within 2 hours, free of cost. Their volunteers are true servants of Braj.",
        authorName: "Shri Radhey Shyam Sharma",
        designation: "Resident, Raman Reti, Vrindavan",
        order: 1,
        published: true,
      },
      {
        quote: "As medical professionals, we have seen how critical time is in emergency blood transfusions. Prayas's volunteer coordination desk has saved dozens of accident victims and pregnant mothers in our emergency ward.",
        authorName: "Dr. Alok Nath Verma",
        designation: "Senior Medical Consultant, Mathura",
        order: 2,
        published: true,
      },
      {
        quote: "Through Project Aashayein, our village children now have school uniforms, winter sweaters, and daily tuition classes. For parents who work on daily wages, this support is life-changing.",
        authorName: "Smt. Shanti Devi",
        designation: "Village Elder & Homemaker, Chhatikara",
        order: 3,
        published: true,
      },
    ],
  });

  // 11. Media Coverage
  await prisma.mediaCoverage.createMany({
    data: [
      {
        title: "प्रयास परिवार द्वारा परिक्रमा मार्ग पर 350 देशी पौधों का रोपण व संरक्षण संकल्प",
        type: MediaType.PRINT,
        source: "Dainik Jagran (Mathura Edition)",
        publishedDate: new Date("2026-08-25"),
        url: "https://dainikjagran.com",
        imageUrl: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=800&q=80",
        order: 1,
      },
      {
        title: "आपातकालीन रक्तदान हेल्पलाइन ने बचाई दुर्घटना पीड़ित की जान: 40 मिनट में पहुंचा रक्तदाता",
        type: MediaType.PRINT,
        source: "Amar Ujala (Braj Mandal)",
        publishedDate: new Date("2026-08-10"),
        url: "https://amarujala.com",
        imageUrl: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=800&q=80",
        order: 2,
      },
      {
        title: "वृंदावन में जरूरतमंद मरीजों के लिए वरदान साबित हो रहा मेडिकल उपकरण बैंक: विशेष रिपोर्ट",
        type: MediaType.ELECTRONIC,
        source: "News18 Uttar Pradesh",
        publishedDate: new Date("2026-07-15"),
        url: "https://news18.com",
        imageUrl: "https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=800&q=80",
        order: 3,
      },
    ],
  });

  console.log("🎉 Successfully seeded Prayas Pariwaar database with complete institutional data!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
