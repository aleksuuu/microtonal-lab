import { useState } from "react";
import {
  exportSclFile,
  parseScalaFileContent,
  parseScalaNoteInput,
} from "../../common/UtilityFuncs";
import ScalaFileUploader from "../../components/ScalaFileUploader";
import TextInput from "../../components/TextInput";
import NumberInput from "../../components/NumberInput";
import Button from "../../components/Button";

const ScalaEditor = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numOfNotes, setNumOfNotes] = useState(0);
  const [notes, setNotes] = useState([] as string[]);

  const [fileName, setFileName] = useState("");
  const [fileContent, setFileContent] = useState("");
  const [err, setErr] = useState("");

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setFileName(file.name);
          setFileContent(reader.result.toString());
        }
      };
      reader.readAsText(file);
    }
  };

  const handleParse = () => {
    try {
      const scale = parseScalaFileContent(fileName, fileContent);
      setName(scale.name);
      setDescription(scale.description);
      setNumOfNotes(scale.notes.length);
      setNotes(scale.notes.map((note) => note.text));
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error occurred");
    }
  };

  const getScalaNoteIdx = (id: string): number | null => {
    const match = id.match(/^scala-note-(\d+)$/); // Matches "scala-note-" followed by digits
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const handleTextInputOnBlur = (id: string, _v: string) => {
    const noteIdx = getScalaNoteIdx(id);
    if (noteIdx !== null) {
      const nextNotes = [...notes];
      nextNotes.sort(notesSort);
      setNotes(nextNotes);
    }
  };

  const notesSort = (a: string, b: string): number => {
    const note1 = parseScalaNoteInput(a);
    console.log("note1:" + JSON.stringify(note1));
    if (note1 === null) {
      return 1; // ensure empty fields would always be placed at the bottom
    }
    const note2 = parseScalaNoteInput(b);
    console.log("note2:" + JSON.stringify(note2));
    if (note2 === null) {
      return 1; // ensure empty fields would always be placed at the bottom
    }
    return note1.cents - note2.cents;
  };

  const handleTextInputOnChange = (id: string, v: string) => {
    const noteIdx = getScalaNoteIdx(id);
    if (noteIdx !== null) {
      const newNotes = notes.map((prevV, i) => {
        if (i === noteIdx) {
          return v;
        } else {
          return prevV;
        }
      });
      setNotes(newNotes);
      return;
    }

    switch (id) {
      case "scala-name":
        setName(v);
        break;
      case "scala-description":
        setDescription(v);
        break;
    }
  };
  const handleNumberInputOnChange = (_id: string, v: number) => {
    const tmpNotes = [];
    for (let i = 0; i < v; i++) {
      if (i < notes.length) {
        tmpNotes[i] = notes[i];
      } else {
        tmpNotes[i] = "";
      }
    }
    setNotes(tmpNotes);
    setNumOfNotes(v);
  };

  const makeANoteRow = (idx: number) => {
    return (
      <TextInput
        key={idx}
        id={`scala-note-${idx}`}
        text={notes[idx]}
        onChange={handleTextInputOnChange}
        onBlur={handleTextInputOnBlur}
      >
        {`Note ${idx + 1}`}
      </TextInput>
    );
  };

  const makeNoteRows = () => {
    const rows = [];
    for (let i = 0; i < numOfNotes; i++) {
      rows.push(makeANoteRow(i));
    }
    return rows;
  };

  const handleSave = () => {
    const parsedNotes = [];
    for (const note of notes) {
      const parsedNote = parseScalaNoteInput(note);
      if (parsedNote !== null) {
        parsedNotes.push(parsedNote);
      }
    }
    exportSclFile({
      name: name,
      description: description,
      notes: parsedNotes,
    });
  };

  return (
    <>
      <title>Microtonal Lab - Scala Editor</title>
      <ScalaFileUploader
        handleFileUpload={handleFileUpload}
        handleParse={handleParse}
        fileHasBeenUploaded={fileContent !== ""}
        error={err}
      />
      <TextInput id="scala-name" text={name} onChange={handleTextInputOnChange}>
        Name
      </TextInput>
      <TextInput
        id="scala-description"
        text={description}
        onChange={handleTextInputOnChange}
      >
        Description
      </TextInput>
      <NumberInput
        id="scala-num-notes"
        value={numOfNotes}
        onChange={handleNumberInputOnChange}
      >
        Number of Notes
      </NumberInput>
      {makeNoteRows()}
      <p>
        To enter a value in cents, you must include a "." in your input. For
        instance, "200." would be read as 200 cents, whereas "200" would be read
        as 200/1, a ratio.
      </p>
      <Button onClick={handleSave}>Save</Button>

      {/* {parsedScale && (
        <div>
          <h2>Parsed Scale</h2>
          <p>
            <strong>Name:</strong> {parsedScale.name}
          </p>
          <p>
            <strong>Description:</strong> {parsedScale.description}
          </p>
          <h3>Notes:</h3>
          <ul>
            {parsedScale.notes.map((note, index) => (
              <li key={index}>{note.toFixed(2)} cents</li>
            ))}
          </ul>
        </div>
      )} */}
    </>
  );
};
export default ScalaEditor;
