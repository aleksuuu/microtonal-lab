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
  isAnswerButton?: boolean;
  onClick: () => void;
}

const Button = ({ children, border, isAnswerButton, onClick }: Props) => {
  const classes = [
    isAnswerButton ? "ans-button" : "",
    border ? border : BorderType.Hidden,
  ];
  return (
    <button className={classes.join(" ")} onClick={onClick}>
      {children}
    </button>
  );
};

export default Button;
