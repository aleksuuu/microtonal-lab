interface Props {
  children: string;
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const Checkbox = ({ children, id, onChange }: Props) => {
  return (
    <>
      <label>
        <input id={id} type="checkbox" onChange={onChange} />
        {children}
      </label>
    </>
  );
};

export default Checkbox;
