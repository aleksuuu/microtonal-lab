import Button from "../Button";

interface Props {
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleParse: () => void;
  fileHasBeenUploaded: boolean;
  error: string;
}

const ScalaFileUploader = ({
  handleFileUpload,
  handleParse,
  fileHasBeenUploaded,
  error = "",
}: Props) => {
  return (
    <>
      <input type="file" accept=".scl" onChange={handleFileUpload}></input>
      <Button onClick={handleParse} disabled={!fileHasBeenUploaded}>
        Parse
      </Button>
      <p>{error}</p>
    </>
  );
};

export default ScalaFileUploader;
