import "./index.scss";

interface Props {
  children: string;
  id: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ children, id, checked, onChange }: Props) => {
  return (
    <>
      <label>
        <input
          id={id}
          className="checkbox-input"
          name={id}
          type="checkbox"
          onChange={onChange}
          checked={checked}
        />
        {children}
      </label>
    </>
  );
};

export default Checkbox;
