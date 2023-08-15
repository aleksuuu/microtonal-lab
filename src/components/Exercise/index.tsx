import AnswerCount from "../AnswerCount";
import ButtonGroup from "../ButtonGroup";
import Stopwatch from "../Stopwatch";
import Button from "../Button";
import "./index.scss";
import { ExerciseMaker } from "../../common/ExerciseMaker";

interface Props {
  maker: ExerciseMaker;
  hidden: boolean;
  onClickBack: () => void;
}

const Exercise = ({ maker, hidden, onClickBack }: Props) => {
  return (
    <div className="center" hidden={hidden}>
      <div className="grid-3 border-bottom option-buttons">
        <span>
          <Button onClick={onClickBack}>back to options</Button>
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
            <Stopwatch />
          </span>
          <span>
            <AnswerCount count={1}></AnswerCount>
          </span>
        </div>
        <div className="button-group">
          <ButtonGroup></ButtonGroup>
        </div>

        <p className="small-text">
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
