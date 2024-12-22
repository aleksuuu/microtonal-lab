import QuestionCount from "../QuestionCount";
import ButtonGroup from "../ButtonGroup";
import Stopwatch from "../Stopwatch";
import Button from "../Button";
import "./index.scss";
import { useState } from "react";
import { Interval, IntervalWithNotes } from "../../common/types";

// TODO: figure out how to stop stopwatch (fixed?)

interface Props {
  answerIsCorrect: boolean;
  currInterval: IntervalWithNotes | null;
  handleBack: () => void;
  handleEnd: () => void;
  handleAnswer: (answer: string) => void;
  handleReplay: () => void;
  handleNext: () => void;
  totalSeconds: number;
  pause: () => void;
  formattedCurrNotes: string;
  numAnswered: number;
  numQuestions: number;
  infiniteMode: boolean;
  intervalsInScale: Interval[];
}

// pass down answerIsCorrect??
const Exercise = ({
  answerIsCorrect,
  currInterval,
  handleBack,
  handleEnd,
  handleAnswer,
  handleReplay,
  handleNext,
  totalSeconds,
  pause,
  formattedCurrNotes,
  numAnswered,
  numQuestions,
  infiniteMode,
  intervalsInScale,
}: Props) => {
  // const [answerIsCorrect, setAnswerIsCorrect] = useState(false);
  const [answerIsShown, setAnswerIsShown] = useState(false);
  const [highlightButton, setHighlightButton] = useState("");
  const [defaultBorder, setDefaultBorder] = useState(true);

  const nextIsDisabled = !answerIsCorrect && highlightButton === "";

  const buttonGroupIsDisabled = !nextIsDisabled;

  const tellMe = () => {
    setDefaultBorder(false);
    setHighlightButton(currInterval?.name ?? "");
    setAnswerIsShown(true);
  };

  const back = () => {
    initStates();
    handleBack();
  };

  const next = () => {
    setDefaultBorder(true);
    setAnswerIsShown(false);
    handleNext();
    // setAnswerIsCorrect(false);
    setHighlightButton("");
  };

  const end = () => {
    pause();
    // handleNext();
    handleEnd();
  };

  const initStates = () => {
    if (
      answerIsCorrect ||
      answerIsShown ||
      highlightButton != "" ||
      !defaultBorder
    ) {
      setAnswerIsShown(false);
      setHighlightButton("");
      setDefaultBorder(true);
    }
  };

  return (
    <div className="center">
      <div className="grid-3 border-bottom option-buttons">
        <span>
          <Button onClick={back}>back to options</Button>
        </span>
        <span>
          <Button onClick={handleReplay}>replay</Button>
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
              count={numAnswered}
              total={numQuestions}
              infiniteMode={infiniteMode}
            ></QuestionCount>
          </span>
        </div>
        <div className="button-group">
          <ButtonGroup
            answerIsCorrect={answerIsCorrect}
            disabled={buttonGroupIsDisabled}
            highlightButton={highlightButton}
            items={[
              ...new Set(intervalsInScale.map((interval) => interval.name)),
            ]}
            defaultBorder={defaultBorder}
            hideSelected={answerIsShown}
            onSelectItem={(item: string) => {
              setDefaultBorder(false);
              handleAnswer(item);
            }}
          ></ButtonGroup>
        </div>
        <p hidden={!answerIsShown} className="smufl">
          {formattedCurrNotes}
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
