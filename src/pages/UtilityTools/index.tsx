import PartialFinder from "../../components/PartialFinder";
import PitchConverter from "../../components/PitchConverter";

const UtilityTools = () => {
  return (
    <>
      <title>Microtonal Lab - Utility Tools</title>
      {PitchConverter()}
      {PartialFinder()}
    </>
  );
};
export default UtilityTools;
