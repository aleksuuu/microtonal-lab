import * as NumericInput from "react-numeric-input";
import "./index.scss";

interface Props {
  children?: string;
  className?: string;
  disabled?: boolean;
  id: string;
  initValue: number;
  isFreqValue?: boolean;
  onChange: (id: string, v: number) => void;
}

const NumberInput = ({
  children,
  className,
  disabled,
  id,
  initValue,
  isFreqValue,
  onChange,
}: Props) => {
  return (
    <span className={`number-input ${className}`}>
      <p>{children}</p>
      <NumericInput
        disabled={disabled}
        id={id}
        min={isFreqValue ? 20 : 0}
        max={isFreqValue ? 10000 : 1000}
        name={id}
        value={initValue}
        step={1}
        precision={isFreqValue ? 1 : 0}
        onChange={(v: number | null) => {
          if (v) {
            onChange(id, v);
          }
        }}
      />
    </span>
  );
};

export default NumberInput;
