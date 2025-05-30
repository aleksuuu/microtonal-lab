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
import VerovioRenderer from "../VerovioRenderer";

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

  const validateNumberInput = () => {
    setCommonFundamentals(
      getCommonFundamentals(freqNums, minFreq, maxFreq, tolerance)
    );
  };

  const handleNumberInputOnBlur = (_id: string, _v: number) => {
    validateNumberInput();
  };

  const handleNumberInputOnEnter = (_id: string) => {
    validateNumberInput();
  };

  const handleTextInputOnChange = (_id: string, v: string) => {
    setFreqsTextInput(v);
  };

  const validateTextInput = () => {
    if (freqsTextInput === "") {
      setTextInputErr(TextInputErrorType.NO_ERROR);
      setFreqNums([]);
      setCommonFundamentals([]);
      return;
    }
    const newFreqNums = getNumbersFromTextInput(freqsTextInput);
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

  const handleTextInputOnBlur = (_id: string, _v: string) => {
    validateTextInput();
  };

  const handleTextInputOnEnter = (_id: string) => {
    validateTextInput();
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
      <div className="default-flexbox">
        <div className="utility-tools-input-form">
          <TextInput
            id="fundamental-finder-freq-input"
            text={freqsTextInput}
            onChange={handleTextInputOnChange}
            onBlur={handleTextInputOnBlur}
            onEnter={handleTextInputOnEnter}
            border={
              textInputErr === TextInputErrorType.NO_ERROR
                ? BorderType.NORMAL
                : BorderType.FAILURE
            }
          >
            Partial frequencies (separated by space)
          </TextInput>
          {textInputErr !== TextInputErrorType.NO_ERROR && (
            <p>{textInputErr}</p>
          )}
          <NumberInput
            id="fundamental-finder-min-freq"
            value={minFreq}
            isFreqValue={true}
            onChange={handleNumberInputOnChange}
            onBlur={handleNumberInputOnBlur}
            onEnter={handleNumberInputOnEnter}
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
            onEnter={handleNumberInputOnEnter}
            className="medium-input"
          >
            Maximum frequency for imaginary fundamentals
          </NumberInput>
          <NumberInput
            id="fundamental-finder-tolerance"
            value={tolerance}
            onChange={handleNumberInputOnChange}
            onBlur={handleNumberInputOnBlur}
            onEnter={handleNumberInputOnEnter}
            className="medium-input"
          >
            Acceptable margin of error in cents (imaginary fundamentals within
            this difference would be considered equal)
          </NumberInput>
        </div>
        {commonFundamentals.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Imaginary Fundamentals /<br />
                    Partials
                  </th>
                  {getInputFrequencies()}
                </tr>
              </thead>
              {formattedFundamentals}
            </table>
            <VerovioRenderer
              notes={commonFundamentals.map((f) => f.fundamental)}
            ></VerovioRenderer>
          </>
        )}
      </div>
    </div>
  );
};

export default FundamentalFinder;
