import { getSettings } from "./settingsServer";
import { getDemoBlogs } from "./demoBlogs";

export async function getBlogs(limit = 48) {
    const settings = await getSettings();
    if (!settings.blog?.settings?.enabled) return [];
    const posts = Array.isArray(settings.blog?.settings?.posts) ? settings.blog.settings.posts : [];
    const sorted = [...posts].sort((a, b) => new Date(b.published_at || 0) - new Date(a.published_at || 0));
    return typeof limit === 'number' && limit > 0 ? sorted.slice(0, limit) : sorted;
} 