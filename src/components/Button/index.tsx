import "./index.scss";
import { BorderType } from "../../common/types";

interface Props {
  children: string;
  id?: string;
  border?: BorderType;
  className?: string;
  disabled?: boolean;
  disabledColor?: boolean;
  isAnswerButton?: boolean;
  onClick?: (() => void) | ((id: string) => void);
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
}

const Button = ({
  children,
  id,
  border = BorderType.NORMAL,
  className = "",
  disabled,
  disabledColor,
  isAnswerButton,
  onClick,
  onMouseEnter,
  onMouseLeave,
  type = "button",
}: Props) => {
  const classes = [
    isAnswerButton ? "ans-button" : "",
    border,
    disabledColor ? "disabled-color" : "",
    className,
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
