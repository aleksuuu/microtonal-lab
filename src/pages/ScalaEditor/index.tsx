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
import { ScalaNote, ScalaNoteTypes } from "../../common/types";

const ScalaEditor = () => {
  type EditorNote = {
    textInput: string;
    note: ScalaNote | null;
    noteInputType: ScalaNoteTypes;
  };
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [numOfNotes, setNumOfNotes] = useState(0);
  const [notes, setNotes] = useState([] as EditorNote[]);

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
      setNotes(
        scale.notes.map((note) => ({
          textInput: note.text,
          note: note,
          noteInputType: getNoteInputTypeWhenValid(note.text),
        }))
      );
      setErr("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Unknown error occurred");
    }
  };

  const getNoteInputTypeWhenValid = (input: string): ScalaNoteTypes => {
    // Assuming input is always valid
    if (input.includes(".")) return ScalaNoteTypes.CENTS;
    return ScalaNoteTypes.RATIO;
  };

  const getScalaNoteIdx = (id: string): number | null => {
    const match = id.match(/^scala-note-(\d+)$/); // Matches "scala-note-" followed by digits
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  const handleTextInputOnBlur = (id: string, v: string) => {
    const noteIdx = getScalaNoteIdx(id);
    if (noteIdx !== null) {
      const newNotes = notes.map((oldNote, i) => {
        if (i === noteIdx) {
          const parsedNote = parseScalaNoteInput(v);
          let noteInputType = ScalaNoteTypes.INVALID;
          if (v === "") {
            noteInputType = ScalaNoteTypes.EMPTY;
          } else if (parsedNote !== null) {
            noteInputType = parsedNote.scalaNoteType;
          }
          return {
            textInput: v,
            note: parsedNote,
            noteInputType: noteInputType,
          };
        } else {
          return oldNote;
        }
      });
      newNotes.sort(notesSort);
      setNotes(newNotes);
    }
  };

  const notesSort = (a: EditorNote, b: EditorNote): number => {
    if (a.note === null) {
      return 1; // ensure empty fields would always be placed at the bottom
    }
    if (b.note === null) {
      return 1; // ensure empty fields would always be placed at the bottom
    }
    return a.note.cents - b.note.cents;
  };

  const handleTextInputOnChange = (id: string, v: string) => {
    const noteIdx = getScalaNoteIdx(id);
    if (noteIdx !== null) {
      const newNotes = notes.map((oldNote, i) => {
        if (i === noteIdx) {
          return {
            textInput: v,
            note: null,
            noteInputType: ScalaNoteTypes.EMPTY,
          };
        } else {
          return oldNote;
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
        tmpNotes[i] = {
          textInput: "",
          note: null,
          noteInputType: ScalaNoteTypes.EMPTY,
        };
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
        text={notes[idx].textInput}
        onChange={handleTextInputOnChange}
        onBlur={handleTextInputOnBlur}
      >
        {`Note ${idx + 1} ${notes[idx].noteInputType}`}
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
      if (note.note !== null) {
        parsedNotes.push(note.note);
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
    </>
  );
};
export default ScalaEditor;
