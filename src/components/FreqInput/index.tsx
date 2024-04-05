import { useState } from "react";
import NumberInput from "../NumberInput";
import { freqToNoteName } from "../../common/UtilityFuncs";
import "./index.scss";

interface Props {
  children?: string;
  className?: string;
  disabled?: boolean;
  id: string;
  initValue: number;
  onChange: (id: string, v: number) => void;
}

const FreqInput = ({
  children,
  className = "freq-input",
  disabled,
  id,
  initValue,
  onChange,
}: Props) => {
  const [freq, setFreq] = useState(initValue);

  return (
    <span className={className}>
      <NumberInput
        disabled={disabled}
        id={id}
        initValue={freq}
        isFreqValue={true}
        onChange={(id: string, v: number) => {
          setFreq(v);
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
