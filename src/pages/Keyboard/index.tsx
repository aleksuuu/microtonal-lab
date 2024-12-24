import { useEffect } from "react";
import { WebMidi } from "webmidi";
import MenuOptions from "../../components/MenuOptions";

const Keyboard = () => {
  useEffect(() => {
    WebMidi.enable()
      .then(onWebMidiEnabled)
      .catch((err) => console.error("WebMidi could not be enabled.", err));
  }, []);
  const onWebMidiEnabled = () => {
    // Inputs
    WebMidi.inputs.forEach((input) =>
      console.log(input.manufacturer, input.name)
    );

    // Outputs
    WebMidi.outputs.forEach((output) =>
      console.log(output.manufacturer, output.name)
    );
  };
  return <>hello, {WebMidi.outputs}</>;
};
export default Keyboard;
