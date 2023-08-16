import { useStopwatch } from "react-timer-hook";
import { forwardRef, useImperativeHandle } from "react";

interface Props {}

export interface CanUseStopwatch {
  totalSeconds: number;
  start: () => void;
  reset: () => void;
}

const Stopwatch = forwardRef<CanUseStopwatch, {}>((props, ref) => {
  const { totalSeconds, start, reset } = useStopwatch({
    autoStart: true,
  });
  useImperativeHandle(ref, () => ({
    totalSeconds,
    start,
    reset,
  }));

  const min = Math.floor(totalSeconds / 60),
    sec = totalSeconds % 60;
  return (
    <>
      <span>{min < 10 ? min.toString().padStart(2, "0") : min}</span>:
      <span>{sec.toString().padStart(2, "0")}</span>
    </>
  );
});

export default Stopwatch;
