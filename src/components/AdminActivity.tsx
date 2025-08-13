import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ActivityItem {
  id: string;
  text: string;
  time: string;
}

const AdminActivity: React.FC = () => {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    const push = (text: string) =>
      setItems((prev) => [{ id: crypto.randomUUID(), text, time: new Date().toLocaleTimeString() }, ...prev].slice(0, 25));

    const channel = supabase
      .channel("admin-activity")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        (payload: any) => {
          const title = payload?.new?.title || payload?.old?.title || "";
          push(`Project ${String(payload?.eventType).toLowerCase()}: "${title}"`);
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vacancies" },
        (payload: any) => {
          const title = payload?.new?.title || payload?.old?.title || "";
          push(`Vacancy ${String(payload?.eventType).toLowerCase()}: "${title}"`);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
      <CardHeader>
        <CardTitle>Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-auto">
          {items.length === 0 ? (
            <p className="text-white/70">No recent activity yet.</p>
          ) : (
            items.map((it) => (
              <div key={it.id} className="flex items-center justify-between p-2 bg-white/5 rounded">
                <span className="text-sm">{it.text}</span>
                <span className="text-xs text-white/60">{it.time}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminActivity;
