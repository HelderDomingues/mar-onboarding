
import * as React from "react";
import { cn } from "@/lib/utils";

interface PrefixInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  prefix: string;
}

const PrefixInput = React.forwardRef<HTMLInputElement, PrefixInputProps>(
  ({ className, prefix, ...props }, ref) => {
    return (
      <div className="flex h-10 w-full rounded-md border border-input overflow-hidden bg-background prefix-input-wrapper">
        <div className="flex items-center bg-muted px-3 text-muted-foreground text-sm border-r border-input prefix-input-prefix">
          {prefix}
        </div>
        <input
          className={cn(
            "flex h-full w-full bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-none prefix-input-field",
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

PrefixInput.displayName = "PrefixInput";

export { PrefixInput };
