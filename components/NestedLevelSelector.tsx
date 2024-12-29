import { useState } from "react";

interface NestedLevelSelectorProps {
  onLevelChange: (level: number) => void;
}

export function NestedLevelSelector({
  onLevelChange,
}: NestedLevelSelectorProps) {
  const [level, setLevel] = useState(2);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLevel = parseInt(e.target.value);
    setLevel(newLevel);
    onLevelChange(newLevel);
  };

  return (
    <div className="flex items-center space-x-2">
      <label
        htmlFor="nested-level"
        className="text-sm font-medium text-foreground"
      >
        Nested Level:
      </label>
      <select
        id="nested-level"
        value={level}
        onChange={handleChange}
        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md bg-background text-foreground"
      >
        <option value={1}>1</option>
        <option value={2}>2</option>
        <option value={3}>3</option>
      </select>
    </div>
  );
}
