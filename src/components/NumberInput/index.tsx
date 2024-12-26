import { useState } from "react";
import "./index.scss";

interface Props {
  children?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id: string;
  initValue: number;
  isFreqValue?: boolean;
  onChange: (id: string, v: number) => void;
}

const NumberInput = ({
  children,
  className,
  inputClassName,
  disabled,
  id,
  initValue,
  isFreqValue,
  onChange,
}: Props) => {
  const [value, setValue] = useState(initValue);
  return (
    <span className={`number-input ${className}`}>
      <p>{children}</p>
      <input
        type="number"
        className={inputClassName}
        disabled={disabled}
        id={id}
        min={isFreqValue ? 20 : 1}
        max={isFreqValue ? 10000 : 1000}
        value={value}
        step={isFreqValue ? "any" : 1}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          const v = event.target.valueAsNumber;
          if (v) {
            setValue(v);
            onChange(id, v);
          }
        }}
      ></input>
    </span>
  );
};

export default NumberInput;
