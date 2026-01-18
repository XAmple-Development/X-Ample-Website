import { getSettings } from "./settingsServer";

export async function getBlogBySlug(slug) {
    const settings = await getSettings();
    const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
    return posts.find(p => p.slug === slug);
}