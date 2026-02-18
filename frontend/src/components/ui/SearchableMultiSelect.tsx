import { useEffect, useState } from 'react'
import ReactSelect, { type ClassNamesConfig } from 'react-select'

export type ComboOption = {
  value: number
  label: string
}

export type SearchableMultiSelectProps = {
  label: string
  options: ComboOption[]
  value: number[]
  placeholder?: string
  error?: string
  disabled?: boolean
  onChange: (value: number[]) => void
}

export const SearchableMultiSelect = ({
  label,
  options,
  value,
  placeholder = 'Search…',
  error,
  disabled,
  onChange
}: SearchableMultiSelectProps) => {
  const [selectedLabelCache, setSelectedLabelCache] = useState<Record<number, string>>({})

  useEffect(() => {
    if (!options.length) {
      return
    }

    setSelectedLabelCache((previous) => {
      const next = { ...previous }
      for (const option of options) {
        next[option.value] = option.label
      }
      return next
    })
  }, [options])

  const selectedOptions = value.map((item) => {
    const option = options.find((candidate) => candidate.value === item)
    if (option) {
      return option
    }
    return { value: item, label: selectedLabelCache[item] ?? `#${item}` }
  })

  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <ReactSelect<ComboOption, true>
        unstyled
        classNames={{
          control: (state) =>
            `min-h-10 w-full rounded-md border bg-white px-2 py-1 text-sm shadow-sm ${
              state.isFocused ? 'border-brand-400 ring-2 ring-brand-200' : 'border-slate-200'
            } ${error ? 'border-red-400 ring-red-200' : ''} ${disabled ? 'bg-slate-100 text-slate-400' : ''}`,
          valueContainer: () => 'gap-1 px-1',
          input: () => 'm-0 p-0 text-sm text-slate-900',
          placeholder: () => 'text-slate-400',
          singleValue: () => 'text-slate-900',
          menu: () => 'mt-1 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm',
          menuList: () => 'max-h-56 p-1',
          option: (state) =>
            `cursor-pointer rounded px-3 py-2 text-sm ${
              state.isFocused ? 'bg-brand-50' : ''
            } ${state.isSelected ? 'bg-brand-100 text-brand-700' : 'text-slate-700'}`,
          clearIndicator: () => 'cursor-pointer px-2 text-slate-500 hover:text-slate-700',
          dropdownIndicator: () => 'cursor-pointer px-2 text-slate-500 hover:text-slate-700',
          indicatorSeparator: () => 'mx-1 w-px bg-slate-200',
          noOptionsMessage: () => 'px-2 py-2 text-xs text-slate-500',
          loadingMessage: () => 'px-2 py-2 text-xs text-slate-500',
          multiValue: () => 'rounded bg-brand-50',
          multiValueLabel: () => 'px-2 py-0.5 text-xs text-brand-700',
          multiValueRemove: () => 'cursor-pointer rounded-r px-1 text-brand-700 hover:bg-brand-100'
        } satisfies ClassNamesConfig<ComboOption, true>}
        options={options}
        value={selectedOptions}
        placeholder={placeholder}
        isDisabled={disabled}
        isMulti
        closeMenuOnSelect={false}
        noOptionsMessage={() => 'No matches'}
        onChange={(selected) => {
          onChange(selected.map((option) => option.value))
        }}
      />
      {value.length ? (
        <div className="text-xs text-slate-500">Selected: {value.length}</div>
      ) : null}
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  )
}