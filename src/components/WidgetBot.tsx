import { useEffect } from "react";

const WidgetBot = () => {
    useEffect(() => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/@widgetbot/crate@3";
        script.async = true;
        script.defer = true;

        script.onload = () => {
            // @ts-ignore – ignore if TS doesn't recognize window.Crate
            new window.Crate({
                server: "1242390702311342121", // X-Ample Group
                channel: "1242390702860668943", // #general-chat
                color: "#06b6d4", // optional: accent color
                notifications: true,
            });
        };

        document.body.appendChild(script);
        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return null;
};

export default WidgetBot;
