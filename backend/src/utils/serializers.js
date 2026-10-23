"use strict";
/**
 * Serializers transform Sequelize model instances (flat columns) into the
 * nested JSON structure the frontend expects (e.g. image: { url, publicId }).
 *
 * This preserves the exact data contract the frontend was built against when
 * the backend used MongoDB/Mongoose with nested subdocuments.
 */

// ── Helper: build { url, publicId } object ────────────────────────────────
function imgObj(url, publicId) {
  return {
    url: url || "",
    publicId: publicId || "",
  };
}

// ── Admin ────────────────────────────────────────────────────────────────
function serializeAdmin(a) {
  if (!a) return null;
  const d = a.toJSON ? a.toJSON() : a;
  return {
    _id: String(d.id),
    id: d.id,
    name: d.name,
    email: d.email,
    role: d.role,
    status: d.status,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── SiteSettings ─────────────────────────────────────────────────────────
function serializeSettings(s) {
  if (!s) return null;
  const d = s.toJSON ? s.toJSON() : s;
  return {
    _id: String(d.id),
    id: d.id,
    schoolName: d.schoolName || "CNPS Public School",
    tagline: d.tagline || "",
    description: d.description || "",
    email: d.email || "",
    phone: d.phone || "",
    phone2: d.phone2 || "",
    address: d.address || "",
    mapEmbedUrl: d.mapEmbedUrl || "",
    socialLinks: {
      facebook:  d.facebookUrl  || "",
      instagram: d.instagramUrl || "",
      youtube:   d.youtubeUrl   || "",
      twitter:   d.twitterUrl   || "",
      linkedin:  d.linkedinUrl  || "",
    },
    logo:     imgObj(d.logoUrl, d.logoPublicId),
    favicon:  imgObj(d.faviconUrl, d.faviconPublicId),
    principalName:    d.principalName || "",
    principalMessage: d.principalMessage || "",
    footerAbout:      d.footerAbout || "",
    footerCopyright:  d.footerCopyright || "",
    aboutHeading:     d.aboutHeading || "",
    aboutDescription: d.aboutDescription || "",
    aboutMission:     d.aboutMission || "",
    aboutVision:      d.aboutVision || "",
    aboutValues:      d.aboutValues || "",
    aboutImage1: imgObj(d.aboutImage1Url, d.aboutImage1PublicId),
    aboutImage2: imgObj(d.aboutImage2Url, d.aboutImage2PublicId),
    aboutImage3: imgObj(d.aboutImage3Url, d.aboutImage3PublicId),
    aboutImages: (() => {
      const raw = d.aboutImages;
      let arr = [];
      if (Array.isArray(raw)) {
        arr = raw;
      } else if (typeof raw === "string") {
        try { arr = JSON.parse(raw); } catch { arr = []; }
        if (!Array.isArray(arr)) arr = [];
      }
      return arr.map((img) =>
        typeof img === "string" ? img : imgObj(img.url || img.imageUrl, img.publicId || img.imagePublicId)
      );
    })(),
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── HeroSlide ────────────────────────────────────────────────────────────
function serializeHeroSlide(s) {
  if (!s) return null;
  const d = s.toJSON ? s.toJSON() : s;
  return {
    _id: String(d.id),
    id: d.id,
    title: d.title || "",
    subtitle: d.subtitle || "",
    description: d.description || "",
    buttonText: d.buttonText || "",
    buttonUrl: d.buttonUrl || "/admission",
    image: imgObj(d.imageUrl, d.imagePublicId),
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── HomepageContent ──────────────────────────────────────────────────────
function serializeHomepageContent(hp, countStats) {
  if (!hp) return null;
  const d = hp.toJSON ? hp.toJSON() : hp;
  const stats = (countStats || d.countStats || []).map((s) => ({
    _id: String(s.id),
    id: s.id,
    category: s.category || "",
    icon: s.icon || "bi-people-fill",
    value: s.value || 0,
    label: s.label || "",
    suffix: s.suffix || "+",
    sortOrder: s.sortOrder || 0,
  }));
  return {
    _id: String(d.id),
    id: d.id,
    aboutHeading: d.aboutHeading || "About CNPS Public School",
    aboutSubheading: d.aboutSubheading || "",
    aboutDescription: d.aboutDescription || "",
    aboutImage: imgObj(d.aboutImageUrl, d.aboutImagePublicId),
    aboutPoints: Array.isArray(d.aboutPoints) ? d.aboutPoints : [],
    whyUsHeading: d.whyUsHeading || "Why Choose CNPS?",
    whyUsDescription: d.whyUsDescription || "",
    countStats: stats,
    ctaHeading: d.ctaHeading || "Ready to Join CNPS?",
    ctaDescription: d.ctaDescription || "",
    ctaButtonText: d.ctaButtonText || "Apply for Admission",
    ctaButtonUrl: d.ctaButtonUrl || "/admission",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Faculty ──────────────────────────────────────────────────────────────
function serializeFaculty(f) {
  if (!f) return null;
  const d = f.toJSON ? f.toJSON() : f;
  return {
    _id: String(d.id),
    id: d.id,
    name: d.name,
    designation: d.designation || "",
    qualification: d.qualification || "",
    experience: d.experience || "",
    shortBio: d.shortBio || "",
    bio: d.bio || "",
    photo: imgObj(d.photoUrl, d.photoPublicId),
    email: d.email || "",
    phone: d.phone || "",
    facebook: d.facebook || "",
    instagram: d.instagram || "",
    linkedin: d.linkedin || "",
    youtube: d.youtube || "",
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Course ───────────────────────────────────────────────────────────────
function serializeCourse(c) {
  if (!c) return null;
  const d = c.toJSON ? c.toJSON() : c;
  const books = (d.books || []).map((b) => ({
    _id: String(b.id),
    id: b.id,
    name: b.name,
    publisher: b.publisher || "",
    image: imgObj(b.imageUrl, b.imagePublicId),
    price: b.price || "",
    sortOrder: b.sortOrder || 0,
  }));
  return {
    _id: String(d.id),
    id: d.id,
    title: d.title,
    slug: d.slug,
    category: d.category || "",
    className: d.className || "",
    shortDescription: d.shortDescription || "",
    description: d.description || "",
    classTeacher: d.classTeacher || "",
    timing: d.timing || "",
    image: imgObj(d.imageUrl, d.imagePublicId),
    feePdf: imgObj(d.feePdfUrl, d.feePdfPublicId),
    timetablePdf: imgObj(d.timetablePdfUrl, d.timetablePdfPublicId),
    subjects: Array.isArray(d.subjects) ? d.subjects : [],
    books,
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Event ────────────────────────────────────────────────────────────────
function serializeEvent(e) {
  if (!e) return null;
  const d = e.toJSON ? e.toJSON() : e;
  const gallery = (d.gallery || []).map((g) => ({
    _id: String(g.id),
    id: g.id,
    url: g.url,
    publicId: g.publicId,
    caption: g.caption || "",
    sortOrder: g.sortOrder || 0,
  }));
  return {
    _id: String(d.id),
    id: d.id,
    title: d.title,
    slug: d.slug,
    description: d.description || "",
    eventDate: d.eventDate,
    location: d.location || "",
    coverImage: imgObj(d.coverImageUrl, d.coverImagePublicId),
    gallery,
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── GalleryAlbum ────────────────────────────────────────────────────────
function serializeAlbum(a) {
  if (!a) return null;
  const d = a.toJSON ? a.toJSON() : a;
  const images = (d.images || []).map((i) => ({
    _id: String(i.id),
    id: i.id,
    url: i.url,
    publicId: i.publicId,
    caption: i.caption || "",
    sortOrder: i.sortOrder || 0,
  }));
  return {
    _id: String(d.id),
    id: d.id,
    title: d.title,
    slug: d.slug,
    description: d.description || "",
    category: d.category,
    coverImage: imgObj(d.coverImageUrl, d.coverImagePublicId),
    images,
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Notice ────────────────────────────────────────────────────────────────
function serializeNotice(n) {
  if (!n) return null;
  const d = n.toJSON ? n.toJSON() : n;
  return {
    _id: String(d.id),
    id: d.id,
    title: d.title,
    slug: d.slug,
    content: d.content || "",
    file: {
      url: d.fileUrl || "",
      publicId: d.filePublicId || "",
      resourceType: d.fileResourceType || "",
    },
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Testimonial ─────────────────────────────────────────────────────────
function serializeTestimonial(t) {
  if (!t) return null;
  const d = t.toJSON ? t.toJSON() : t;
  return {
    _id: String(d.id),
    id: d.id,
    name: d.name,
    designation: d.designation || "",
    content: d.content,
    rating: d.rating,
    avatar: imgObj(d.avatarUrl, d.avatarPublicId),
    status: d.status,
    sortOrder: d.sortOrder,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── Media ───────────────────────────────────────────────────────────────
function serializeMedia(m) {
  if (!m) return null;
  const d = m.toJSON ? m.toJSON() : m;
  return {
    _id: String(d.id),
    id: d.id,
    originalName: d.originalName || "",
    url: d.url || "",
    publicId: d.publicId || "",
    resourceType: d.resourceType || "image",
    mimeType: d.mimeType || "",
    size: d.size || 0,
    folder: d.folder || "media",
    tags: Array.isArray(d.tags) ? d.tags : [],
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── AdmissionEnquiry ────────────────────────────────────────────────────
function serializeAdmission(a) {
  if (!a) return null;
  const d = a.toJSON ? a.toJSON() : a;
  return {
    _id: String(d.id),
    id: d.id,
    studentName: d.studentName,
    dob: d.dob || "",
    gender: d.gender,
    className: d.className,
    stream: d.stream || "",
    scienceGroup: d.scienceGroup || "",
    fatherName: d.fatherName || "",
    motherName: d.motherName || "",
    mobile: d.mobile,
    email: d.email || "",
    address: d.address,
    status: d.status,
    adminNotes: d.adminNotes || "",
    consentAccepted: !!d.consentAccepted,
    consentVersion:  d.consentVersion  || "",
    consentAt:       d.consentAt       || null,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

// ── ContactMessage ──────────────────────────────────────────────────────
function serializeContact(c) {
  if (!c) return null;
  const d = c.toJSON ? c.toJSON() : c;
  return {
    _id: String(d.id),
    id: d.id,
    name: d.name,
    email: d.email,
    phone: d.phone || "",
    subject: d.subject || "",
    message: d.message,
    isRead: !!d.isRead,
    status: d.status,
    adminNotes: d.adminNotes || "",
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

module.exports = {
  imgObj,
  serializeAdmin,
  serializeSettings,
  serializeHeroSlide,
  serializeHomepageContent,
  serializeFaculty,
  serializeCourse,
  serializeEvent,
  serializeAlbum,
  serializeNotice,
  serializeTestimonial,
  serializeMedia,
  serializeAdmission,
  serializeContact,
};
