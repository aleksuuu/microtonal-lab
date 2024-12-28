import { FreqMidiNoteCents } from "../../common/types";
import { useState } from "react";
import { getFirstXPartialsAsNotes } from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";

const PartialFinder = () => {
  const [baseFreq, setBaseFreq] = useState(440);
  const [numPartials, setNumPartials] = useState(20);
  const handleNumberInput = (id: string, v: number) => {
    switch (id) {
      case "partial-finder-freq-input":
        setBaseFreq(v);
        break;
      case "partial-finder-num-partials":
        setNumPartials(v);
        break;
    }
  };

  const formatPartial = (
    idx: number,
    partial: FreqMidiNoteCents
  ): React.ReactElement => {
    let addCents = "";
    if (partial.addCents !== 0) {
      addCents = Math.round(partial.addCents) + "¢";
      if (partial.addCents > 0) {
        addCents = "+" + addCents;
      }
    }
    return (
      <tr key={idx}>
        <th scope="row">{idx + 1}</th>
        <td>{partial.freq}</td>
        <td>
          {partial.noteName}
          {partial.octave}
          {addCents}
        </td>
      </tr>
    );
  };
  const getFormattedPartials = (): React.ReactElement => {
    const partials = getFirstXPartialsAsNotes(baseFreq, numPartials);
    return (
      <tbody>
        {partials.map((partial, idx) => formatPartial(idx, partial))}
      </tbody>
    );
  };

  return (
    <div>
      <h2>Partial Finder</h2>
      <NumberInput
        id="partial-finder-freq-input"
        value={baseFreq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Base frequency
      </NumberInput>
      <NumberInput
        id="partial-finder-num-partials"
        value={numPartials}
        isFreqValue={false}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Number of partials to display
      </NumberInput>
      <table>
        <thead>
          <tr>
            <th scope="col">Partial</th>
            <th scope="col">Frequency</th>
            <th scope="col">Note</th>
          </tr>
        </thead>
        {getFormattedPartials()}
      </table>
    </div>
  );
};

export default PartialFinder;
