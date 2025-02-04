import Input from "../Input";
import { BorderType, PitchType } from "../../common/types";

interface Props {
  border?: BorderType;
  children?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id: string;
  text: string;
  useContextMenu?: boolean;
  valueType?: PitchType;
  onChange?: (id: string, v: string) => void;
  onBlur?: (id: string, v: string) => void;
  onEnter?: (id: string) => void;
}

const TextInput = ({
  border = BorderType.NORMAL,
  children,
  className,
  inputClassName,
  disabled,
  id,
  text,
  useContextMenu = false,
  valueType,
  onChange,
  onBlur,
  onEnter,
}: Props) => {
  return (
    <Input
      border={border}
      className={className}
      inputClassName={inputClassName}
      id={id}
      value={text}
      disabled={disabled}
      useContextMenu={useContextMenu}
      valueType={valueType}
      onChange={(id: string, v: string) => {
        if (onChange) {
          onChange(id, v);
        }
      }}
      onBlur={(id: string, v: string) => {
        if (onBlur) {
          onBlur(id, v);
        }
      }}
      onEnter={onEnter}
    >
      {children}
    </Input>
  );
};

export default TextInput;
