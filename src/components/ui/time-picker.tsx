import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown } from "lucide-react";

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  step?: number;
  minHour?: number;
  maxHour?: number;
  className?: string;
}

export function TimePicker({
  value = '09:00',
  onChange,
  step = 15,
  minHour = 0,
  maxHour = 23,
  className = ''
}: TimePickerProps) {
  // Parse the initial hours and minutes
  const [hours, minutes] = value.split(':').map(Number);
  
  const handleHourChange = (delta: number) => {
    let newHour = hours + delta;
    
    if (newHour > maxHour) newHour = minHour;
    if (newHour < minHour) newHour = maxHour;
    
    const newTimeString = `${newHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    onChange(newTimeString);
  };
  
  const handleMinuteChange = (delta: number) => {
    let newMinute = minutes + delta * step;
    let newHour = hours;
    
    if (newMinute >= 60) {
      newMinute = newMinute % 60;
      newHour = (newHour + 1) > maxHour ? minHour : newHour + 1;
    }
    
    if (newMinute < 0) {
      newMinute = 60 + newMinute;
      newHour = (newHour - 1) < minHour ? maxHour : newHour - 1;
    }
    
    const newTimeString = `${newHour.toString().padStart(2, '0')}:${newMinute.toString().padStart(2, '0')}`;
    onChange(newTimeString);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Validate the time format using regex
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
    if (timeRegex.test(inputValue)) {
      onChange(inputValue);
    }
  };
  
  return (
    <div className={`flex items-center ${className}`}>
      <div className="flex flex-col mr-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 p-0"
          onClick={() => handleHourChange(1)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 p-0"
          onClick={() => handleHourChange(-1)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>

      <Input
        type="text"
        value={value}
        onChange={handleInputChange}
        className="w-20 text-center"
      />
      
      <div className="flex flex-col ml-2">
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 p-0"
          onClick={() => handleMinuteChange(1)}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        <Button 
          variant="outline" 
          size="icon" 
          className="h-8 w-8 p-0"
          onClick={() => handleMinuteChange(-1)}
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
