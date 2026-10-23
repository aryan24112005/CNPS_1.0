"use strict";
/**
 * Slug generation utility — replaces Mongoose pre-validate hooks.
 * Generates unique slugs by appending -1, -2, etc. for duplicates.
 */
const slugify = require("slugify");
const { Op } = require("sequelize");

/**
 * Generate a unique slug for a Sequelize model.
 * @param {Object} Model - Sequelize model
 * @param {string} title - Title to slugify
 * @param {string} [excludeId] - ID to exclude from uniqueness check (for updates)
 * @returns {Promise<string>}
 */
async function generateUniqueSlug(Model, title, excludeId = null) {
  let base = slugify(title || "untitled", { lower: true, strict: true }) || "item";
  let slug = base;
  let count = 1;

  const where = { slug };
  if (excludeId) where.id = { [Op.ne]: excludeId };

  while (await Model.findOne({ where, attributes: ["id"] })) {
    slug = `${base}-${count++}`;
    where.slug = slug;
  }

  return slug;
}

module.exports = { generateUniqueSlug };
