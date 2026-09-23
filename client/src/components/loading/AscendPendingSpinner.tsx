import { Spinner } from "@/components/ui/8bit/spinner";
import { cn } from "@/lib/utils";
import styles from "./loading.module.css";

export interface AscendPendingSpinnerProps {
  label: string;
  className?: string;
}

export function AscendPendingSpinner({ label, className }: AscendPendingSpinnerProps): React.JSX.Element {
  return (
    <span role="status" aria-live="polite" aria-label={label} className={cn("inline-flex items-center", styles.pending, className)}>
      <Spinner variant="diamond" aria-hidden="true" className="size-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}
