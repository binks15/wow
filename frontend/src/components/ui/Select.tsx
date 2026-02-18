import {
  Children,
  isValidElement,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";
import ReactSelect, { type ClassNamesConfig } from "react-select";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
};

type ParsedOption = {
  value: string;
  label: string;
  isDisabled?: boolean;
};

const selectClassNames: ClassNamesConfig<ParsedOption, false> = {
  control: (state) =>
    `min-h-10 w-full rounded-md border bg-white px-2 py-1 text-sm shadow-sm ${
      state.isFocused ? "border-brand-400 ring-2 ring-brand-200" : "border-slate-200"
    }`,
  valueContainer: () => "gap-1 px-1",
  input: () => "m-0 p-0 text-sm text-slate-900",
  placeholder: () => "text-slate-400",
  singleValue: () => "text-slate-900",
  menu: () => "mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm",
  menuList: () => "max-h-56 p-1",
  option: (state) =>
    `cursor-pointer rounded px-3 py-2 text-sm ${
      state.isFocused ? "bg-brand-50" : ""
    } ${state.isSelected ? "bg-brand-100 text-brand-700" : "text-slate-700"}`,
  clearIndicator: () => "cursor-pointer px-2 text-slate-500 hover:text-slate-700",
  dropdownIndicator: () => "cursor-pointer px-2 text-slate-500 hover:text-slate-700",
  indicatorSeparator: () => "mx-1 w-px bg-slate-200",
};

const parseOptions = (children: ReactNode): ParsedOption[] =>
  Children.toArray(children)
    .map((child) => {
      if (!isValidElement(child) || child.type !== "option") {
        return null;
      }

      const optionValue =
        child.props.value !== undefined ? String(child.props.value) : String(child.props.children ?? "");

      return {
        value: optionValue,
        label: String(child.props.children ?? optionValue),
        isDisabled: Boolean(child.props.disabled),
      } ;
    })
    .filter((option) => option !== null);

export const Select = ({
  label,
  error,
  className,
  children,
  value,
  onChange,
  disabled,
  placeholder,
  ...props
}: SelectProps) => {
  const options = parseOptions(children);
  const normalizedValue = value !== undefined && value !== null ? String(value) : "";
  const selectedOption = options.find((option) => option.value === normalizedValue) ?? null;
  const fallbackPlaceholder =
    placeholder ?? options.find((option) => option.isDisabled && option.value === "")?.label ?? "Select...";

  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-slate-700 pr-3">{label}</span>
      <ReactSelect
        unstyled
        classNames={{
          ...selectClassNames,
          control: (state) => {
            const base = selectClassNames.control?.(state) ?? "";
            const errorClasses = error ? "border-red-400 ring-red-200" : "";
            const disabledClasses = disabled ? "bg-slate-100 text-slate-400" : "";
            return `${base} ${errorClasses} ${disabledClasses} ${className ?? ""}`.trim();
          },
        }}
        options={options.filter((option) => !(option.isDisabled && option.value === ""))}
        value={selectedOption && selectedOption.value !== "" ? selectedOption : null}
        isDisabled={disabled}
        isSearchable={false}
        placeholder={fallbackPlaceholder}
        onChange={(selected) => {
          const nextValue = selected?.value ?? "";
          const syntheticEvent = {
            target: { value: nextValue },
            currentTarget: { value: nextValue },
          } as ChangeEvent<HTMLSelectElement>;
          onChange?.(syntheticEvent);
        }}
        {...props}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  );
};