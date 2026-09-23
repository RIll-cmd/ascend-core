import LoadingScreen from "@/components/ui/8bit/blocks/loading-screen";
import styles from "./loading.module.css";

const TIPS = [
  "Preparing your hunter systems.",
  "The next floor is almost ready.",
];

export function AscendFullScreenLoading(): React.JSX.Element {
  return (
    <LoadingScreen
      role="status"
      aria-live="polite"
      aria-label="Loading Ascend Core"
      variant="fullscreen"
      title="ASCEND CORE LOADING"
      tips={TIPS}
      progress={35}
      showPercentage={false}
      autoProgress={false}
      className={styles.fullscreen}
    />
  );
}
