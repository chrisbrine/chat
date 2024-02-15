export default function ChangeName({
  currentName,
  labelId,
  label,
  onChange,
}: Readonly<{
  currentName: string,
  labelId: string,
  label: string,
  onChange: (groupName: string) => void;
}>) {
  return (
    <div className="mx-2">
      <label className="block w-full" htmlFor={labelId}>{label}</label>
      <input
        id={labelId}
        className="w-full p-1 border border-black rounded-md"
        type="text"
        value={currentName}
        onInput={(e) => onChange(e.currentTarget.value)}
      />
    </div>
  );
}
