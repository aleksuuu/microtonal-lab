import {
  BorderType,
  CommonFundamental,
  FreqMidiNoteCents,
  TextInputErrorType,
} from "../../common/types";
import { useState } from "react";
import {
  formatFreqMidiNoteCentsIntoASingleString,
  getCommonFundamentals,
  getNumbersFromTextInput,
} from "../../common/UtilityFuncs";
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
  const [tolerance, setTolerance] = useState(10);
  const [textInputErr, setTextInputErr] = useState(TextInputErrorType.NO_ERROR);

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
    if (v === "") {
      setTextInputErr(TextInputErrorType.NO_ERROR);
      setFreqNums([]);
      setCommonFundamentals([]);
      return;
    }
    const newFreqNums = getNumbersFromTextInput(v);
    if (newFreqNums.length === 0) {
      setTextInputErr(TextInputErrorType.PARSING);
      return;
    }
    if (newFreqNums.includes(0)) {
      setTextInputErr(TextInputErrorType.ZERO);
      return;
    }
    setTextInputErr(TextInputErrorType.NO_ERROR);
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
    return (
      <tr key={fundamental.freq}>
        <th scope="row">
          {formatFreqMidiNoteCentsIntoASingleString(fundamental)}
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
        border={
          textInputErr === TextInputErrorType.NO_ERROR
            ? BorderType.NORMAL
            : BorderType.FAILURE
        }
      >
        Partial frequencies (separated by space)
      </TextInput>
      {textInputErr !== TextInputErrorType.NO_ERROR && <p>{textInputErr}</p>}
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
        Acceptable margin of error in cents (imaginary fundamentals within this
        difference would be considered equal)
      </NumberInput>
      {commonFundamentals.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Imaginary Fundamentals/Partials</th>
              {getInputFrequencies()}
            </tr>
          </thead>
          {formattedFundamentals}
        </table>
      )}
    </div>
  );
};

export default FundamentalFinder;
