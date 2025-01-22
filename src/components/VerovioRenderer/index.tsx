import { useEffect, useRef, useState } from "react";
import { toolkit } from "verovio";
import { formatNotesAsMeiData } from "../../common/MeiUtilities";
import { FreqMidiNoteCents } from "../../common/types";
import { formatFreqMidiNoteCentsIntoASingleString } from "../../common/UtilityFuncs";
import "./index.scss";

interface Props {
  notes: FreqMidiNoteCents[];
  width?: number;
  height?: number;
}

const VerovioRenderer = ({ notes, width = 150, height = 110 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noteInfo, setNoteInfo] = useState("");

  useEffect(() => {
    if (containerRef.current) {
      const meiData = formatNotesAsMeiData(notes);
      const vrvToolkit = new toolkit();
      vrvToolkit.setOptions({
        pageWidth: width,
        pageHeight: meiData.height * height,
        scale: 50,
        pageMarginLeft: 0,
        pageMarginRight: 0,
        pageMarginBottom: 0,
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
    }
  }, [notes, width, height]);

  const handleHover = (note: FreqMidiNoteCents) => {
    setNoteInfo(
      `${formatFreqMidiNoteCentsIntoASingleString(note)} [${
        note.amp?.toFixed(2) ?? ""
      }]`
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
