import NumberInput from "../NumberInput";
import { freqToNoteName } from "../../common/UtilityFuncs";
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
  className = "freq-input",
  numberInputClassName,
  disabled,
  id,
  freq,
  onChange,
}: Props) => {
  return (
    <span className={className}>
      <NumberInput
        className={numberInputClassName}
        disabled={disabled}
        id={id}
        value={freq}
        isFreqValue={true}
        onChange={(id: string, v: number) => {
          // setFreq(v);
          onChange(id, v);
        }}
      >
        {children}
      </NumberInput>
      <span className="note-name unimportant">{freqToNoteName(freq)}</span>
    </span>
  );
};

export default FreqInput;
