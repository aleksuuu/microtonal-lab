interface Props {
  count: number;
  total?: number;
  infiniteMode?: boolean;
}

const QuestionCount = ({ count, total, infiniteMode }: Props) => {
  let text = "";
  if (infiniteMode) {
    text = "Q" + count + " (infinite mode)";
  } else if (total) {
    text = "Q" + count + "/" + total;
  }
  return <>{text}</>;
};

export default QuestionCount;
