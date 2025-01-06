import {
  BorderType,
  CommonFundamental,
  FreqMidiNoteCents,
} from "../../common/types";
import { useState } from "react";
import { getCommonFundamentals } from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import TextInput from "../TextInput";

const FundamentalFinder = () => {
  const [freqsTextInput, setFreqsTextInput] = useState("");
  const [freqNums, setFreqNums] = useState<number[]>([]);
  const [commonFundamentals, setCommonFundamentals] = useState<
    CommonFundamental[]
  >([]);
  const [minFreq, setMinFreq] = useState(20);
  const [maxFreq, setMaxFreq] = useState(220);
  const [tolerance, setTolerance] = useState(0.1);
  const [textInputHasErr, setTextInputHasErr] = useState(false);

  const handleNumberInputOnChange = (id: string, v: number) => {
    switch (id) {
      case "fundamental-finder-min-freq":
        setMinFreq(v);
        break;
      case "fundamental-finder-max-freq":
        setMaxFreq(v);
        break;
      case "fundamental-finder-tolerance":
        setTolerance(v);
        break;
    }
  };

  const handleNumberInputOnBlur = (_id: string, _v: number) => {
    setCommonFundamentals(
      getCommonFundamentals(freqNums, minFreq, maxFreq, tolerance)
    );
  };

  const handleTextInputOnChange = (_id: string, v: string) => {
    setFreqsTextInput(v);
  };

  const handleTextInputOnBlur = (_id: string, v: string) => {
    const freqsAsStr = v.trim().split(/\s+/); // separate numbers by one or more spaces
    const newFreqNums: number[] = [];
    for (const f of freqsAsStr) {
      const freqAsNum = Number(f);
      if (isNaN(freqAsNum)) {
        setTextInputHasErr(true);
        setFreqNums([]);
        return;
      }
      newFreqNums.push(freqAsNum);
    }
    setTextInputHasErr(false);
    setFreqNums(newFreqNums);
    const commonFunds = getCommonFundamentals(
      newFreqNums,
      minFreq,
      maxFreq,
      tolerance
    );
    setCommonFundamentals(commonFunds);
  };

  const formatFundamental = (
    partials: number[],
    fundamental: FreqMidiNoteCents
  ): React.ReactElement => {
    let addCents = "";
    if (fundamental.addCents !== 0) {
      addCents = Math.round(fundamental.addCents) + "¢";
      if (fundamental.addCents > 0) {
        addCents = "+" + addCents;
      }
    }
    return (
      <tr key={fundamental.freq}>
        <th scope="row">
          {fundamental.freq.toFixed(2)} Hz ({fundamental.noteName}
          {fundamental.octave}
          {addCents})
        </th>
        {partials.map((p) => (
          <td>{p}</td>
        ))}
      </tr>
    );
  };
  const formattedFundamentals = (
    <tbody>
      {commonFundamentals &&
        commonFundamentals.map((fundamental) =>
          formatFundamental(fundamental.partialNums, fundamental.fundamental)
        )}
    </tbody>
  );

  const getInputFrequencies = (): React.ReactElement[] => {
    if (freqNums.length > 0) {
      return freqNums.map((f) => (
        <th scope="col" key={f}>
          {f} Hz
        </th>
      ));
    }
    return [];
  };

  return (
    <div>
      <h2>Fundamental Finder</h2>
      <TextInput
        id="fundamental-finder-freq-input"
        text={freqsTextInput}
        onChange={handleTextInputOnChange}
        onBlur={handleTextInputOnBlur}
        border={textInputHasErr ? BorderType.FAILURE : BorderType.NORMAL}
      >
        Partial frequencies (separated by space)
      </TextInput>
      <p>{textInputHasErr ? "Error parsing frequencies." : ""}</p>
      <NumberInput
        id="fundamental-finder-min-freq"
        value={minFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Minimum frequency for imaginary fundamentals
      </NumberInput>
      <NumberInput
        id="fundamental-finder-max-freq"
        value={maxFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Maximum frequency for imaginary fundamentals
      </NumberInput>
      <NumberInput
        id="fundamental-finder-tolerance"
        value={tolerance}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Allowed difference in Hz (imaginary fundamentals would be considered
        equal if they are within this difference)
      </NumberInput>
      <table hidden={commonFundamentals.length === 0}>
        <thead>
          <tr>
            <th scope="col">Imaginary Fundamentals/Partial Frequencies</th>
            {getInputFrequencies()}
          </tr>
        </thead>
        {formattedFundamentals}
      </table>
    </div>
  );
};

export default FundamentalFinder;
