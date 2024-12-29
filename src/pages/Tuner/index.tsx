import { useState } from "react";
import Button from "../../components/Button";

const Tuner = () => {
  const [frequency, setFrequency] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);

  const startTuner = async () => {
    const audioContext = new window.AudioContext();
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 2048;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);

    const autoCorrelate = (
      buf: Float32Array,
      sampleRate: number
    ): number | null => {
      // Auto-correlation function to detect frequency
      let size = buf.length;
      let rms = 0;
      for (let i = 0; i < size; i++) rms += buf[i] * buf[i];
      rms = Math.sqrt(rms / size);

      if (rms < 0.01) return null;

      let r1 = 0,
        r2 = size - 1,
        thres = 0.2;
      for (let i = 0; i < size / 2; i++) {
        if (Math.abs(buf[i]) < thres) {
          r1 = i;
          break;
        }
      }
      for (let i = 1; i < size / 2; i++) {
        if (Math.abs(buf[size - i]) < thres) {
          r2 = size - i;
          break;
        }
      }

      buf = buf.slice(r1, r2);
      size = buf.length;

      const c = new Array(size).fill(0);
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - i; j++) {
          c[i] = c[i] + buf[j] * buf[j + i];
        }
      }

      let d = 0;
      while (c[d] > c[d + 1]) d++;
      let maxval = -1,
        maxpos = -1;
      for (let i = d; i < size; i++) {
        if (c[i] > maxval) {
          maxval = c[i];
          maxpos = i;
        }
      }
      let T0 = maxpos;

      let x1 = c[T0 - 1],
        x2 = c[T0],
        x3 = c[T0 + 1];
      let a = (x1 + x3 - 2 * x2) / 2;
      let b = (x3 - x1) / 2;
      if (a) T0 = T0 - b / (2 * a);

      return sampleRate / T0;
    };

    const updateFrequency = () => {
      analyser.getFloatTimeDomainData(dataArray);
      const detectedFrequency = autoCorrelate(
        dataArray,
        audioContext.sampleRate
      );
      setFrequency(detectedFrequency);
      requestAnimationFrame(updateFrequency);
    };

    updateFrequency();
    setIsListening(true);
  };

  return (
    <>
      <title>Microtonal Lab - Tuner</title>
      <h2>Tuner</h2>
      {!isListening ? (
        <Button onClick={startTuner}>Start Tuner</Button>
      ) : (
        <p>
          {frequency ? `Frequency: ${frequency.toFixed(2)} Hz` : "Detecting..."}
        </p>
      )}
    </>
  );
};

export default Tuner;
