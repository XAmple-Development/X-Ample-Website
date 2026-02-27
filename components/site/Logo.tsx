import Link from "next/link";

const LOGO_SRC =
  "https://media.discordapp.net/attachments/1247301558891188325/1417938349389512806/4bSGPHi.png?ex=69a331fe&is=69a1e07e&hm=9513ada26e888e3c7bdea01213d7175ebc7972058a56cc4fc95dc3e3177c02e9&=&format=webp&quality=lossless&width=750&height=750";

export function Logo() {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2 font-semibold tracking-tight"
      aria-label="X-Ample Development"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={LOGO_SRC}
        alt=""
        className="h-8 w-8 rounded-lg object-cover"
      />
      <span className="hidden sm:inline">X-Ample Development</span>
    </Link>
  );
}

