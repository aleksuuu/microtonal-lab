import { NoteWithAmp } from "../../common/types";
import { useEffect, useState } from "react";
import {
  formatFreqMidiNoteCentsIntoASingleString,
  predictFM,
} from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";

const FMCalculator = () => {
  const [carrierFreq, setCarrierFreq] = useState(220);
  const [modulatorFreq, setModulatorFreq] = useState(440);
  const [modulationIdx, setModulationIdx] = useState(5);
  const [minFreq, setMinFreq] = useState(20);
  const [maxFreq, setMaxFreq] = useState(2000);
  const [minAmp, setMinAmp] = useState(0.1);
  const [predictionResults, setPredictionResults] = useState<NoteWithAmp[]>([]);

  useEffect(() => {
    resetPredictionResults();
  }, []);

  const resetPredictionResults = () => {
    setPredictionResults(
      predictFM({
        carrierFreq,
        modulatorFreq,
        modulationIdx,
        minFreq,
        maxFreq,
        minAmp,
      })
    );
  };

  const handleNumberInputOnChange = (id: string, v: number) => {
    switch (id) {
      case "fm-calculator-carrier":
        setCarrierFreq(v);
        break;
      case "fm-calculator-modulator":
        setModulatorFreq(v);
        break;
      case "fm-calculator-idx":
        setModulationIdx(v);
        break;
      case "fm-calculator-min-freq":
        setMinFreq(v);
        break;
      case "fm-calculator-max-freq":
        setMaxFreq(v);
        break;
      case "fm-calculator-min-amp":
        setMinAmp(v);
        break;
    }
  };

  const handleNumberInputOnBlur = (_id: string, _v: number) => {
    resetPredictionResults();
  };

  const formatNoteAmp = (noteWithAmp: NoteWithAmp): React.ReactElement => {
    return (
      <tr key={noteWithAmp.note.freq}>
        <td>{formatFreqMidiNoteCentsIntoASingleString(noteWithAmp.note)}</td>
        <td>{noteWithAmp.amp.toFixed(2)}</td>
      </tr>
    );
  };

  return (
    <div>
      <h2>FM Calculator</h2>
      <NumberInput
        id="fm-calculator-carrier"
        value={carrierFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Carrier frequency
      </NumberInput>
      <NumberInput
        id="fm-calculator-modulator"
        value={modulatorFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Modulator frequency
      </NumberInput>
      <NumberInput
        id="fm-calculator-idx"
        value={modulationIdx}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Modulation index
      </NumberInput>
      <NumberInput
        id="fm-calculator-min-freq"
        value={minFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Minimum output frequency
      </NumberInput>
      <NumberInput
        id="fm-calculator-max-freq"
        value={maxFreq}
        isFreqValue={true}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Maximum output frequency
      </NumberInput>
      <NumberInput
        id="fm-calculator-min-amp"
        value={minAmp}
        onChange={handleNumberInputOnChange}
        onBlur={handleNumberInputOnBlur}
        className="medium-input"
      >
        Minimum amplitude
      </NumberInput>
      {predictionResults.length > 0 && (
        <table>
          <thead>
            <tr>
              <th scope="col">Frequencies</th>
              <th scope="col">Amplitudes</th>
            </tr>
          </thead>
          <tbody>{predictionResults.map((p) => formatNoteAmp(p))}</tbody>
        </table>
      )}
    </div>
  );
};

export default FMCalculator;
