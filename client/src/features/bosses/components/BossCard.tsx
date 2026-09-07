import type { Boss } from "../store/useBossStore";
import { BossThreatContract } from "./BossThreatContract";

interface BossCardProps {
  boss: Boss;
  isNew?: boolean;
}

/** Compatibility facade for existing imports of the active boss presentation. */
export function BossCard({ boss, isNew = false }: BossCardProps) {
  return <BossThreatContract boss={boss} isNew={isNew} />;
}
