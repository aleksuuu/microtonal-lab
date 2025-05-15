import { AllowedScales, OptionType, Scale } from "../../common/types";
import MenuOptions from "../MenuOptions";
import scales from "../../common/scales.json";
import { useEffect } from "react";
// TODO: implement this in Interval

interface Props {
  defaultScale?: AllowedScales;
  onScaleChange: (scale: Scale) => void;
}

const ScaleSelector = ({
  defaultScale = AllowedScales.EDO_24,
  onScaleChange,
}: Props) => {
  const handleScaleChange = (scaleName: string) => {
    const scale = scales.scales.find((scale) => scale.name === scaleName);
    if (!scale) console.error("Can't find requested scale.");
    else onScaleChange(scale);
  };

  useEffect(() => {
    handleScaleChange(defaultScale);
  }, []);

  const handleMenuSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleScaleChange(e.target.value);
  };
  return (
    <MenuOptions
      defaultOption={defaultScale}
      id={OptionType.SCALENAME}
      onChange={handleMenuSelectChange}
    >
      {Object.values(AllowedScales)}
    </MenuOptions>
  );
};

export default ScaleSelector;
