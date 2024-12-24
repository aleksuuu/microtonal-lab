import "./index.scss";

export enum BorderType {
  Hidden = "border-hidden",
  Normal = "border-normal",
  Success = "border-success",
  Failure = "border-failure",
}

interface Props {
  children: string;
  border?: BorderType;
  disabled?: boolean;
  isAnswerButton?: boolean;
  onClick?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
}

const Button = ({
  children,
  border,
  disabled,
  isAnswerButton,
  onClick,
  type,
}: Props) => {
  const classes = [
    isAnswerButton ? "ans-button" : "",
    border ? border : BorderType.Normal,
  ];
  return (
    <button
      className={classes.join(" ")}
      disabled={disabled}
      onClick={onClick ? onClick : undefined}
      type={type}
    >
      {children}
    </button>
  );
};

export default Button;
