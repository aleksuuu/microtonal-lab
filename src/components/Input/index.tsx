import { useState } from "react";
import { BorderType, PitchType } from "../../common/types";
import "./index.scss";
import ContextMenu from "../ContextMenu";

interface Props {
  border?: BorderType;
  children?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id: string;
  value: number | string;
  type?: string;
  min?: number;
  max?: number;
  step?: string | number;
  useContextMenu?: boolean;
  valueType?: PitchType;
  onChange?:
    | ((id: string, v: string) => void)
    | ((id: string, v: number) => void);
  onBlur?:
    | ((id: string, v: string) => void)
    | ((id: string, v: number) => void);
  onEnter?: (id: string) => void;
}

const Input = ({
  border = BorderType.NORMAL,
  children,
  className,
  inputClassName,
  disabled,
  id,
  type = "text",
  value,
  min,
  max,
  step = "any",
  useContextMenu = false,
  valueType,
  onChange,
  onBlur,
  onEnter,
}: Props) => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const handleContextMenu = (event: React.MouseEvent) => {
    if (useContextMenu) {
      event.preventDefault();
      setMousePos({ x: event.clientX, y: event.clientY });
    }
  };
  const handleMenuClose = () => {
    setMousePos(null);
  };
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (onChange) {
      const inputValue =
        type === "number" ? event.target.valueAsNumber : event.target.value;
      if (typeof inputValue === "number" && type === "number") {
        (onChange as (id: string, v: number) => void)(id, inputValue);
      } else {
        (onChange as (id: string, v: string) => void)(id, inputValue as string);
      }
    }
  };
  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      const inputValue =
        type === "number" ? event.target.valueAsNumber : event.target.value;

      // Use overloads for the correct type call
      if (typeof inputValue === "number" && type === "number") {
        (onBlur as (id: string, v: number) => void)(id, inputValue);
      } else {
        (onBlur as (id: string, v: string) => void)(id, inputValue as string);
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (onEnter) {
      if (event.key === "Enter") {
        onEnter(id);
      }
    }
  };


  return (
    <span className={`custom-input ${className}`}>
      <p>{children}</p>
      <input
        type={type}
        className={`${inputClassName} ${border}`}
        disabled={disabled}
        id={id}
        min={min}
        max={max}
        value={value}
        step={step}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onContextMenu={handleContextMenu}
      ></input>
      {mousePos !== null && valueType !== undefined && (
        <ContextMenu
          mousePos={mousePos}
          value={value}
          valueType={valueType}
          onClose={handleMenuClose}
        />
      )}
    </span>
  );
};

export default Input;
