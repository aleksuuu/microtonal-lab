import { FreqMidiNoteCents, PitchType } from "../../common/types";
import { useEffect, useState } from "react";
import {
  formatFreqMidiNoteCentsIntoASingleString,
  predictFM,
} from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import VerovioRenderer from "../VerovioRenderer";
import ContextMenu from "../ContextMenu";

const FMCalculator = () => {
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(
    null
  );
  const [noteFreqForMenu, setNoteFreqForMenu] = useState(0);
  const handleContextMenu = (
    event: React.MouseEvent,
    currentNoteFreq: number
  ) => {
    event.preventDefault();
    setMousePos({ x: event.clientX, y: event.clientY });
    setNoteFreqForMenu(currentNoteFreq);
  };
  const handleMenuClose = () => {
    setMousePos(null);
  };

  const [carrierFreq, setCarrierFreq] = useState(220);
  const [modulatorFreq, setModulatorFreq] = useState(440);
  const [modulationIdx, setModulationIdx] = useState(5);
  const [minFreq, setMinFreq] = useState(55);
  const [maxFreq, setMaxFreq] = useState(2000);
  const [minAmp, setMinAmp] = useState(0.1);
  const [predictionResults, setPredictionResults] = useState<
    FreqMidiNoteCents[]
  >([]);

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

  const formatNoteAmp = (note: FreqMidiNoteCents): React.ReactElement => {
    return (
      <tr key={note.freq}>
        <td
          onContextMenu={(event: React.MouseEvent) => {
            handleContextMenu(event, note.freq);
          }}
        >
          {formatFreqMidiNoteCentsIntoASingleString(note)}
        </td>
        <td>{note.amp && note.amp.toFixed(2)}</td>
      </tr>
    );
  };

  return (
    <div>
      <h2>FM Calculator</h2>
      <div className="default-flexbox">
        <div className="utility-tools-input-form">
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
        </div>
        {predictionResults.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th scope="col">Frequencies</th>
                  <th scope="col">Amplitudes</th>
                </tr>
              </thead>
              <tbody>{predictionResults.map((p) => formatNoteAmp(p))}</tbody>
            </table>
            {mousePos !== null && (
              <ContextMenu
                mousePos={mousePos}
                value={noteFreqForMenu}
                valueType={PitchType.FREQUENCY}
                onClose={handleMenuClose}
              />
            )}
            <VerovioRenderer notes={predictionResults}></VerovioRenderer>
          </>
        )}
      </div>
    </div>
  );
};

export default FMCalculator;
