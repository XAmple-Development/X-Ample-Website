import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Bot, ArrowRight } from "lucide-react";

const bots = [
  {
    name: "X-Ample Moderation",
    description: "Advanced moderation, automod, logging, and anti-raid tools to keep your community safe.",
    clientId: "REPLACE_WITH_CLIENT_ID",
    permissions: "268823622", // Manage roles, messages, webhooks, view audit log, send messages, etc.
    avatar: "https://i.imgur.com/4bSGPHi.png",
  },
  {
    name: "X-Ample Utility",
    description: "Utility commands, role management, leveling, and powerful server tools in one bot.",
    clientId: "REPLACE_WITH_CLIENT_ID",
    permissions: "2147485696", // Slash commands, integrations, etc.
    avatar: "https://i.imgur.com/4bSGPHi.png",
  },
];

const buildInviteUrl = (clientId: string, permissions: string) =>
  `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=bot%20applications.commands`;

const DiscordBots = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <SEO
        title="Discord Bots | X-Ample Development"
        description="Explore our Discord bots and invite them to your server in one click. Moderation, utilities, and more."
        keywords="Discord bots, moderation bot, utility bot, invite Discord bot"
        url="https://x-ampledevelopment.com/bots"
        type="website"
      />
      <Header />

      <main>
        {/* Hero */}
        <section className="pt-24 pb-12 bg-gradient-to-br from-cyan-50 to-teal-50">
          <div className="container mx-auto px-6">
            <div className="text-center max-w-3xl mx-auto">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
                Discord <span className="bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent">Bots</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                Powerful, secure, and easy-to-use bots for your community. Invite them in a single click.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3 text-gray-700">
                <ShieldCheck className="w-5 h-5 text-cyan-600" />
                <span>Reliable uptime</span>
                <Sparkles className="w-5 h-5 text-teal-600" />
                <span>Continuously updated</span>
              </div>
            </div>
          </div>
        </section>

        {/* Bots Grid */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {bots.map((bot, idx) => {
                const hasClient = !bot.clientId.startsWith("REPLACE_");
                const inviteUrl = buildInviteUrl(bot.clientId, bot.permissions);
                return (
                  <Card key={idx} className="group hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-0 bg-white relative overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-4">
                        <img
                          src={bot.avatar}
                          alt={`${bot.name} avatar - Discord bot`}
                          className="w-14 h-14 rounded-full border"
                          loading="lazy"
                        />
                        <div>
                          <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bot className="w-5 h-5 text-cyan-600" /> {bot.name}
                          </CardTitle>
                          <CardDescription className="text-gray-600">
                            {bot.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex flex-wrap gap-3">
                        <Button
                          className="bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600 text-white"
                          onClick={() => window.open(inviteUrl, "_blank")}
                          disabled={!hasClient}
                          aria-disabled={!hasClient}
                        >
                          Invite to Server
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-800 hover:bg-gray-50"
                          onClick={() => window.open("https://discord.gg/bGhguE93Xp", "_blank")}
                        >
                          Support Server
                        </Button>
                      </div>
                      {!hasClient && (
                        <p className="mt-3 text-sm text-gray-500">
                          Note: Replace clientId with your bot's ID to enable the invite button.
                        </p>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default DiscordBots;
