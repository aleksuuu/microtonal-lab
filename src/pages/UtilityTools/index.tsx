import FMCalculator from "../../components/FMCalculator";
import FundamentalFinder from "../../components/FundamentalFinder";
import PartialFinder from "../../components/PartialFinder";
import PitchConverter from "../../components/PitchConverter";
import "./index.scss";

const UtilityTools = () => {
  return (
    <>
      <title>Microtonal Lab - Utility Tools</title>
      <PitchConverter />
      <PartialFinder />
      <FundamentalFinder />
      <FMCalculator />
    </>
  );
};
export default UtilityTools;
