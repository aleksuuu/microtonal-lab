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
  onClick: () => void;
}

const Button = ({
  children,
  border,
  disabled,
  isAnswerButton,
  onClick,
}: Props) => {
  const classes = [
    isAnswerButton ? "ans-button" : "",
    border ? border : BorderType.Hidden,
  ];
  return (
    <button className={classes.join(" ")} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
