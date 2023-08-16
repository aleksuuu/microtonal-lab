import QuestionCount from "../QuestionCount";
import ButtonGroup from "../ButtonGroup";
import Stopwatch from "../Stopwatch";
import { CanUseStopwatch } from "../Stopwatch";
import Button from "../Button";
import "./index.scss";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState, useRef } from "react";

interface Props {
  maker: ExerciseMaker;
  hidden: boolean;
  ref: React.RefObject<CanUseStopwatch>;
  onClickBack: () => void;
}

const Exercise = ({ maker, hidden, ref, onClickBack }: Props) => {
  const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
  const [answerIsHidden, setAnswerIsHidden] = useState(true);
  const [highlightButton, setHighlightButton] = useState("");
  const [resetBorder, setResetBorder] = useState(true);

  const nextIsDisabled = !answerIsCorrect && highlightButton === "";

  const buttonGroupIsDisabled = !nextIsDisabled;

  const onSelectButton = (item: string) => {
    setResetBorder(false);
    if (maker.verifyAnswer(item)) {
      setAnswerIsCorrect(true);
    } else {
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
    setResetBorder(true);
    setAnswerIsHidden(true);
    maker.makeInterval();
    maker.playInterval();
    setAnswerIsCorrect(false);
    setHighlightButton("");
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
    <div className="center" hidden={hidden}>
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
          <Button onClick={() => console.log("end")}>
            end exercise & view score
          </Button>
        </span>
      </div>
      <div className="answer-area center">
        <div className="grid-2 small-text">
          <span>
            <Stopwatch ref={ref} />
          </span>
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
        <Button onClick={() => ref.current?.reset()}>asdlfkj</Button>
      </div>
    </div>
  );
};

export default Exercise;
