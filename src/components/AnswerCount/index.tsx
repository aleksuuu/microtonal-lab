interface Props {
  count: number;
}

const AnswerCount = ({ count }: Props) => {
  return <>{count} answered</>;
};

export default AnswerCount;
