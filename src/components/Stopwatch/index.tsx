import { useStopwatch } from "react-timer-hook";

const Stopwatch = () => {
  const { totalSeconds } = useStopwatch({
    autoStart: true,
  });

  const min = Math.floor(totalSeconds / 60),
    sec = totalSeconds % 60;
  return (
    <>
      <span>{min < 10 ? min.toString().padStart(2, "0") : min}</span>:
      <span>{sec.toString().padStart(2, "0")}</span>
    </>
  );
};

export default Stopwatch;
