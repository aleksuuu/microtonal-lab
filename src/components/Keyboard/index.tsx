// import { useState } from "react";

// interface Props {
//   onClick: (keyIdx: number) => void;
// }

const keys: string[][] = [
  [..."1234567890"],
  [..."QWERTYUIOP"],
  [..."ASDFGHJKL;"],
  [..."ZXCVBNM,./"],
];

const Keyboard = (onClick: (keyIdx: number) => void) => {
  // const [input, setInput] = useState("");

  const makeARow = (row: string[], idxOffset: number) => {
    return (
      <div className="micro-keyboard-row">
        {row.map((k, idx) => (
          <button
            key={k}
            onClick={() => onClick(idx + idxOffset)}
            className="micro-key"
          ></button>
        ))}
      </div>
    );
  };

  return (
    <div className="micro-keyboard-grid">
      {keys.map((r, rowNum) => makeARow(r, rowNum * 10))}
    </div>
  );
};

export default Keyboard;
