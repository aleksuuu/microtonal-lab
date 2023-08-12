import * as NumericInput from "react-numeric-input";
import "./index.scss";

interface Props {
  id: string;
  initValue: number;
  isFreqValue?: boolean;
  onChange: (id: string, v: number) => void;
}

const NumberInput = ({ id, initValue, isFreqValue, onChange }: Props) => {
  return (
    <>
      <NumericInput
        id={id}
        min={isFreqValue ? 20 : 0}
        max={isFreqValue ? 10000 : 1000}
        value={initValue}
        step={1}
        precision={isFreqValue ? 1 : 0}
        onChange={(v: number | null, s: string, h: HTMLInputElement) => {
          if (v) {
            onChange(id, v);
          }
        }}
      />
    </>
  );
};

export default NumberInput;
