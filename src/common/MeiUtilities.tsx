import { FreqMidiNoteCents } from "./types";

const formatNote = (note: FreqMidiNoteCents) => {
  if (
    note === undefined ||
    note === null ||
    isNaN(note.freq) ||
    note.freq <= 0 ||
    note.noteName === undefined ||
    note.noteName === null
  )
    return null;
  let accidental = "";
  let microtonalInflection = "";
  if (note.addCents > 10) microtonalInflection = "u";
  else if (note.addCents < -10) microtonalInflection = "d";

  if (note.noteName.includes("♯"))
    accidental = `<accid accid="s${microtonalInflection}" />`;
  else if (note.noteName.includes("♭"))
    accidental = `<accid accid="f${microtonalInflection}" />`;
  else if (microtonalInflection !== "")
    accidental = `<accid accid="n${microtonalInflection}" />`;

  const noteName = note.noteName[0].toLowerCase();
  let color = "";
  if (note.amp !== undefined) {
    const amp = note.amp > 1 ? 1 : note.amp;
    const red = Math.round(amp * 255);
    const green = Math.round((1 - amp) * 255);
    color = `color="rgba(${red}, ${green}, 0, 1)"`;
  }

  return `<note pname="${noteName}" oct="${note.octave}" xml:id="${
    note.id ?? `midi-${note.midiNote}`
  }" ${color}>${accidental}</note>`;
};

const formatChordInStaff = (
  notes: FreqMidiNoteCents[],
  dur: number = 1,
  staff: number = 1
) => {
  let xmlNotesStr = "";
  for (const n of notes) {
    const formatted = formatNote(n);
    if (formatted === null) return "";
    xmlNotesStr = xmlNotesStr.concat(formatted);
  }
  return `<staff n="${staff}"><layer n="1"><chord dur="${dur}">${xmlNotesStr}</chord></layer></staff>`;
};

const measureToPage = (staffDefs: string, measureXml: string) => {
  return `<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <music>
    <body>
        <mdiv>
            <score>
                <scoreDef>
                    <staffGrp>
                        ${staffDefs}
                     </staffGrp>
            </scoreDef>
            <section>
            <measure>
                ${measureXml}
                </measure>
            </section>
            </score>
          </mdiv>
        </body>
      </music>
      </mei>`;
};

export const formatNotesAsMeiData = (
  notes: FreqMidiNoteCents[]
): { meiData: string; height: number } => {
  const gClef8va = 93; // A6
  const gClef = 60; // C4
  const fClef = 29; // F1
  enum ClefMeis {
    GClef8vaMei = `<clef shape="G" line="2" glyph.name="gClef8va" dis="8" dis.place="above" />`,
    GClefMei = `<clef shape="G" line="2" />`,
    FClefMei = `<clef shape="F" line="4" />`,
    FClef8vbMei = `<clef shape="F" line="4" glyph.name="fClef8vb" dis="8" dis.place="below"/>`,
  }
  const clefMeisMap = new Map([
    [ClefMeis.GClef8vaMei, 0],
    [ClefMeis.GClefMei, 1],
    [ClefMeis.FClefMei, 2],
    [ClefMeis.FClef8vbMei, 3],
  ]);
  const clefs = new Set<ClefMeis>();
  const clefNotesMap = new Map<ClefMeis, FreqMidiNoteCents[]>();
  for (const n of notes) {
    let c: ClefMeis;
    if (n.midiNote >= gClef8va) c = ClefMeis.GClef8vaMei;
    else if (n.midiNote >= gClef) c = ClefMeis.GClefMei;
    else if (n.midiNote >= fClef) c = ClefMeis.FClefMei;
    else c = ClefMeis.FClef8vbMei;
    clefs.add(c);
    const potentialNotes = clefNotesMap.get(c);
    if (potentialNotes) potentialNotes.push(n);
    else clefNotesMap.set(c, [n]);
  }

  const clefsArr = Array.from(clefs);
  clefsArr.sort(
    (a, b) => (clefMeisMap.get(a) ?? 0) - (clefMeisMap.get(b) ?? 0)
  );
  let staffDefs = "";
  const staffsMap = new Map<ClefMeis, number>();
  for (const [i, c] of clefsArr.entries()) {
    staffsMap.set(c, i + 1);
    staffDefs = staffDefs.concat(
      `<staffDef n="${i + 1}" lines="5">${c}</staffDef>`
    );
  }
  if (staffDefs === "") {
    console.error("Undefined staffDefs.");
    return { meiData: "", height: 0 };
  }
  let noteMeis = "";
  for (const [clef, notes] of clefNotesMap) {
    const staffNum = staffsMap.get(clef);
    if (staffNum === undefined) {
      console.error("Undefined clef num.");
      continue;
    }
    noteMeis = noteMeis.concat(formatChordInStaff(notes, 1, staffNum));
  }

  return {
    meiData: measureToPage(staffDefs, noteMeis),
    height: staffsMap.size,
  };
};
