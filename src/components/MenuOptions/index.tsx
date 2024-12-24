import "./index.scss";

interface Props {
  defaultOption: string;
  children?: string[];
  id: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const MenuOptions = ({ defaultOption, children, id, onChange }: Props) => {
  const options = [];
  if (children) {
    for (const option of children) {
      options.push(
        <option value={option} key={option}>
          {option}
        </option>
      );
    }
  }
  return (
    <select id={id} onChange={onChange} defaultValue={defaultOption}>
      {options}
    </select>
  );
};

export default MenuOptions;
