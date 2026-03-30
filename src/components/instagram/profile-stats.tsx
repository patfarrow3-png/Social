"use client";

import { useEffect, useState } from "react";
import { Users, FileImage, UserCheck } from "lucide-react";
import type { ProfileResponse, IGProfile } from "@/types/instagram-api";
import { MOCK_PROFILE } from "@/types/instagram-api";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function ProfileStats() {
  const [profile, setProfile] = useState<IGProfile | null>(null);
  const [isMock,  setIsMock]  = useState(true);

  useEffect(() => {
    fetch("/api/instagram/profile")
      .then(r => r.json())
      .then((data: ProfileResponse) => {
        setProfile(data.profile);
        setIsMock(data.isMock);
      })
      .catch(() => {});
  }, []);

  const p = profile ?? MOCK_PROFILE;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      {/* Avatar */}
      <div className="flex items-center gap-3">
        {p.profile_picture_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.profile_picture_url}
            alt={p.username}
            className="h-10 w-10 rounded-full object-cover ring-2 ring-pink-500/30"
          />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-sm font-bold text-white select-none">
            TG
          </div>
        )}
        <div>
          {p.biography && (
            <p className="text-xs text-muted-foreground max-w-xs truncate">{p.biography}</p>
          )}
          {isMock && (
            <p className="text-[10px] text-amber-400/70 mt-0.5">
              Token not configured — showing placeholder stats
            </p>
          )}
        </div>
      </div>

      {/* Stat pills */}
      <div className="ml-auto flex items-center gap-2 flex-wrap">
        {[
          { icon: Users,     label: "Followers",  value: fmt(p.followers_count) },
          { icon: UserCheck, label: "Following",  value: fmt(p.follows_count)   },
          { icon: FileImage, label: "Posts",      value: fmt(p.media_count)     },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <div className="text-right">
              <p className="text-sm font-semibold text-foreground leading-none">{value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
