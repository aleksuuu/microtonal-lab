import { useEffect, useRef, useState } from "react";
import { toolkit, VerovioModule } from "verovio";
import { formatNotesAsMeiData } from "../../common/MeiUtilities";
import { FreqMidiNoteCents } from "../../common/types";
import { formatFreqMidiNoteCentsIntoASingleString } from "../../common/UtilityFuncs";
import "./index.scss";
import createVerovioModule from "verovio/wasm";
import { VerovioToolkit } from "verovio/esm";
import { loadWasmModule } from "../../common/WasmLoader";

interface Props {
  notes: FreqMidiNoteCents[];
  width?: number;
  height?: number;
}

const VerovioRenderer = ({ notes, width = 150, height = 110 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noteInfo, setNoteInfo] = useState("");
  const [vrvToolkit, setVrvToolkit] = useState<undefined | toolkit>(undefined);

  useEffect(() => {
    // const initWasm = async () => {
    //   // const wasmExports: any = await loadWasmModule("verovio/wasm");
    //   // console.log("hi");
    //   // wasmExports().then((VerovioModule: VerovioModule | undefined) => {
    //   //   setVrvToolkit(new VerovioToolkit(VerovioModule));
    //   // });
    //   const verovioModule = await createVerovioModule();
    //   setVrvToolkit(new VerovioToolkit(verovioModule));
    // };
    // initWasm();
    createVerovioModule().then((VerovioModule) => {
      console.log("Hello");
      setVrvToolkit(new VerovioToolkit(VerovioModule));
    });
  }, []);

  useEffect(() => {
    if (vrvToolkit !== undefined && containerRef.current) {
      const meiData = formatNotesAsMeiData(notes);
      vrvToolkit.setOptions({
        pageWidth: width,
        pageHeight: meiData.height * height,
        scale: 50,
        pageMarginLeft: 0,
        pageMarginRight: 0,
        pageMarginBottom: 0,
        pageMarginTop: 0,
        scaleToPageSize: true,
      });
      vrvToolkit.loadData(meiData.meiData);
      vrvToolkit.select({ measureRange: "1" });
      vrvToolkit.redoLayout();
      const svgStr = vrvToolkit.renderToSVG(1);
      const parser = new DOMParser();
      const svgElement = parser
        .parseFromString(svgStr, "image/svg+xml")
        .querySelector("svg");
      if (svgElement === null) return;

      for (const note of notes) {
        if (note.id === undefined) continue;
        const pathElement = svgElement.querySelector(`#${note.id}`);
        if (pathElement === null) continue;
        const parentElement = pathElement.parentNode;
        if (parentElement === null) continue;

        const hitArea = pathElement.cloneNode(true) as SVGPathElement;
        hitArea.setAttribute("id", `hit-${note.id}`);
        hitArea.setAttribute("stroke", "transparent");
        hitArea.setAttribute("stroke-width", "200");
        hitArea.setAttribute("fill", "none");
        hitArea.addEventListener("mouseover", () => {
          handleHover(note);
        });
        parentElement.insertBefore(hitArea, pathElement);
      }
      containerRef.current.innerHTML = "";
      containerRef.current.appendChild(svgElement);
    } else {
      console.log("Nope");
    }
  }, [notes, width, height]);

  const handleHover = (note: FreqMidiNoteCents) => {
    setNoteInfo(
      `${formatFreqMidiNoteCentsIntoASingleString(note)} ${
        note.amp ? `[${note.amp.toFixed(2)}]` : ""
      }`
    );
  };
  return (
    <div className="verovio-renderer">
      <div
        ref={containerRef}
        onMouseLeave={() => {
          setNoteInfo("");
        }}
      ></div>
      <p style={{ whiteSpace: "pre" }}>
        {noteInfo === ""
          ? "                                                        "
          : noteInfo}
      </p>
    </div>
  );
};

export default VerovioRenderer;
