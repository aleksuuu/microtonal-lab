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
  onChange?: (id: string, v: number) => void;
  onBlur?: (id: string, v: number) => void;
}

// TODO: base this on Input

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
  onChange,
  onBlur,
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
      onChange={onChange}
      onBlur={onBlur}
    >
      {children}
    </Input>
  );
};

export default NumberInput;
