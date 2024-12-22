import { useState } from "react";
import Button from "../Button";
import { BorderType } from "../Button";

interface Props {
  answerIsCorrect: boolean;
  disabled?: boolean;
  highlightButton?: string;
  items: string[];
  defaultBorder?: boolean;
  hideSelected?: boolean;
  onSelectItem: (item: string) => void;
}

const ButtonGroup = ({
  answerIsCorrect,
  disabled,
  highlightButton,
  items,
  defaultBorder,
  hideSelected,
  onSelectItem,
}: Props) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [counter, setCounter] = useState(0);

  const getBorderType = (item: string, index: number): BorderType => {
    if (defaultBorder) {
      return BorderType.Normal;
    }
    if (item === highlightButton) {
      return BorderType.Success;
    }
    if (!hideSelected && selectedIndex === index) {
      if (answerIsCorrect) {
        return BorderType.Success;
      } else {
        return BorderType.Failure;
      }
    }
    return BorderType.Normal;
  };

  return (
    <div>
      <ul className="flex-row justify-center">
        {items.map((item, index) => (
          <li key={item}>
            <Button
              border={getBorderType(item, index)}
              disabled={disabled}
              isAnswerButton={true}
              onClick={() => {
                setCounter(counter + 1);
                setSelectedIndex(index);
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
