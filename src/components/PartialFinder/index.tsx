import {
  BorderType,
  CommonPartial,
  TextInputErrorType,
} from "../../common/types";
import { useState } from "react";
import {
  formatFreqMidiNoteCentsIntoASingleString,
  getCommonPartials,
  getNumbersFromTextInput,
} from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import TextInput from "../TextInput";
import VerovioRenderer from "../VerovioRenderer";

const PartialFinder = () => {
  const [freqsTextInput, setFreqsTextInput] = useState("");
  const [baseFreqNums, setBaseFreqNums] = useState<number[]>([]);
  const [commonPartials, setCommonPartials] = useState<CommonPartial[]>([]);
  const [minFreq, setMinFreq] = useState(110);
  const [maxFreq, setMaxFreq] = useState(880);
  const [tolerance, setTolerance] = useState(10); // cents
  const [textInputErr, setTextInputErr] = useState(TextInputErrorType.NO_ERROR);
  const handleNumberInputOnChange = (id: string, v: number) => {
    switch (id) {
      case "partial-finder-min-freq":
        setMinFreq(v);
        break;
      case "partial-finder-max-freq":
        setMaxFreq(v);
        break;
      case "partial-finder-tolerance":
        setTolerance(v);
        break;
    }
  };
  const handleNumberInputOnBlur = (_id: string, _v: number) => {
    setCommonPartials(
      getCommonPartials(baseFreqNums, minFreq, maxFreq, tolerance)
    );
  };
  const handleTextInputOnChange = (_id: string, v: string) => {
    setFreqsTextInput(v);
  };

  const handleTextInputOnBlur = (_id: string, v: string) => {
    if (v === "") {
      setTextInputErr(TextInputErrorType.NO_ERROR);
      setBaseFreqNums([]);
      setCommonPartials([]);
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
    setBaseFreqNums(newFreqNums);
    const newCommonPartials = getCommonPartials(
      newFreqNums,
      minFreq,
      maxFreq,
      tolerance
    );
    setCommonPartials(newCommonPartials);
  };

  const formatPartial = (commonPartial: CommonPartial): React.ReactElement => {
    return (
      <tr key={commonPartial.partial.freq}>
        <th scope="row">
          {formatFreqMidiNoteCentsIntoASingleString(commonPartial.partial)}
        </th>
        {commonPartial.partialNums.map((n) => (
          <td>{n}</td>
        ))}
      </tr>
    );
  };

  const formattedPartials = (
    <tbody>
      {commonPartials &&
        commonPartials.map((partial) => formatPartial(partial))}
    </tbody>
  );

  const getInputFrequencies = (): React.ReactElement[] => {
    if (baseFreqNums.length > 0) {
      return baseFreqNums.map((f) => (
        <th scope="col" key={f}>
          {f} Hz
        </th>
      ));
    }
    return [];
  };

  return (
    <div>
      <h2>Partial Finder</h2>
      <div className="default-flexbox">
        <div className="utility-tools-input-form">
          <TextInput
            id="partial-finder-freq-input"
            text={freqsTextInput}
            onChange={handleTextInputOnChange}
            onBlur={handleTextInputOnBlur}
            border={
              textInputErr === TextInputErrorType.NO_ERROR
                ? BorderType.NORMAL
                : BorderType.FAILURE
            }
          >
            Fundamental frequencies (separated by space)
          </TextInput>
          {textInputErr !== TextInputErrorType.NO_ERROR && (
            <p>{textInputErr}</p>
          )}
          <NumberInput
            id="partial-finder-min-freq"
            value={minFreq}
            isFreqValue={true}
            onChange={handleNumberInputOnChange}
            onBlur={handleNumberInputOnBlur}
            className="medium-input"
          >
            Minimum frequency for partials
          </NumberInput>
          <NumberInput
            id="partial-finder-max-freq"
            value={maxFreq}
            isFreqValue={true}
            onChange={handleNumberInputOnChange}
            onBlur={handleNumberInputOnBlur}
            className="medium-input"
          >
            Maximum frequency for partials
          </NumberInput>
          <NumberInput
            id="partial-finder-tolerance"
            value={tolerance}
            onChange={handleNumberInputOnChange}
            onBlur={handleNumberInputOnBlur}
            className="medium-input"
          >
            Acceptable margin of error in cents (partials within this difference
            would be considered equal)
          </NumberInput>
        </div>
        {commonPartials.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">
                    Common Partials /<br />
                    Fundamentals
                  </th>
                  {getInputFrequencies()}
                </tr>
              </thead>
              {formattedPartials}
            </table>
            <VerovioRenderer
              notes={commonPartials.map((p) => p.partial)}
            ></VerovioRenderer>
          </>
        )}
      </div>
    </div>
  );
};

export default PartialFinder;
