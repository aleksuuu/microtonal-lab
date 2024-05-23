import QuestionCount from "../QuestionCount";
import ButtonGroup from "../ButtonGroup";
import Stopwatch from "../Stopwatch";
import Button from "../Button";
import "./index.scss";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";

// TODO: figure out hwo to stop stopwatch

interface Props {
  maker: ExerciseMaker;
  onClickBack: () => void;
  onClickEnd: () => void;
  onAnswer: (isCorrect: boolean) => void;
  onNext: () => void;
  totalSeconds: number;
  pause: () => void;
}

const Exercise = ({
  maker,
  onClickBack,
  onClickEnd,
  onAnswer,
  onNext,
  totalSeconds,
  pause,
}: Props) => {
  const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
  const [answerIsHidden, setAnswerIsHidden] = useState(true);
  const [highlightButton, setHighlightButton] = useState("");
  const [resetBorder, setResetBorder] = useState(true);

  const nextIsDisabled = !answerIsCorrect && highlightButton === "";

  const buttonGroupIsDisabled = !nextIsDisabled;

  const onSelectButton = (item: string) => {
    setResetBorder(false);
    if (maker.verifyAnswer(item)) {
      onAnswer(true);
      setAnswerIsCorrect(true);
    } else {
      onAnswer(false);
      setAnswerIsCorrect(false);
    }
  };

  const tellMe = () => {
    setResetBorder(false);
    setHighlightButton(maker.currInterval?.name ?? "");
    setAnswerIsHidden(false);
  };

  const back = () => {
    initStates();
    onClickBack();
  };

  const next = () => {
    onNext();
    setResetBorder(true);
    setAnswerIsHidden(true);
    maker.makeInterval();
    maker.playInterval();
    setAnswerIsCorrect(false);
    setHighlightButton("");
  };

  const end = () => {
    pause();
    onNext();
    onClickEnd();
  };

  const initStates = () => {
    if (
      answerIsCorrect ||
      !answerIsHidden ||
      highlightButton != "" ||
      !resetBorder
    ) {
      setAnswerIsCorrect(false);
      setAnswerIsHidden(true);
      setHighlightButton("");
      setResetBorder(true);
    }
  };

  return (
    <div className="center">
      <div className="grid-3 border-bottom option-buttons">
        <span>
          <Button onClick={back}>back to options</Button>
        </span>
        <span>
          <Button
            onClick={() => {
              maker.playInterval();
            }}
          >
            replay
          </Button>
        </span>
        <span>
          <Button onClick={end}>end exercise & view score</Button>
        </span>
      </div>
      <div className="answer-area center">
        <div className="grid-3 small-text">
          <span>
            <Stopwatch totalSeconds={totalSeconds} />
          </span>
          <span>"test"</span>
          <span>
            <QuestionCount
              count={maker.questionIndex}
              total={maker.numQuestions}
              infiniteMode={maker.infiniteMode}
            ></QuestionCount>
          </span>
        </div>
        <div className="button-group">
          <ButtonGroup
            answerIsCorrect={answerIsCorrect}
            disabled={buttonGroupIsDisabled}
            highlightButton={highlightButton}
            items={maker.possibleIntervals.map((interval) => interval.name)}
            resetBorder={resetBorder}
            onSelectItem={onSelectButton}
          ></ButtonGroup>
        </div>
        <p hidden={answerIsHidden} className="smufl">
          {maker.currentNotes}
        </p>

        <Button onClick={tellMe}>tell me</Button>
        <Button disabled={nextIsDisabled} onClick={next}>
          next
        </Button>
        <p className="small-text learn-more">
          Learn more about Ups and Downs Notation at{" "}
          <a
            href="https://en.xen.wiki/w/Ups_and_Downs_Notation"
            target="_blank"
          >
            https://en.xen.wiki/w/Ups_and_Downs_Notation
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default Exercise;
