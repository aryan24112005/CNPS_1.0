import pool from "../config/db.js";

// Get all active gallery albums with images
export const getPublicAlbums = async (req, res, next) => {
    try {
        const [albums] = await pool.query(`
            SELECT
                id,
                title,
                slug,
                description,
                cover_image,
                sort_order,
                created_at
            FROM gallery_albums
            WHERE status = 'active'
            ORDER BY sort_order ASC, id DESC
        `);

        if (albums.length === 0) {
            return res.status(200).json({
                success: true,
                albums: [],
            });
        }

        const albumIds = albums.map((album) => album.id);

        const [images] = await pool.query(
            `
            SELECT
                id,
                album_id,
                image,
                caption,
                sort_order,
                created_at
            FROM gallery_images
            WHERE album_id IN (?)
            ORDER BY sort_order ASC, id ASC
            `,
            [albumIds]
        );

        const albumsWithImages = albums.map((album) => ({
            ...album,
            images: images.filter(
                (image) => image.album_id === album.id
            ),
        }));

        return res.status(200).json({
            success: true,
            albums: albumsWithImages,
        });
    } catch (error) {
        next(error);
    }
};


// Get single active gallery album with images
export const getPublicAlbumBySlug = async (req, res, next) => {
    try {
        const { slug } = req.params;

        const [albums] = await pool.query(
            `
            SELECT
                id,
                title,
                slug,
                description,
                cover_image,
                sort_order,
                created_at
            FROM gallery_albums
            WHERE slug = ?
              AND status = 'active'
            `,
            [slug]
        );

        if (albums.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Gallery album not found.",
            });
        }

        const album = albums[0];

        const [images] = await pool.query(
            `
            SELECT
                id,
                album_id,
                image,
                caption,
                sort_order,
                created_at
            FROM gallery_images
            WHERE album_id = ?
            ORDER BY sort_order ASC, id ASC
            `,
            [album.id]
        );

        return res.status(200).json({
            success: true,
            album: {
                ...album,
                images,
            },
        });
    } catch (error) {
        next(error);
    }
};

// =====================================================
// Get active Why Us gallery images
// Uses main `gallery` table
// =====================================================

export const getPublicGalleryImages = async (req, res, next) => {
    try {
        const [images] = await pool.query(`
            SELECT
                id,
                title,
                description,
                category,
                image,
                sort_order,
                created_at
            FROM gallery
            WHERE status = 'active'
            ORDER BY sort_order ASC, id DESC
        `);

        return res.status(200).json({
            success: true,
            data: images,
        });
    } catch (error) {
        next(error);
    }
};