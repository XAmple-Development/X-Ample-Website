import { redirect } from "next/navigation";
import BlogClient from "../../../components/BlogClient";
import { getBlogs } from "../../../utils/getBlogs";
import { getSettings } from "../../../utils/settingsServer";

export const dynamic = "force-dynamic";

export async function generateMetadata() {
    const settings = await getSettings();
    return {
        title: "Blog | " + settings.server.settings.server_name,
        description: "Explore the latest news, updates and guides from " + settings.server.settings.server_name + ".",
        openGraph: {
            title: "Blog | " + settings.server.settings.server_name,
            description: "Explore the latest news, updates and guides from " + settings.server.settings.server_name + ".",
        }
    };
}

export default async function BlogPage() {
    const settings = await getSettings();
    if (!settings.blog.settings.enabled) {
        return redirect("/")
    }

    const posts = await getBlogs();
    return <BlogClient posts={posts} />;
} 