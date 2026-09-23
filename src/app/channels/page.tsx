import { listChannels } from "@/lib/channels";
import { ChannelList } from "@/components/channels/channel-list";

export const dynamic = "force-dynamic";

export default async function ChannelsPage() {
  const channels = await listChannels();
  return <ChannelList initial={channels} />;
}
