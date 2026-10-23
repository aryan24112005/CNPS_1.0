"use strict";
/**
 * Sequelize model definitions for the SQL (MySQL/MariaDB) backend.
 * Import this module to access all SQL models.
 *
 * Usage:
 *   const { Admin, Course, Faculty, ... } = require('./models/sql');
 */

const sequelize = require("../../config/sql/db");
const { DataTypes } = require("sequelize");

// ── Admin ──────────────────────────────────────────────────────────────────
const Admin = sequelize.define("Admin", {
  name:                  { type: DataTypes.STRING(200), allowNull: false },
  email:                 { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password:              { type: DataTypes.STRING(255), allowNull: false },
  role:                  { type: DataTypes.ENUM("admin","super_admin"), defaultValue: "admin" },
  status:                { type: DataTypes.ENUM("active","inactive"),   defaultValue: "active" },
  resetPasswordToken:    { type: DataTypes.STRING(255), allowNull: true },
  resetPasswordExpires:  { type: DataTypes.BIGINT.UNSIGNED, allowNull: true },
}, { tableName: "admins" });

// ── SiteSettings ──────────────────────────────────────────────────────────
const SiteSettings = sequelize.define("SiteSettings", {
  schoolName:       { type: DataTypes.STRING(300), defaultValue: "CNPS Public School" },
  tagline:          { type: DataTypes.STRING(500) },
  description:      { type: DataTypes.TEXT },
  email:            { type: DataTypes.STRING(255) },
  phone:            { type: DataTypes.STRING(50) },
  address:          { type: DataTypes.TEXT },
  mapEmbedUrl:      { type: DataTypes.TEXT },
  facebookUrl:      { type: DataTypes.STRING(500) },
  twitterUrl:       { type: DataTypes.STRING(500) },
  instagramUrl:     { type: DataTypes.STRING(500) },
  youtubeUrl:       { type: DataTypes.STRING(500) },
  linkedinUrl:      { type: DataTypes.STRING(500) },
  logoUrl:          { type: DataTypes.STRING(1000) },
  logoPublicId:     { type: DataTypes.STRING(500) },
  faviconUrl:       { type: DataTypes.STRING(1000) },
  faviconPublicId:  { type: DataTypes.STRING(500) },
  aboutImage1Url:       { type: DataTypes.STRING(1000) },
  aboutImage1PublicId:  { type: DataTypes.STRING(500) },
  aboutImage2Url:       { type: DataTypes.STRING(1000) },
  aboutImage2PublicId:  { type: DataTypes.STRING(500) },
  aboutImage3Url:       { type: DataTypes.STRING(1000) },
  aboutImage3PublicId:  { type: DataTypes.STRING(500) },
}, { tableName: "site_settings" });

// ── HeroSlide ─────────────────────────────────────────────────────────────
const HeroSlide = sequelize.define("HeroSlide", {
  title:       { type: DataTypes.STRING(300) },
  subtitle:    { type: DataTypes.STRING(500) },
  description: { type: DataTypes.TEXT },
  buttonText:  { type: DataTypes.STRING(100) },
  buttonUrl:   { type: DataTypes.STRING(500), defaultValue: "/admission" },
  imageUrl:    { type: DataTypes.STRING(1000) },
  imagePublicId: { type: DataTypes.STRING(500) },
  status:      { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "hero_slides" });

// ── HomepageContent ───────────────────────────────────────────────────────
const HomepageContent = sequelize.define("HomepageContent", {
  aboutHeading:      { type: DataTypes.STRING(300) },
  aboutSubheading:   { type: DataTypes.STRING(500) },
  aboutDescription:  { type: DataTypes.TEXT },
  aboutImageUrl:     { type: DataTypes.STRING(1000) },
  aboutImagePublicId:{ type: DataTypes.STRING(500) },
  aboutPoints:       { type: DataTypes.JSON },   // array of strings
  whyUsHeading:      { type: DataTypes.STRING(300) },
  whyUsDescription:  { type: DataTypes.TEXT },
  ctaHeading:        { type: DataTypes.STRING(300) },
  ctaDescription:    { type: DataTypes.TEXT },
  ctaButtonText:     { type: DataTypes.STRING(100) },
  ctaButtonUrl:      { type: DataTypes.STRING(500) },
}, { tableName: "homepage_content" });

// ── CountStat ─────────────────────────────────────────────────────────────
const CountStat = sequelize.define("CountStat", {
  homepageContentId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  category:  { type: DataTypes.ENUM("Students","Events","Faculty","Courses"), defaultValue: "Students" },
  icon:      { type: DataTypes.STRING(100), defaultValue: "bi-people-fill" },
  value:     { type: DataTypes.INTEGER.UNSIGNED, defaultValue: 0 },
  label:     { type: DataTypes.STRING(200) },
  suffix:    { type: DataTypes.STRING(20), defaultValue: "+" },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "count_stats" });

HomepageContent.hasMany(CountStat, { foreignKey: "homepageContentId", as: "countStats" });
CountStat.belongsTo(HomepageContent, { foreignKey: "homepageContentId" });

// ── Faculty ───────────────────────────────────────────────────────────────
const Faculty = sequelize.define("Faculty", {
  name:          { type: DataTypes.STRING(200), allowNull: false },
  designation:   { type: DataTypes.STRING(200) },
  qualification: { type: DataTypes.STRING(300) },
  experience:    { type: DataTypes.STRING(100) },
  shortBio:      { type: DataTypes.TEXT },
  bio:           { type: DataTypes.TEXT },
  photoUrl:      { type: DataTypes.STRING(1000) },
  photoPublicId: { type: DataTypes.STRING(500) },
  email:         { type: DataTypes.STRING(255) },
  phone:         { type: DataTypes.STRING(50) },
  facebook:      { type: DataTypes.STRING(500) },
  instagram:     { type: DataTypes.STRING(500) },
  linkedin:      { type: DataTypes.STRING(500) },
  youtube:       { type: DataTypes.STRING(500) },
  status:        { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "faculty" });

// ── Course ────────────────────────────────────────────────────────────────
const Course = sequelize.define("Course", {
  title:            { type: DataTypes.STRING(300), allowNull: false },
  slug:             { type: DataTypes.STRING(350), allowNull: false, unique: true },
  category:         { type: DataTypes.STRING(100) },
  className:        { type: DataTypes.STRING(100) },
  shortDescription: { type: DataTypes.TEXT },
  description:      { type: DataTypes.TEXT },
  classTeacher:     { type: DataTypes.STRING(200) },
  timing:           { type: DataTypes.STRING(200) },
  imageUrl:         { type: DataTypes.STRING(1000) },
  imagePublicId:    { type: DataTypes.STRING(500) },
  feePdfUrl:        { type: DataTypes.STRING(1000) },
  feePdfPublicId:   { type: DataTypes.STRING(500) },
  timetablePdfUrl:      { type: DataTypes.STRING(1000) },
  timetablePdfPublicId: { type: DataTypes.STRING(500) },
  subjects:         { type: DataTypes.JSON },   // array of strings
  status:           { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:        { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "courses" });

const CourseBook = sequelize.define("CourseBook", {
  courseId:    { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  name:        { type: DataTypes.STRING(300), allowNull: false },
  publisher:   { type: DataTypes.STRING(300) },
  price:       { type: DataTypes.STRING(50) },
  imageUrl:    { type: DataTypes.STRING(1000) },
  imagePublicId: { type: DataTypes.STRING(500) },
  sortOrder:   { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "course_books" });

Course.hasMany(CourseBook, { foreignKey: "courseId", as: "books" });
CourseBook.belongsTo(Course, { foreignKey: "courseId" });

// ── Event ─────────────────────────────────────────────────────────────────
const Event = sequelize.define("Event", {
  title:               { type: DataTypes.STRING(300), allowNull: false },
  slug:                { type: DataTypes.STRING(350), allowNull: false, unique: true },
  description:         { type: DataTypes.TEXT },
  eventDate:           { type: DataTypes.DATE },
  location:            { type: DataTypes.STRING(300) },
  coverImageUrl:       { type: DataTypes.STRING(1000) },
  coverImagePublicId:  { type: DataTypes.STRING(500) },
  status:              { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:           { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "events" });

const EventGallery = sequelize.define("EventGallery", {
  eventId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  url:       { type: DataTypes.STRING(1000), allowNull: false },
  publicId:  { type: DataTypes.STRING(500), allowNull: false },
  caption:   { type: DataTypes.STRING(500) },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "event_gallery" });

Event.hasMany(EventGallery, { foreignKey: "eventId", as: "gallery" });
EventGallery.belongsTo(Event, { foreignKey: "eventId" });

// ── GalleryAlbum ──────────────────────────────────────────────────────────
const GalleryAlbum = sequelize.define("GalleryAlbum", {
  title:              { type: DataTypes.STRING(300), allowNull: false },
  slug:               { type: DataTypes.STRING(350), allowNull: false, unique: true },
  description:        { type: DataTypes.TEXT },
  category:           { type: DataTypes.ENUM("academic","development","campus","general"), defaultValue: "general" },
  coverImageUrl:      { type: DataTypes.STRING(1000) },
  coverImagePublicId: { type: DataTypes.STRING(500) },
  status:             { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:          { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "gallery_albums" });

const GalleryImage = sequelize.define("GalleryImage", {
  albumId:   { type: DataTypes.INTEGER.UNSIGNED, allowNull: false },
  url:       { type: DataTypes.STRING(1000), allowNull: false },
  publicId:  { type: DataTypes.STRING(500), allowNull: false },
  caption:   { type: DataTypes.STRING(500) },
  sortOrder: { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "gallery_images" });

GalleryAlbum.hasMany(GalleryImage, { foreignKey: "albumId", as: "images" });
GalleryImage.belongsTo(GalleryAlbum, { foreignKey: "albumId" });

// ── Notice ────────────────────────────────────────────────────────────────
const Notice = sequelize.define("Notice", {
  title:            { type: DataTypes.STRING(300), allowNull: false },
  slug:             { type: DataTypes.STRING(350), allowNull: false, unique: true },
  content:          { type: DataTypes.TEXT },
  fileUrl:          { type: DataTypes.STRING(1000) },
  filePublicId:     { type: DataTypes.STRING(500) },
  fileResourceType: { type: DataTypes.ENUM("image","raw",""), defaultValue: "" },
  status:           { type: DataTypes.ENUM("active","inactive"), defaultValue: "active" },
  sortOrder:        { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "notices" });

// ── Testimonial ───────────────────────────────────────────────────────────
const Testimonial = sequelize.define("Testimonial", {
  name:          { type: DataTypes.STRING(200), allowNull: false },
  designation:   { type: DataTypes.STRING(200) },
  content:       { type: DataTypes.TEXT, allowNull: false },
  rating:        { type: DataTypes.TINYINT.UNSIGNED, defaultValue: 5 },
  avatarUrl:     { type: DataTypes.STRING(1000) },
  avatarPublicId:{ type: DataTypes.STRING(500) },
  status:        { type: DataTypes.ENUM("pending","approved","rejected"), defaultValue: "pending" },
  sortOrder:     { type: DataTypes.INTEGER, defaultValue: 0 },
}, { tableName: "testimonials" });

// ── Media ─────────────────────────────────────────────────────────────────
const Media = sequelize.define("Media", {
  originalName:  { type: DataTypes.STRING(500) },
  url:           { type: DataTypes.STRING(1000), allowNull: false },
  publicId:      { type: DataTypes.STRING(500), allowNull: false },
  resourceType:  { type: DataTypes.ENUM("image","raw"), defaultValue: "image" },
  mimeType:      { type: DataTypes.STRING(100) },
  size:          { type: DataTypes.BIGINT.UNSIGNED },
  folder:        { type: DataTypes.STRING(200), defaultValue: "media" },
  uploadedBy:    { type: DataTypes.INTEGER.UNSIGNED },
  tags:          { type: DataTypes.JSON },
}, { tableName: "media" });

Media.belongsTo(Admin, { foreignKey: "uploadedBy", as: "uploader", constraints: false });

// ── AdmissionEnquiry ──────────────────────────────────────────────────────
const AdmissionEnquiry = sequelize.define("AdmissionEnquiry", {
  studentName:   { type: DataTypes.STRING(200), allowNull: false },
  parentName:    { type: DataTypes.STRING(200) },
  email:         { type: DataTypes.STRING(255) },
  phone:         { type: DataTypes.STRING(50) },
  classApplying: { type: DataTypes.STRING(100) },
  message:       { type: DataTypes.TEXT },
  status:        { type: DataTypes.ENUM("new","in_review","accepted","rejected"), defaultValue: "new" },
  notes:         { type: DataTypes.TEXT },
}, { tableName: "admission_enquiries" });

// ── ContactMessage ────────────────────────────────────────────────────────
const ContactMessage = sequelize.define("ContactMessage", {
  name:    { type: DataTypes.STRING(200), allowNull: false },
  email:   { type: DataTypes.STRING(255), allowNull: false },
  phone:   { type: DataTypes.STRING(50) },
  subject: { type: DataTypes.STRING(300) },
  message: { type: DataTypes.TEXT, allowNull: false },
  status:  { type: DataTypes.ENUM("new","read","replied"), defaultValue: "new" },
}, { tableName: "contact_messages" });

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
