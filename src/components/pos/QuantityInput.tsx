import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}
export function QuantityInput({
  value,
  onChange,
  max
}: QuantityInputProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toString());
  const handleIncrement = () => {
    const newValue = value + 1;
    if (!max || newValue <= max) {
      onChange(newValue);
    }
  };
  const handleDecrement = () => {
    const newValue = Math.max(0, value - 1);
    onChange(newValue);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };
  const handleInputBlur = () => {
    const num = parseInt(inputValue) || 0;
    const finalValue = max ? Math.min(num, max) : num;
    onChange(Math.max(0, finalValue));
    setInputValue(finalValue.toString());
    setIsEditing(false);
  };
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    }
  };
  if (isEditing) {
    return <Input type="number" value={inputValue} onChange={handleInputChange} onBlur={handleInputBlur} onKeyDown={handleInputKeyDown} className="w-20 h-9 text-center" autoFocus />;
  }
  return <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handleDecrement} disabled={value === 0} className="h-6 w-6">
        <Minus className="h-4 w-4" />
      </Button>
      <button onClick={() => setIsEditing(true)} className="w-14 h-9 text-center font-normal hover:bg-muted rounded-md transition-colors text-sm">
        {value}
      </button>
      <Button variant="outline" size="icon" onClick={handleIncrement} disabled={max !== undefined && value >= max} className="h-6 w-6">
        <Plus className="h-4 w-4" />
      </Button>
    </div>;
}