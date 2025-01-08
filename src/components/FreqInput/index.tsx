import NumberInput from "../NumberInput";
import {
  formatFreqMidiNoteCentsIntoASingleString,
  fromFreq,
} from "../../common/UtilityFuncs";
import "./index.scss";

interface Props {
  children?: string;
  className?: string;
  numberInputClassName?: string;
  disabled?: boolean;
  id: string;
  freq: number;
  onChange: (id: string, v: number) => void;
}

const FreqInput = ({
  children,
  className = "",
  numberInputClassName = "",
  disabled,
  id,
  freq,
  onChange,
}: Props) => {
  const fullClassNames = `freq-input ${className}`;
  const fullNumberInputClassNames = `medium-input ${numberInputClassName}`;
  return (
    <span className={fullClassNames}>
      <NumberInput
        className={fullNumberInputClassNames}
        disabled={disabled}
        id={id}
        value={freq}
        isFreqValue={true}
        onChange={onChange}
      >
        {children}
      </NumberInput>
      <span className="note-name unimportant">
        {formatFreqMidiNoteCentsIntoASingleString(fromFreq(freq))}
      </span>
    </span>
  );
};

export default FreqInput;
