import Button from "../Button";
import { BorderType } from "../Button";
import "./index.scss";

interface Props {
  answerIsCorrect: boolean;
  highlightButton?: string;
  items: string[];
  defaultBorder?: boolean;
  onSelectItem: (item: string) => void;
}

const ButtonGroup = ({
  answerIsCorrect,
  highlightButton,
  items,
  defaultBorder,
  onSelectItem,
}: Props) => {
  const getBorderType = (item: string): BorderType => {
    if (defaultBorder) {
      return BorderType.Normal;
    }
    if (item === highlightButton) {
      if (answerIsCorrect) {
        return BorderType.Success;
      } else {
        return BorderType.Failure;
      }
    }
    // if (!hideSelected && selectedIndex === index) {
    //   if (answerIsCorrect) {
    //     return BorderType.Success;
    //   } else {
    //     return BorderType.Failure;
    //   }
    // }
    return BorderType.Normal;
  };

  return (
    <div>
      <ul className="flex-row justify-center button-group">
        {items.map((item) => (
          <li key={item}>
            <Button
              border={getBorderType(item)}
              disabled={answerIsCorrect}
              isAnswerButton={true}
              onClick={() => {
                onSelectItem(item);
              }}
            >
              {item}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ButtonGroup;
