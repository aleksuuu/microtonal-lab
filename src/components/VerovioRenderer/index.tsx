import { useEffect, useRef, useState } from "react";
import { formatNotesAsMeiData } from "../../common/MeiUtilities";
import { FreqMidiNoteCents } from "../../common/types";
import { formatFreqMidiNoteCentsIntoASingleString } from "../../common/UtilityFuncs";
import "./index.scss";
import createVerovioModule from "verovio/wasm";
import { VerovioToolkit } from "verovio/esm";

interface Props {
  notes: FreqMidiNoteCents[];
  width?: number;
  height?: number;
}

const VerovioRenderer = ({ notes, width = 150, height = 110 }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [noteInfo, setNoteInfo] = useState("");
  const vrvToolkitRef = useRef<VerovioToolkit | null>(null);
  const eventListenersRef = useRef<
    { element: Element; type: string; listener: EventListener }[]
  >([]);

  useEffect(() => {
    const initializeVrv = async () => {
      try {
        const VrvMod = await createVerovioModule();
        vrvToolkitRef.current = new VerovioToolkit(VrvMod);
        // Set options for the toolkit
        const meiData = formatNotesAsMeiData(notes);
        vrvToolkitRef.current.setOptions({
          pageWidth: width,
          pageHeight: meiData.height * height,
          scale: 50,
          pageMarginLeft: 0,
          pageMarginRight: 0,
          pageMarginBottom: 0,
          pageMarginTop: 0,
          scaleToPageSize: true,
        });

        // Load the MEI data
        vrvToolkitRef.current.loadData(meiData.meiData);
        vrvToolkitRef.current.select({ measureRange: "1" });
        vrvToolkitRef.current.redoLayout();

        // Render the SVG
        const svgStr = vrvToolkitRef.current.renderToSVG(1);
        const parser = new DOMParser();
        const svgElement = parser
          .parseFromString(svgStr, "image/svg+xml")
          .querySelector("svg");

        if (!svgElement || !containerRef.current) return;

        // Add hover effects for notes
        for (const note of notes) {
          if (note.id === undefined) continue;
          const pathElement = svgElement.querySelector(`#${note.id}`);
          if (!pathElement) continue;
          const parentElement = pathElement.parentNode;
          if (!parentElement) continue;

          const hitArea = pathElement.cloneNode(true) as SVGPathElement;
          hitArea.setAttribute("id", `hit-${note.id}`);
          hitArea.setAttribute("stroke", "transparent");
          hitArea.setAttribute("stroke-width", "200");
          hitArea.setAttribute("fill", "none");

          const handleMouseOver = () => handleHover(note);
          hitArea.addEventListener("mouseover", handleMouseOver);

          // Store the event listener for cleanup
          eventListenersRef.current.push({
            element: hitArea,
            type: "mouseover",
            listener: handleMouseOver,
          });

          parentElement.insertBefore(hitArea, pathElement);
        }

        // Append the SVG to the container
        containerRef.current.innerHTML = "";
        containerRef.current.appendChild(svgElement);
      } catch (error) {
        console.error("Error initializing Verovio:", error);
      }
    };
    initializeVrv();

    // Cleanup function to remove event listeners
    return () => {
      eventListenersRef.current.forEach(({ element, type, listener }) => {
        element.removeEventListener(type, listener);
      });
      eventListenersRef.current = []; // Clear the stored listeners
    };
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
      <p style={{ minWidth: "280px" }}>{noteInfo}</p>
    </div>
  );
};

export default VerovioRenderer;
