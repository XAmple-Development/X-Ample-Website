export function getDemoBlogs(limit = 48) {
    const now = new Date().toISOString();
    const images = [
        "/demo-image.png",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSW1sXVvfLOHZMkIAHK9YXLrvW79x7YJeYVJQ&s",
        "https://i.ytimg.com/vi/39Y1ZSc6ySk/maxresdefault.jpg",
        "https://images2.alphacoders.com/137/1370592.jpeg",
        "https://4kwallpapers.com/images/wallpapers/minecraft-the-3840x2160-20896.jpg",
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS3YBcUxgSzo2MgCm3iVdWHJleOXpVdFUVz5g&s"
    ];
    return [1, 2, 3, 4, 5, 6].map((n) => ({
        id: `demo-${n}`,
        uuid: `uuid-demo-${n}`,
        title: [
            "Getting Started on BlockyMC: Your First Day in Prison!",
            "How to Rank Up Fast",
            "Top 5 Ways to Earn Money",
            "Meet the Guards: Staff Spotlight",
            "Upcoming Events & Features",
            "Frequently Asked Questions about BlockyMC"
        ][n - 1],
        slug: [
            "getting-started-on-blockymc",
            "how-to-rank-up-fast-on-blockymc",
            "top-5-ways-to-earn-money-in-blockymc",
            "meet-the-guards-staff-spotlight-on-blockymc",
            "upcoming-events-and-features-on-blockymc",
            "frequently-asked-questions-about-blockymc"
        ][n - 1],
        html: [
            "<p>Welcome to BlockyMC! This guide will help you survive and thrive on your first day in our Minecraft prison server. Learn how to mine, trade, and avoid trouble as you begin your journey from A to Free!</p>",
            "<p>Want to rank up quickly? Discover the best strategies for earning money, completing quests, and making friends who can help you climb the ranks on BlockyMC.</p>",
            "<p>Money makes the world go round—even in prison! Here are the top 5 ways to fill your balance, from mining and selling to winning events and trading with other players.</p>",
            "<p>Our staff team keeps BlockyMC safe and fun. Meet the guards, wardens, and admins who watch over the server and help players every day.</p>",
            "<p>Stay tuned for new features, events, and updates coming soon to BlockyMC. Find out what’s next and how you can get involved!</p>",
            "<p>Got questions? We’ve got answers! Check out the most common questions new players ask about BlockyMC, from rules to gameplay tips.</p>"
        ][n - 1],
        feature_image: images[n - 1],
        feature_image_alt: null,
        feature_image_caption: null,
        published_at: now,
        created_at: now,
        updated_at: now,
        excerpt: [
            "Start your adventure on BlockyMC with this essential beginner’s guide.",
            "Tips and tricks to help you rank up fast on BlockyMC.",
            "Discover the best ways to earn money on our Minecraft prison server.",
            "Get to know the staff who keep BlockyMC running smoothly.",
            "Find out about upcoming events and new features on BlockyMC.",
            "Answers to the most common questions about BlockyMC."
        ][n - 1],
        custom_excerpt: null,
        codeinjection_head: null,
        codeinjection_foot: null,
        custom_template: null,
        canonical_url: null,
        authors: [
            {
                id: "author-demo-1",
                name: "BlockyMC Team",
                slug: "BlockyMC-team",
                profile_image: "https://placehold.co/100x100?text=Staff",
                cover_image: null,
                bio: "Minecraft BlockyMC server staff.",
                website: null,
                location: null,
                facebook: null,
                twitter: null,
                meta_title: null,
                meta_description: null,
                url: "/author/BlockyMC-team/"
            }
        ],
        tags: [
            {
                id: `tag-demo-${n}`,
                name: ["Getting Started", "Ranking Up", "Money Making", "Staff", "Events", "FAQ"][n - 1],
                slug: ["getting-started", "ranking-up", "money-making", "staff", "events", "faq"][n - 1],
                description: null,
                feature_image: null,
                visibility: "public",
                og_image: null,
                og_title: null,
                og_description: null,
                twitter_image: null,
                twitter_title: null,
                twitter_description: null,
                meta_title: null,
                meta_description: null,
                codeinjection_head: null,
                codeinjection_foot: null,
                canonical_url: null,
                accent_color: null,
                url: `/tag/${["getting-started", "ranking-up", "money-making", "staff", "events", "faq"][n - 1]}/`
            }
        ],
        primary_author: {
            id: "author-demo-1",
            name: "BlockyMC Team",
            slug: "BlockyMC-team",
            profile_image: "https://placehold.co/100x100?text=Staff",
            cover_image: null,
            bio: "Minecraft BlockyMC server staff.",
            website: null,
            location: null,
            facebook: null,
            twitter: null,
            meta_title: null,
            meta_description: null,
            url: "/author/BlockyMC-team/"
        },
        primary_tag: {
            id: `tag-demo-${n}`,
            name: ["Getting Started", "Ranking Up", "Money Making", "Staff", "Events", "FAQ"][n - 1],
            slug: ["getting-started", "ranking-up", "money-making", "staff", "events", "faq"][n - 1],
            description: null,
            feature_image: null,
            visibility: "public",
            og_image: null,
            og_title: null,
            og_description: null,
            twitter_image: null,
            twitter_title: null,
            twitter_description: null,
            meta_title: null,
            meta_description: null,
            codeinjection_head: null,
            codeinjection_foot: null,
            canonical_url: null,
            accent_color: null,
            url: `/tag/${["getting-started", "ranking-up", "money-making", "staff", "events", "faq"][n - 1]}/`
        },
        url: `/blog/${[
            "getting-started-on-BlockyMC",
            "how-to-rank-up-fast-on-BlockyMC",
            "top-5-ways-to-earn-money-in-BlockyMC",
            "meet-the-guards-staff-spotlight-on-BlockyMC",
            "upcoming-events-and-features-on-BlockyMC",
            "frequently-asked-questions-about-BlockyMC"
        ][n - 1]}/`,
        featured: false,
        visibility: "public",
        reading_time: 2,
        access: true,
        comments: false,
        og_image: null,
        og_title: null,
        og_description: null,
        twitter_image: null,
        twitter_title: null,
        twitter_description: null,
        meta_title: null,
        meta_description: null,
        email_subject: null,
        frontmatter: null
    })).slice(0, limit);
}