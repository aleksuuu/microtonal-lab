import "./index.scss";
import { BorderType } from "../../common/types";
import { useState } from "react";

type CellProps = {
  text: string;
  onClick: () => void;
};

const Cell = (cell: CellProps) => {
  return (
    <button className="grid-cell" onClick={cell.onClick}>
      {cell.text}
    </button>
  );
};

interface PartialAndOctaveShiftRowsProps {
  fundamental: number;
  numberOfCells?: number;
  onClick: (frequency: number) => void;
}
const PartialAndOctaveShiftRows = ({
  fundamental,
  numberOfCells = 16,
  onClick,
}: PartialAndOctaveShiftRowsProps) => {
  const [page, setPage] = useState(0);
  const [octaves, setOctaves] = useState(new Array(numberOfCells - 2).fill(0));

  const getOctaveRow = (isOctaveUp: boolean) => {
    const row = [<Cell text={""} onClick={() => {}}></Cell>];
    for (let i = 1; i < numberOfCells - 1; i++) {
      const handleOnClick = () => {
        const newOctaves = octaves.map((oldV, j) => {
          if (j === i - 1) return isOctaveUp ? oldV + 1 : oldV - 1;
          else return oldV;
        });
        setOctaves(newOctaves);
      };
      const currCell = (
        <Cell text={isOctaveUp ? "↑" : "↓"} onClick={handleOnClick}></Cell>
      );
      row.push(currCell);
    }
    row[numberOfCells - 1] = <Cell text={""} onClick={() => {}}></Cell>;
    return row;
  };

  const getPartialsRow = () => {
    const row = [
      <Cell
        text={"←"}
        onClick={() => {
          setPage(page - 1);
        }}
      ></Cell>,
    ];
    for (let i = 1; i < numberOfCells - 1; i++) {
      const octave = 2 ** octaves[i - 1];
      const currPartial = (i * 2 - 1 + (numberOfCells - 2) * 2 * page) * octave;
      const handleOnClick = () => {
        onClick(fundamental * currPartial);
      };
      const currCell = (
        <Cell text={`${currPartial}`} onClick={handleOnClick}></Cell>
      );
      row.push(currCell);
    }
    row[numberOfCells - 1] = (
      <Cell
        text={"→"}
        onClick={() => {
          setPage(page + 1);
        }}
      ></Cell>
    );
    return row;
  };
  return (
    <>
      <span className="grid-row">{getOctaveRow(true)}</span>
      <span className="grid-row">{getOctaveRow(false)}</span>
      <span className="grid-row">{getPartialsRow()}</span>
    </>
  );
};

interface Props {
  rows?: number;
  columns?: number;
  fundamentals: number[];
  onClick: (frequency: number) => void;
}

const Grid = ({ rows = 8, columns = 16, fundamentals, onClick }: Props) => {
  const [currPage, setCurrPage] = useState(0);
  const getVerticalPageShiftRow = (isPageUp: boolean) => {
    const row: React.ReactElement[] = [];
    const getPageShiftCell = () => {
      const handleOnClick = () => {
        setCurrPage(isPageUp ? currPage + 1 : currPage - 1);
      };
      return <Cell text={isPageUp ? "⇑" : "⇓"} onClick={handleOnClick}></Cell>;
    };
    for (let i = 0; i < columns; i++) {
      row.push(getPageShiftCell());
    }
    return row;
  };

  return (
    <div className="grid-whole">
      <span className="grid-row">{getVerticalPageShiftRow(true)}</span>
      <PartialAndOctaveShiftRows
        fundamental={fundamentals[0]}
        onClick={onClick}
      ></PartialAndOctaveShiftRows>
      <PartialAndOctaveShiftRows
        fundamental={fundamentals[1]}
        onClick={onClick}
      ></PartialAndOctaveShiftRows>
      <span className="grid-row">{getVerticalPageShiftRow(false)}</span>
    </div>
  );
};

export default Grid;
