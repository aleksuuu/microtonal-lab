import { FreqMidiNoteCents } from "../../common/types";
import { useState } from "react";
import { getImaginaryFundamentals } from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";

const FundamentalFinder = () => {
  const [freqInput, setFreqInput] = useState(440);
  const [minFreq, setMinFreq] = useState(20);
  const [maxFreq, setMaxFreq] = useState(220);
  const handleNumberInput = (id: string, v: number) => {
    switch (id) {
      case "fundamental-finder-freq-input":
        setFreqInput(v);
        break;
      case "fundamental-finder-min-freq":
        setMinFreq(v);
        break;
      case "fundamental-finder-max-freq":
        setMaxFreq(v);
        break;
    }
  };

  const formatFundamental = (
    idx: number,
    partial: FreqMidiNoteCents
  ): React.ReactElement => {
    let addCents = "";
    if (partial.addCents !== 0) {
      addCents = Math.round(partial.addCents) + "¢";
      if (partial.addCents > 0) {
        addCents = "+" + addCents;
      }
    }
    return (
      <tr key={idx}>
        <th scope="row">{idx}</th>
        <td>{partial.freq}</td>
        <td>
          {partial.noteName}
          {partial.octave}
          {addCents}
        </td>
      </tr>
    );
  };
  const getFormattedFundamentals = (): React.ReactElement => {
    const fundamentals = getImaginaryFundamentals(freqInput, minFreq, maxFreq);
    return (
      <tbody>
        {fundamentals.map((fundamental) =>
          formatFundamental(fundamental.partialNum, fundamental.fundamental)
        )}
      </tbody>
    );
  };

  return (
    <div>
      <h2>Fundamental Finder</h2>
      <NumberInput
        id="fundamental-finder-freq-input"
        value={freqInput}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Frequency
      </NumberInput>
      <NumberInput
        id="fundamental-finder-min-freq"
        value={minFreq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Minimum frequency for imaginary fundamentals
      </NumberInput>
      <NumberInput
        id="fundamental-finder-max-freq"
        value={maxFreq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Minimum frequency for imaginary fundamentals
      </NumberInput>
      <table>
        <thead>
          <tr>
            <th scope="col">Partial number of input frequency</th>
            <th scope="col">Fundamental frequency</th>
            <th scope="col">Fundamental note</th>
          </tr>
        </thead>
        {getFormattedFundamentals()}
      </table>
    </div>
  );
};

export default FundamentalFinder;
