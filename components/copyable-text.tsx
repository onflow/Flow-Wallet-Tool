import { Tooltip, TooltipTrigger, TooltipContent } from "./ui/tooltip";

interface CopyableTooltipTextProps {
  value?: string;
  className?: string;
}

export function CopyableText({ value, className = "text-sm break-all cursor-pointer hover:bg-muted/50 rounded p-1" }: CopyableTooltipTextProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div 
          className={className}
          onClick={() => navigator.clipboard.writeText(value || "")}
        >
          {value}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>Copy</p>
      </TooltipContent>
    </Tooltip>
  );
} 