import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { forwardRef, useId, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

type PasswordInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  className?: string;
};

const requirementsList = [
  { regex: /.{6,}/, text: "At least 6 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
];

const checkStrength = (pass: string) =>
  requirementsList.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));

const getStrengthColor = (score: number) => {
  if (score === 0) return "bg-border";
  if (score <= 1) return "bg-red-500";
  if (score <= 2) return "bg-orange-500";
  return "bg-emerald-500";
};

const getStrengthText = (score: number) => {
  if (score === 0) return "Enter a password";
  if (score <= 2) return "Weak password";
  return "Strong password";
};

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    { value, onChange, placeholder = "Enter your password", className },
    ref,
  ) => {
    const id = useId();
    const [isVisible, setIsVisible] = useState(false);
    const strength = useMemo(() => checkStrength(value), [value]);
    const strengthScore = useMemo(
      () => strength.filter((r) => r.met).length,
      [strength],
    );

    const showStrength = value.length > 0;

    return (
      <div>
        <div className="relative">
          <Input
            id={id}
            ref={ref}
            name={id}
            className={className}
            placeholder={placeholder}
            type={isVisible ? "text" : "password"}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            aria-describedby={showStrength ? `${id}-description` : undefined}
            aria-invalid={false}
          />

          <button
            type="button"
            onClick={() => setIsVisible((s) => !s)}
            aria-label={isVisible ? "Hide password" : "Show password"}
            className="text-muted-foreground/80 hover:text-foreground absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md"
          >
            {isVisible ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
          </button>
        </div>

        {showStrength && (
          <>
            <div
              className="bg-border mt-3 mb-2 h-1 w-full overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={strengthScore}
              aria-valuemin={0}
              aria-valuemax={requirementsList.length}
              aria-label="Password strength"
              aria-hidden={!showStrength}
            >
              <div
                className={`h-full ${getStrengthColor(strengthScore)} transition-all duration-300 ease-out`}
                style={{
                  width: `${(strengthScore / requirementsList.length) * 100}%`,
                }}
              />
            </div>

            {/* description */}
            <p
              id={`${id}-description`}
              className="text-foreground mb-2 text-sm font-medium"
              aria-hidden={!showStrength}
            >
              {getStrengthText(strengthScore)}. Must contain:
            </p>

            {/* Requirement list */}
            <ul
              className="space-y-1.5"
              aria-label="Password requirements"
              aria-hidden={!showStrength}
            >
              {strength.map((req, i) => (
                <li
                  key={`requirement-${i + 1}`}
                  className="flex items-center gap-2"
                >
                  {req.met ? (
                    <CheckIcon
                      size={16}
                      className="text-emerald-500"
                      aria-hidden="true"
                    />
                  ) : (
                    <XIcon
                      size={16}
                      className="text-muted-foreground/80"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`text-sm ${req.met ? "text-emerald-600" : "text-muted-foreground"}`}
                  >
                    {req.text}
                    <span className="sr-only">
                      {req.met
                        ? " - Requirement met"
                        : " - Requirement not met"}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";
export default PasswordInput;
