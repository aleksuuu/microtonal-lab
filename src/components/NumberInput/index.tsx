import { PitchType } from "../../common/types";
import Input from "../Input";

interface Props {
  children?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id: string;
  value: number;
  min?: number;
  max?: number;
  isFreqValue?: boolean;
  useContextMenu?: boolean;
  valueType?: PitchType;
  onChange?: (id: string, v: number) => void;
  onBlur?: (id: string, v: number) => void;
  onEnter?: (id: string) => void;
}

const NumberInput = ({
  children,
  className,
  inputClassName,
  disabled,
  id,
  value,
  min,
  max,
  isFreqValue,
  useContextMenu = false,
  valueType,
  onChange,
  onBlur,
  onEnter,
}: Props) => {
  const minV = min ? min : isFreqValue ? 20 : 1;
  const maxV = max ? max : isFreqValue ? 10000 : 1000;
  return (
    <Input
      className={className}
      inputClassName={inputClassName}
      disabled={disabled}
      id={id}
      value={value}
      type="number"
      min={minV}
      max={maxV}
      step={isFreqValue ? "any" : 1}
      useContextMenu={useContextMenu}
      valueType={valueType}
      onChange={onChange}
      onBlur={onBlur}
      onEnter={onEnter}
    >
      {children}
    </Input>
  );
};

export default NumberInput;
