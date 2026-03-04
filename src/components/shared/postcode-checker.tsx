"use client";

import { useState, useCallback } from "react";
import { Check, X, MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

function formatPostcode(value: string): string {
  const cleaned = value.toUpperCase().replace(/\s/g, "");
  if (cleaned.length <= 4) return cleaned;
  const outward = cleaned.slice(0, -3);
  const inward = cleaned.slice(-3);
  return `${outward} ${inward}`;
}

interface PostcodeCheckerProps {
  onSubmit: (postcode: string) => void;
  placeholder?: string;
  buttonText?: string;
  loading?: boolean;
  className?: string;
}

export function PostcodeChecker({
  onSubmit,
  placeholder = "Enter your postcode",
  buttonText = "Compare deals",
  loading = false,
  className,
}: PostcodeCheckerProps) {
  const [value, setValue] = useState("");
  const [touched, setTouched] = useState(false);

  const isValid = UK_POSTCODE_REGEX.test(value.trim());
  const showValidation = touched && value.length > 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      // Limit length to prevent excessively long input
      if (raw.replace(/\s/g, "").length <= 7) {
        setValue(formatPostcode(raw));
      }
    },
    []
  );

  const handleBlur = useCallback(() => {
    setTouched(true);
    if (value) {
      setValue(formatPostcode(value));
    }
  }, [value]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      setTouched(true);
      if (isValid) {
        onSubmit(formatPostcode(value.trim()));
      }
    },
    [isValid, onSubmit, value]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className={cn("flex flex-col sm:flex-row gap-2", className)}
    >
      <div className="relative flex-1">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            "pl-9 pr-9 h-11",
            showValidation && isValid && "border-[#38a169] focus-visible:ring-[#38a169]/30",
            showValidation && !isValid && "border-destructive focus-visible:ring-destructive/30"
          )}
          aria-label="UK postcode"
          aria-invalid={showValidation && !isValid}
          autoComplete="postal-code"
        />
        {showValidation && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid ? (
              <Check className="size-4 text-[#38a169]" />
            ) : (
              <X className="size-4 text-destructive" />
            )}
          </div>
        )}
      </div>
      <Button
        type="submit"
        disabled={!isValid || loading}
        className="h-11 px-6 bg-gradient-to-r from-[#1a365d] to-[#38a169] hover:from-[#2a4a7f] hover:to-[#48bb78] text-white border-0 shrink-0"
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Checking...
          </>
        ) : (
          buttonText
        )}
      </Button>
      {showValidation && !isValid && (
        <p className="text-xs text-destructive sm:hidden">
          Please enter a valid UK postcode
        </p>
      )}
    </form>
  );
}
