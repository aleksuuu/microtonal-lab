import Input from "../Input";
import { BorderType } from "../../common/types";

interface Props {
  border?: BorderType;
  children?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  id: string;
  text: string;
  onChange?: (id: string, v: string) => void;
  onBlur?: (id: string, v: string) => void;
}

const TextInput = ({
  border = BorderType.Normal,
  children,
  className,
  inputClassName,
  disabled,
  id,
  text,
  onChange,
  onBlur,
}: Props) => {
  return (
    <Input
      border={border}
      className={className}
      inputClassName={inputClassName}
      id={id}
      value={text}
      disabled={disabled}
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
    >
      {children}
    </Input>
  );
};

export default TextInput;
