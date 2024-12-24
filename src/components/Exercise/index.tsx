import QuestionCount from "../QuestionCount";
import ButtonGroup from "../ButtonGroup";
import Stopwatch from "../Stopwatch";
import Button from "../Button";
import "./index.scss";
import { useEffect, useState } from "react";
import { Interval, IntervalWithNotes } from "../../common/types";

interface Props {
  scaleName: string;
  answerIsCorrect: boolean;
  currInterval: IntervalWithNotes | null;
  handleBack: () => void;
  handleEnd: () => void;
  handleAnswer: (answer: string) => void;
  handleReplay: () => void;
  handleNext: () => void;
  totalSeconds: number;
  stopwatchPause: () => void;
  stopwatchUnpause: () => void;
  formattedCurrNotes: string;
  numAnswered: number;
  numQuestions: number;
  infiniteMode: boolean;
  intervalsInScale: Interval[];
}

const Exercise = ({
  scaleName,
  answerIsCorrect,
  currInterval,
  handleBack,
  handleEnd,
  handleAnswer,
  handleReplay,
  handleNext,
  totalSeconds,
  stopwatchPause,
  stopwatchUnpause,
  formattedCurrNotes,
  numAnswered,
  numQuestions,
  infiniteMode,
  intervalsInScale,
}: Props) => {
  const [answerIsShown, setAnswerIsShown] = useState(false);
  const [highlightButton, setHighlightButton] = useState("");
  const [defaultBorder, setDefaultBorder] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setAnswerIsShown(answerIsCorrect);
  }, [answerIsCorrect]);

  const didReachNumQuestions = !infiniteMode && numAnswered >= numQuestions;

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
    setHighlightButton("");
  };

  const pause = () => {
    stopwatchPause();
    setIsPaused(true);
  };
  const unpause = () => {
    stopwatchUnpause();
    setIsPaused(false);
  };

  const end = () => {
    stopwatchPause();
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
        <span hidden={isPaused}>
          <Button onClick={pause}>pause</Button>
        </span>
        <span hidden={!isPaused}>
          <Button onClick={unpause}>unpause</Button>
        </span>
      </div>
      <div className="answer-area center">
        <div className="grid-3 small-text">
          <span>
            <Stopwatch totalSeconds={totalSeconds} />
          </span>
          <span>{scaleName}</span>
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
            answerIsCorrect={answerIsCorrect || answerIsShown}
            highlightButton={highlightButton}
            items={[
              ...new Set(intervalsInScale.map((interval) => interval.name)),
            ]} // this returns a sorted array
            defaultBorder={defaultBorder}
            onSelectItem={(item: string) => {
              setDefaultBorder(false);
              setHighlightButton(item);
              handleAnswer(item);
            }}
          ></ButtonGroup>
        </div>
        <p hidden={!answerIsShown} className="smufl">
          {formattedCurrNotes}
        </p>
        <div className="grid-3 border-bottom option-buttons">
          <span>
            <Button onClick={tellMe}>tell me</Button>
          </span>
          <span>
            <Button onClick={end}>end</Button>
          </span>
          <span>
            <Button
              disabled={!answerIsShown || didReachNumQuestions}
              onClick={next}
            >
              next
            </Button>
          </span>
        </div>
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
