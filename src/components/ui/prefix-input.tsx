import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
interface PrefixInputProps extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'prefix'> {
  prefix?: string;
}
const PrefixInput = React.forwardRef<HTMLInputElement, PrefixInputProps>(({
  className,
  prefix,
  ...props
}, ref) => {
  return <div className="flex w-full items-center rounded-md border border-input bg-background ring-offset-background">
        {prefix && <div className="flex items-center justify-center px-3 py-2 text-base text-foreground border-r border-input bg-slate-400">
            {prefix}
          </div>}
        <input className={cn("flex w-full rounded-none rounded-r-md border-0 bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props} />
      </div>;
});
PrefixInput.displayName = "PrefixInput";
export { PrefixInput };