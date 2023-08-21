import { useState } from "react";

interface Props {
  children: string;
  id: string;
  initValue: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ children, id, initValue, onChange }: Props) => {
  const [checked, setChecked] = useState(initValue);
  return (
    <>
      <label>
        <input
          id={id}
          name={id}
          type="checkbox"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            onChange(e);
            setChecked(!checked);
          }}
          checked={checked}
        />
        {children}
      </label>
    </>
  );
};

export default Checkbox;
