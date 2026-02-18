import { useEffect, useState } from 'react'
import ReactSelect, { type ClassNamesConfig } from 'react-select'
import { useDebouncedValue } from '../../hooks/useDebouncedValue'

export type ComboOption = {
  value: number
  label: string
}

export type AsyncSelectProps = {
  label: string
  options: ComboOption[]
  value?: number
  placeholder?: string
  error?: string
  isLoading?: boolean
  disabled?: boolean
  onChange: (value?: number) => void
  onSearch: (query: string) => void
}

export const AsyncSearchableSelect = ({
  label,
  options,
  value,
  placeholder = 'Search…',
  error,
  isLoading,
  disabled,
  onChange,
  onSearch
}: AsyncSelectProps) => {
  const [inputValue, setInputValue] = useState('')
  const [selectedOverride, setSelectedOverride] = useState('')
  const debounced = useDebouncedValue(inputValue, 300)

  useEffect(() => {
    onSearch(debounced.trim())
  }, [debounced, onSearch])

  useEffect(() => {
    if (value === undefined) {
      setSelectedOverride('')
      return
    }

    const match = options.find((option) => option.value === value)
    if (match) {
      setSelectedOverride(match.label)
    }
  }, [options, value])

  const selectedOption =
    value === undefined
      ? null
      : options.find((option) => option.value === value) ??
        (selectedOverride ? { value, label: selectedOverride } : null)

  return (
    <label className="block space-y-2 text-sm">
      <span className="font-medium text-slate-700">{label}</span>
      <ReactSelect<ComboOption, false>
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
        } satisfies ClassNamesConfig<ComboOption, false>}
        options={options}
        value={selectedOption}
        inputValue={inputValue}
        onInputChange={(nextValue, meta) => {
          if (meta.action === 'input-change') {
            setInputValue(nextValue)
          }
        }}
        placeholder={placeholder}
        isDisabled={disabled}
        isLoading={isLoading}
        isClearable
        noOptionsMessage={() => 'No matches'}
        loadingMessage={() => 'Loading...'}
        onChange={(selected) => {
          if (!selected) {
            onChange(undefined)
            setSelectedOverride('')
            return
          }

          onChange(selected.value)
          setSelectedOverride(selected.label)
          setInputValue('')
        }}
      />
      {error ? <span className="text-xs text-red-500">{error}</span> : null}
    </label>
  )
}