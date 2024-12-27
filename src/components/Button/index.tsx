import "./index.scss";
import { BorderType } from "../../common/types";

interface Props {
  children: string;
  id?: string;
  border?: BorderType;
  disabled?: boolean;
  disabledColor?: boolean;
  isAnswerButton?: boolean;
  onClick?: (() => void) | ((id: string) => void);
  type?: "button" | "submit" | "reset" | undefined;
}

const Button = ({
  children,
  id,
  border = BorderType.Normal,
  disabled,
  disabledColor,
  isAnswerButton,
  onClick,
  type,
}: Props) => {
  const classes = [
    isAnswerButton ? "ans-button" : "",
    border,
    disabledColor ? "disabled-color" : "",
  ];
  const handleOnClick = () => {
    if (!onClick) {
      return undefined;
    }
    if (typeof onClick === "function") {
      if (onClick.length === 0) {
        (onClick as () => void)(); // Invoke no-parameter function
      } else {
        (onClick as (id: string) => void)(id ?? ""); // Invoke function with `id` parameter
      }
    }
  };
  return (
    <button
      className={classes.join(" ")}
      id={id}
      disabled={disabled}
      onClick={handleOnClick}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
