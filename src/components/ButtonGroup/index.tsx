import { useState } from "react";
import Button from "../Button";
import { BorderType } from "../Button";

// interface Props {
//   items: string[];
//   onSelectItem: (item: string) => void;
// }

const ButtonGroup = () => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [counter, setCounter] = useState(0);
  const items = [
    "vm2",
    "m2",
    "~2",
    "M2",
    "vm3",
    "m3",
    "~3",
    "M3",
    "v4",
    "P4",
    "^4",
    "A4/d5",
    "v5",
    "P5",
    "vm6",
    "m6",
    "~6",
    "M6",
    "vm7",
    "m7",
    "~7",
    "M7",
    "v8",
    "P8",
  ];
  const onSelectItem = (item: string) => {
    console.log(item);
  };

  const getBorderType = (index: number): BorderType => {
    if (selectedIndex === index) {
      if (counter % 2 === 0) {
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
              border={getBorderType(index)}
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
