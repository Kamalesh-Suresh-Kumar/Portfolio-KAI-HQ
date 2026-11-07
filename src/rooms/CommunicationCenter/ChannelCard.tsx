import React from "react";
import { ExternalLink } from "lucide-react";

export interface ChannelItem {
  id: string;
  name: string;
  sub: string;
  url: string;
  icon: React.ReactNode;
  isExternal?: boolean;
}

interface ChannelCardProps {
  channel: ChannelItem;
}

export default function ChannelCard({ channel }: ChannelCardProps) {
  return (
    <a
      href={channel.url}
      target={channel.isExternal ? "_blank" : undefined}
      rel={channel.isExternal ? "noopener noreferrer" : undefined}
      className="channel-card"
      aria-label={`Open ${channel.name} (${channel.sub})`}
    >
      <div className="channel-card-left">
        <div className="channel-icon-wrapper">{channel.icon}</div>
        <div className="channel-info">
          <span className="channel-name">{channel.name}</span>
          <span className="channel-sub">{channel.sub}</span>
        </div>
      </div>

      <ExternalLink size={14} color="#94a3b8" />
    </a>
  );
}
