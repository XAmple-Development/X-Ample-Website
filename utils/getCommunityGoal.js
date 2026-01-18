import axios from "axios";

export async function getCommunityGoal() {
    if(process.env.NEXT_PUBLIC_IS_DEMO === "true") {
        return [
            {
                "id": 4,
                "created_at": "2019-03-13 13:11:57",
                "updated_at": "2019-04-09 10:59:26",
                "account": 55,
                "name": "Demo Community Goal",
                "description": "<p>Demo Community Goal</p>",
                "image": "",
                "target": "100.00",
                "current": "72.00",
                "repeatable": 0,
                "last_achieved": null,
                "times_achieved": 0,
                "status": "active",
                "sale": 0
            },
        ];
    }
    if (!process.env.SERVER_SECRET) return [];

    try {
        const response = await axios.get("https://plugin.tebex.io/community_goals", {
            headers: {
                "X-Tebex-Secret": process.env.SERVER_SECRET
            }
        });
        const data = response.data;
        return data || [];
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}