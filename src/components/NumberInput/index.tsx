import { useState, useEffect } from "react";
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
  // 1. Local state to hold the string representation (allows for "-" or "")
  const [inputValue, setInputValue] = useState<string>(value.toString());

  // 2. Keep local state in sync if the prop 'value' changes from the outside
  useEffect(() => {
    if (parseFloat(inputValue) !== value) {
      setInputValue(value.toString());
    }
  }, [value]);

  const minV = min ?? (isFreqValue ? 20 : 1);
  const maxV = max ?? (isFreqValue ? 10000 : 1000);

  const handleChange = (id: string, v: string | number) => {
    const stringVal = v.toString();
    setInputValue(stringVal);

    // 3. Only trigger the parent onChange if it's a valid number
    const numericVal = parseFloat(stringVal);
    if (!isNaN(numericVal) && onChange) {
      onChange(id, numericVal);
    }
  };

  const handleBlur = (id: string) => {
    let numericVal = parseFloat(inputValue);

    // 4. Sanitize on blur: if empty or invalid, fallback to min or 0
    if (isNaN(numericVal)) {
      numericVal = minV;
    }

    // Clamp values to min/max
    const clampedVal = Math.max(minV, Math.min(maxV, numericVal));

    setInputValue(clampedVal.toString());
    if (onBlur) onBlur(id, clampedVal);
    // Also notify onChange of the final clamped value
    if (onChange) onChange(id, clampedVal);
  };

  return (
    <Input
      className={className}
      inputClassName={inputClassName}
      disabled={disabled}
      id={id}
      value={inputValue} // Pass the string state
      type="text"
      useContextMenu={useContextMenu}
      valueType={valueType}
      onChange={handleChange}
      onBlur={handleBlur}
      onEnter={onEnter}
    >
      {children}
    </Input>
  );
};

export default NumberInput;
