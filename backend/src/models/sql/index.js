"use strict";
/**
 * Sequelize model definitions for the MySQL backend.
 * Import this module to access all SQL models.
 *
 * Usage:
 *   const { Admin, Course, Faculty, ... } = require('./models/sql');
 */

const sequelize = require("../../config/sql/db");
const { DataTypes } = require("sequelize");

// ── Admin ──────────────────────────────────────────────────────────────────
const Admin = sequelize.define("Admin", {
  id:                    { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:                  { type: DataTypes.STRING(200), allowNull: false },
  email:                 { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password:              { type: DataTypes.STRING(255), allowNull: false },
  role:                  { type: DataTypes.ENUM("admin","super_admin"), defaultValue: "admin" },
  status:                { type: DataTypes.ENUM("active","inactive"),   defaultValue: "active" },
  resetPasswordToken:    { type: DataTypes.STRING(255), field: "reset_password_token", allowNull: true },
  resetPasswordExpires:  { type: DataTypes.BIGINT.UNSIGNED, field: "reset_password_expires", allowNull: true },
}, { tableName: "admins", underscored: true, freezeTableName: true, timestamps: true });

// ── SiteSettings ──────────────────────────────────────────────────────────
const SiteSettings = sequelize.define("SiteSettings", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  schoolName:          { type: DataTypes.STRING(300), field: "school_name", defaultValue: "CNPS Public School" },
  tagline:             { type: DataTypes.STRING(500) },
  description:         { type: DataTypes.TEXT },
  email:               { type: DataTypes.STRING(255) },
  phone:               { type: DataTypes.STRING(50) },
  phone2:              { type: DataTypes.STRING(50) },
  address:             { type: DataTypes.TEXT },
  mapEmbedUrl:         { type: DataTypes.TEXT, field: "map_embed_url" },
  facebookUrl:         { type: DataTypes.STRING(500), field: "facebook_url" },
  twitterUrl:          { type: DataTypes.STRING(500), field: "twitter_url" },
  instagramUrl:        { type: DataTypes.STRING(500), field: "instagram_url" },
  youtubeUrl:          { type: DataTypes.STRING(500), field: "youtube_url" },
  linkedinUrl:         { type: DataTypes.STRING(500), field: "linkedin_url" },
  logoUrl:             { type: DataTypes.STRING(1000), field: "logo_url" },
  logoPublicId:        { type: DataTypes.STRING(500), field: "logo_public_id" },
  faviconUrl:          { type: DataTypes.STRING(1000), field: "favicon_url" },
  faviconPublicId:     { type: DataTypes.STRING(500), field: "favicon_public_id" },
  principalName:       { type: DataTypes.STRING(200), field: "principal_name" },
  principalMessage:    { type: DataTypes.TEXT, field: "principal_message" },
  footerAbout:         { type: DataTypes.TEXT, field: "footer_about" },
  footerCopyright:     { type: DataTypes.STRING(500), field: "footer_copyright" },
  aboutHeading:        { type: DataTypes.STRING(300), field: "about_heading" },
  aboutDescription:    { type: DataTypes.TEXT, field: "about_description" },
  aboutMission:        { type: DataTypes.TEXT, field: "about_mission" },
  aboutVision:         { type: DataTypes.TEXT, field: "about_vision" },
  aboutValues:         { type: DataTypes.TEXT, field: "about_values" },
  aboutImage1Url:       { type: DataTypes.STRING(1000), field: "about_image1_url" },
  aboutImage1PublicId:  { type: DataTypes.STRING(500), field: "about_image1_public_id" },
  aboutImage2Url:       { type: DataTypes.STRING(1000), field: "about_image2_url" },
  aboutImage2PublicId:  { type: DataTypes.STRING(500), field: "about_image2_public_id" },
  aboutImage3Url:       { type: DataTypes.STRING(1000), field: "about_image3_url" },
  aboutImage3PublicId:  { type: DataTypes.STRING(500), field: "about_image3_public_id" },
  aboutImages:          { type: DataTypes.JSON, field: "about_images" },
}, { tableName: "site_settings", underscored: true, freezeTableName: true, timestamps: true });

// ── HeroSlide ─────────────────────────────────────────────────────────────
const HeroSlide = sequelize.define("HeroSlide", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:           { type: DataTypes.STRING(300) },
  subtitle:        { type: DataTypes.STRING(500) },
  description:     { type: DataTypes.TEXT },
  buttonText:      { type: DataTypes.STRING(100), field: "button_text" },
  buttonUrl:       { type: DataTypes.STRING(500), field: "button_url", defaultValue: "/admission" },
  imageUrl:        { type: DataTypes.STRING(1000), field: "image_url" },
  imagePublicId:   { type: DataTypes.STRING(500), field: "image_public_id" },
  status:          { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:       { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "hero_slides", underscored: true, freezeTableName: true, timestamps: true });

// ── HomepageContent ───────────────────────────────────────────────────────
const HomepageContent = sequelize.define("HomepageContent", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  aboutHeading:        { type: DataTypes.STRING(300), field: "about_heading" },
  aboutSubheading:     { type: DataTypes.STRING(500), field: "about_subheading" },
  aboutDescription:    { type: DataTypes.TEXT, field: "about_description" },
  aboutImageUrl:       { type: DataTypes.STRING(1000), field: "about_image_url" },
  aboutImagePublicId: { type: DataTypes.STRING(500), field: "about_image_public_id" },
  aboutPoints:        { type: DataTypes.JSON, field: "about_points" },
  whyUsHeading:       { type: DataTypes.STRING(300), field: "why_us_heading" },
  whyUsDescription:   { type: DataTypes.TEXT, field: "why_us_description" },
  ctaHeading:         { type: DataTypes.STRING(300), field: "cta_heading" },
  ctaDescription:     { type: DataTypes.TEXT, field: "cta_description" },
  ctaButtonText:      { type: DataTypes.STRING(100), field: "cta_button_text" },
  ctaButtonUrl:       { type: DataTypes.STRING(500), field: "cta_button_url" },
}, { tableName: "homepage_content", underscored: true, freezeTableName: true, timestamps: true });

// ── CountStat ─────────────────────────────────────────────────────────────
const CountStat = sequelize.define("CountStat", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  homepageContentId:  { type: DataTypes.INTEGER.UNSIGNED, field: "homepage_content_id", allowNull: false },
  category:           { type: DataTypes.ENUM("Students","Events","Faculty","Courses"), defaultValue: "Students" },
  icon:               { type: DataTypes.STRING(100), defaultValue: "bi-people-fill" },
  value:              { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  label:              { type: DataTypes.STRING(200) },
  suffix:             { type: DataTypes.STRING(20), defaultValue: "+" },
  sortOrder:          { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "count_stats", underscored: true, freezeTableName: true, timestamps: true });

HomepageContent.hasMany(CountStat, { foreignKey: "homepage_content_id", as: "countStats" });
CountStat.belongsTo(HomepageContent, { foreignKey: "homepage_content_id" });

// ── Faculty ───────────────────────────────────────────────────────────────
const Faculty = sequelize.define("Faculty", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:            { type: DataTypes.STRING(200), allowNull: false },
  designation:     { type: DataTypes.STRING(200) },
  qualification:   { type: DataTypes.STRING(300) },
  experience:      { type: DataTypes.STRING(100) },
  shortBio:        { type: DataTypes.TEXT, field: "short_bio" },
  bio:             { type: DataTypes.TEXT },
  photoUrl:        { type: DataTypes.STRING(1000), field: "photo_url" },
  photoPublicId:   { type: DataTypes.STRING(500), field: "photo_public_id" },
  email:           { type: DataTypes.STRING(255) },
  phone:           { type: DataTypes.STRING(50) },
  facebook:        { type: DataTypes.STRING(500) },
  instagram:       { type: DataTypes.STRING(500) },
  linkedin:        { type: DataTypes.STRING(500) },
  youtube:         { type: DataTypes.STRING(500) },
  status:          { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:       { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "faculty", underscored: true, freezeTableName: true, timestamps: true });

// ── Course ────────────────────────────────────────────────────────────────
const Course = sequelize.define("Course", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:               { type: DataTypes.STRING(300), allowNull: false },
  slug:                { type: DataTypes.STRING(350), allowNull: false, unique: true },
  category:            { type: DataTypes.STRING(100) },
  className:           { type: DataTypes.STRING(100), field: "class_name" },
  shortDescription:    { type: DataTypes.TEXT, field: "short_description" },
  description:         { type: DataTypes.TEXT },
  classTeacher:        { type: DataTypes.STRING(200), field: "class_teacher" },
  timing:              { type: DataTypes.STRING(200) },
  imageUrl:            { type: DataTypes.STRING(1000), field: "image_url" },
  imagePublicId:       { type: DataTypes.STRING(500), field: "image_public_id" },
  feePdfUrl:           { type: DataTypes.STRING(1000), field: "fee_pdf_url" },
  feePdfPublicId:      { type: DataTypes.STRING(500), field: "fee_pdf_public_id" },
  timetablePdfUrl:     { type: DataTypes.STRING(1000), field: "timetable_pdf_url" },
  timetablePdfPublicId:{ type: DataTypes.STRING(500), field: "timetable_pdf_public_id" },
  subjects:            { type: DataTypes.JSON },
  status:              { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:           { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "courses", underscored: true, freezeTableName: true, timestamps: true });

const CourseBook = sequelize.define("CourseBook", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  courseId:        { type: DataTypes.INTEGER.UNSIGNED, field: "course_id", allowNull: false },
  name:            { type: DataTypes.STRING(300), allowNull: false },
  publisher:       { type: DataTypes.STRING(300) },
  price:           { type: DataTypes.STRING(50) },
  imageUrl:        { type: DataTypes.STRING(1000), field: "image_url" },
  imagePublicId:  { type: DataTypes.STRING(500), field: "image_public_id" },
  sortOrder:       { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "course_books", underscored: true, freezeTableName: true, timestamps: true });

Course.hasMany(CourseBook, { foreignKey: "course_id", as: "books" });
CourseBook.belongsTo(Course, { foreignKey: "course_id" });

// ── Event ─────────────────────────────────────────────────────────────────
const Event = sequelize.define("Event", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:               { type: DataTypes.STRING(300), allowNull: false },
  slug:                { type: DataTypes.STRING(350), allowNull: false, unique: true },
  description:         { type: DataTypes.TEXT },
  eventDate:           { type: DataTypes.DATE, field: "event_date" },
  location:            { type: DataTypes.STRING(300) },
  coverImageUrl:       { type: DataTypes.STRING(1000), field: "cover_image_url" },
  coverImagePublicId:  { type: DataTypes.STRING(500), field: "cover_image_public_id" },
  status:              { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:           { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "events", underscored: true, freezeTableName: true, timestamps: true });

const EventGallery = sequelize.define("EventGallery", {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  eventId:     { type: DataTypes.INTEGER.UNSIGNED, field: "event_id", allowNull: false },
  url:         { type: DataTypes.STRING(1000), allowNull: false },
  publicId:    { type: DataTypes.STRING(500), field: "public_id", allowNull: false },
  caption:     { type: DataTypes.STRING(500) },
  sortOrder:   { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "event_gallery", underscored: true, freezeTableName: true, timestamps: true });

Event.hasMany(EventGallery, { foreignKey: "event_id", as: "gallery" });
EventGallery.belongsTo(Event, { foreignKey: "event_id" });

// ── GalleryAlbum ──────────────────────────────────────────────────────────
const GalleryAlbum = sequelize.define("GalleryAlbum", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:               { type: DataTypes.STRING(300), allowNull: false },
  slug:                { type: DataTypes.STRING(350), allowNull: false, unique: true },
  description:         { type: DataTypes.TEXT },
  category:            { type: DataTypes.ENUM("academic","development","campus","general"), defaultValue: "general" },
  coverImageUrl:       { type: DataTypes.STRING(1000), field: "cover_image_url" },
  coverImagePublicId:  { type: DataTypes.STRING(500), field: "cover_image_public_id" },
  status:              { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:           { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "gallery_albums", underscored: true, freezeTableName: true, timestamps: true });

const GalleryImage = sequelize.define("GalleryImage", {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  albumId:     { type: DataTypes.INTEGER.UNSIGNED, field: "album_id", allowNull: false },
  url:         { type: DataTypes.STRING(1000), allowNull: false },
  publicId:    { type: DataTypes.STRING(500), field: "public_id", allowNull: false },
  caption:     { type: DataTypes.STRING(500) },
  sortOrder:   { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "gallery_images", underscored: true, freezeTableName: true, timestamps: true });

GalleryAlbum.hasMany(GalleryImage, { foreignKey: "album_id", as: "images" });
GalleryImage.belongsTo(GalleryAlbum, { foreignKey: "album_id" });

// ── Notice ────────────────────────────────────────────────────────────────
const Notice = sequelize.define("Notice", {
  id:                  { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  title:               { type: DataTypes.STRING(300), allowNull: false },
  slug:                { type: DataTypes.STRING(350), allowNull: false, unique: true },
  content:             { type: DataTypes.TEXT },
  fileUrl:             { type: DataTypes.STRING(1000), field: "file_url" },
  filePublicId:        { type: DataTypes.STRING(500), field: "file_public_id" },
  fileResourceType:    { type: DataTypes.ENUM("image","raw",""), field: "file_resource_type", defaultValue: "" },
  status:              { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:           { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "notices", underscored: true, freezeTableName: true, timestamps: true });

// ── Testimonial ───────────────────────────────────────────────────────────
const Testimonial = sequelize.define("Testimonial", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:            { type: DataTypes.STRING(200), allowNull: false },
  designation:     { type: DataTypes.STRING(200) },
  content:         { type: DataTypes.TEXT, allowNull: false },
  rating:          { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 5 },
  avatarUrl:       { type: DataTypes.STRING(1000), field: "avatar_url" },
  avatarPublicId:  { type: DataTypes.STRING(500), field: "avatar_public_id" },
  status:          { type: DataTypes.ENUM("pending","approved","rejected"), defaultValue: "pending" },
  sortOrder:       { type: DataTypes.INTEGER, field: "sort_order", defaultValue: 0 },
}, { tableName: "testimonials", underscored: true, freezeTableName: true, timestamps: true });

// ── Media (binary storage) ────────────────────────────────────────────────
const Media = sequelize.define("Media", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  originalName:   { type: DataTypes.STRING(500), field: "original_name" },
  fileData:       { type: DataTypes.BLOB("long"), field: "file_data", allowNull: false },
  url:             { type: DataTypes.STRING(1000) },
  publicId:       { type: DataTypes.STRING(500), field: "public_id" },
  resourceType:   { type: DataTypes.ENUM("image","raw"), field: "resource_type", defaultValue: "image" },
  mimeType:       { type: DataTypes.STRING(100), field: "mime_type" },
  size:           { type: DataTypes.BIGINT.UNSIGNED },
  folder:         { type: DataTypes.STRING(200), defaultValue: "media" },
  uploadedBy:     { type: DataTypes.INTEGER.UNSIGNED, field: "uploaded_by" },
  tags:           { type: DataTypes.JSON },
}, { tableName: "media", underscored: true, freezeTableName: true, timestamps: true });

// ── AdmissionEnquiry ──────────────────────────────────────────────────────
const AdmissionEnquiry = sequelize.define("AdmissionEnquiry", {
  id:              { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  studentName:    { type: DataTypes.STRING(200), field: "student_name", allowNull: false },
  dob:             { type: DataTypes.STRING(50) },
  gender:          { type: DataTypes.ENUM("Male","Female","Other"), allowNull: false },
  className:      { type: DataTypes.STRING(100), field: "class_name", allowNull: false },
  stream:          { type: DataTypes.STRING(100), defaultValue: "" },
  scienceGroup:   { type: DataTypes.STRING(100), field: "science_group", defaultValue: "" },
  fatherName:     { type: DataTypes.STRING(200), field: "father_name", defaultValue: "" },
  motherName:     { type: DataTypes.STRING(200), field: "mother_name", defaultValue: "" },
  mobile:          { type: DataTypes.STRING(50), allowNull: false },
  email:           { type: DataTypes.STRING(255), defaultValue: "" },
  address:         { type: DataTypes.TEXT, allowNull: false },
  status:          { type: DataTypes.ENUM("new","reviewed","contacted","admitted","rejected"), defaultValue: "new" },
  adminNotes:      { type: DataTypes.TEXT, field: "admin_notes" },
  consentAccepted: { type: DataTypes.TINYINT(1), field: "consent_accepted", defaultValue: 0 },
  consentVersion:  { type: DataTypes.STRING(20), field: "consent_version", allowNull: true },
  consentAt:       { type: DataTypes.DATE, field: "consent_at", allowNull: true },
}, { tableName: "admission_enquiries", underscored: true, freezeTableName: true, timestamps: true });

// ── ContactMessage ────────────────────────────────────────────────────────
const ContactMessage = sequelize.define("ContactMessage", {
  id:          { type: DataTypes.INTEGER.UNSIGNED, primaryKey: true, autoIncrement: true },
  name:        { type: DataTypes.STRING(200), allowNull: false },
  email:       { type: DataTypes.STRING(255), allowNull: false },
  phone:       { type: DataTypes.STRING(50) },
  subject:     { type: DataTypes.STRING(300) },
  message:     { type: DataTypes.TEXT, allowNull: false },
  isRead:      { type: DataTypes.BOOLEAN, field: "is_read", defaultValue: false },
  status:      { type: DataTypes.ENUM("new","read","replied","archived"), defaultValue: "new" },
  adminNotes:  { type: DataTypes.TEXT, field: "admin_notes" },
}, { tableName: "contact_messages", underscored: true, freezeTableName: true, timestamps: true });

module.exports = {
  sequelize,
  Admin,
  SiteSettings,
  HeroSlide,
  HomepageContent,
  CountStat,
  Faculty,
  Course,
  CourseBook,
  Event,
  EventGallery,
  GalleryAlbum,
  GalleryImage,
  Notice,
  Testimonial,
  Media,
  AdmissionEnquiry,
  ContactMessage,
};
