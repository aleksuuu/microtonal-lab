import "./index.scss";

interface Props {
  defaultOption?: string;
  children?: (string | { value: string; id: string })[];
  id: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MenuOptions = ({ defaultOption, children, id, onChange }: Props) => {
  const options = [];
  if (children) {
    for (const option of children) {
      let optionValue = "";
      let optionId = "";
      if (typeof option === "string") {
        optionValue = option;
        optionId = option;
      } else {
        optionValue = option.value;
        optionId = option.id;
      }
      options.push(
        <option value={optionValue} key={optionId} id={optionId}>
          {optionValue}
        </option>
      );
    }
  }
  return (
    <select id={id} onChange={onChange} defaultValue={defaultOption ?? ""}>
      {options}
    </select>
  );
};

export default MenuOptions;
