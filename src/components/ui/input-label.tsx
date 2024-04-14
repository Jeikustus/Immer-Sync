import React from "react";
import { cn } from "@/lib/utils";
import { Label } from "./label";
import { Input } from "./input";

export interface InputWithLabelProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

const InputWithLabel = React.forwardRef<HTMLInputElement, InputWithLabelProps>(
  ({ className, type, label, ...props }, ref) => {
    return (
      <div className="grid w-full max-w-lg items-center gap-1.5">
        <Label htmlFor={props.id} className="pl-1 text-white">
          {label}
        </Label>
        <Input type={type} className={cn(className)} ref={ref} {...props} />
      </div>
    );
  }
);
InputWithLabel.displayName = "InputWithLabel";

export { InputWithLabel };
