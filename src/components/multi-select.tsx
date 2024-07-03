// src/components/multi-select.tsx
import { useState, useEffect, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
    XCircle,
    ChevronDown,
    XIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";

import FilteredList from "./filtered-list";


const multiSelectVariants = cva(
    "m-1 transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300",
    {
        variants: {
            variant: {
                default:
                    "border-foreground/10 text-foreground bg-card hover:bg-card/80",
                secondary:
                    "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
                inverted: "inverted",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

interface MultiSelectProps
    //   extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    extends VariantProps<typeof multiSelectVariants> {
    options: [string, number, number, string][];
    onValueChange: (value: { id: number, set: string }[]) => void;
    defaultValue: { id: number, set: string }[];
    placeholder?: string;
    animation?: number;
    maxCount?: number;
    asChild?: boolean;
    className?: string;
}

export const MultiSelect = forwardRef<
    HTMLButtonElement,
    MultiSelectProps
>(
    (
        {
            options,
            onValueChange,
            variant,
            defaultValue = [],
            placeholder = "Select options",
            animation = 0,
            maxCount = 3,
            asChild = false,
            className,
            ...props
        },
        ref
    ) => {
        const [selectedValues, setSelectedValues] = useState<{ id: number, set: string }[]>(defaultValue);
        const [isPopoverOpen, setIsPopoverOpen] = useState(false);
        const [filteredOptions, setFilteredOptions] = useState(options);
        const [searchValue, setSearchValue] = useState("");

        useEffect(() => {
            const newFilteredOptions = options.filter((option) =>
                option[0].toLowerCase().includes(searchValue.toLowerCase())
            )
            setFilteredOptions(newFilteredOptions);
        }, [searchValue, options]);

        useEffect(() => {
            if (JSON.stringify(selectedValues) !== JSON.stringify(defaultValue)) {
                setSelectedValues(defaultValue);
            }
        }, [defaultValue, selectedValues]);

        const handleInputKeyDown = (
            event: React.KeyboardEvent<HTMLInputElement>
        ) => {
            if (event.key === "Enter") {
                setIsPopoverOpen(true);
            } else if (event.key === "Backspace" && !event.currentTarget.value) {
                const newSelectedValues = [...selectedValues];
                newSelectedValues.pop();
                setSelectedValues(newSelectedValues);
                onValueChange(newSelectedValues);
            }
        };

        const toggleOption = (id: number, set: string) => {
            const newSelectedValues = selectedValues.some(
                selected => selected.id === id && selected.set === set
            )
                ? selectedValues.filter((v) => v.id !== id || v.set !== set)
                : [...selectedValues, { id, set }];
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        const handleClear = () => {
            setSelectedValues([]);
            onValueChange([]);
        };

        const handleTogglePopover = () => {
            setIsPopoverOpen((prev) => !prev);
        };

        const clearExtraOptions = () => {
            const newSelectedValues = selectedValues.slice(0, maxCount);
            setSelectedValues(newSelectedValues);
            onValueChange(newSelectedValues);
        };

        return (
            <>
                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            ref={ref}
                            {...props}
                            onClick={handleTogglePopover}
                            className={cn(
                                "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-inherit hover:bg-inherit",
                                className
                            )}
                        >
                            {selectedValues.length > 0 ? (
                                <div className="flex justify-between items-center w-full">
                                    <div className="flex flex-wrap items-center">
                                        {selectedValues.slice(0, maxCount).map((value) => {
                                            const option = options.find((option) => option[2] === value.id && option[3] === value.set);
                                            return (
                                                <Badge
                                                    key={`${value.id}-${value.set}`}
                                                    className={cn(
                                                        multiSelectVariants({ variant, className })
                                                    )}
                                                    style={{ animationDuration: `${animation}s` }}
                                                >
                                                    {option ? option[0] : "Unknown"}
                                                    <XCircle
                                                        className="ml-2 h-4 w-4 cursor-pointer"
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            toggleOption(value.id, value.set);
                                                        }}
                                                    />
                                                </Badge>
                                            );
                                        })}
                                        {selectedValues.length > maxCount && (
                                            <Badge
                                                className={cn(
                                                    "bg-transparent text-foreground border-foreground/1 hover:bg-transparent",
                                                    multiSelectVariants({ variant, className })
                                                )}
                                                style={{ animationDuration: `${animation}s` }}
                                            >
                                                {`+ ${selectedValues.length - maxCount} další`}
                                                <XCircle
                                                    className="ml-2 h-4 w-4 cursor-pointer"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        clearExtraOptions();
                                                    }}
                                                />
                                            </Badge>
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <XIcon
                                            className="h-4 mx-2 cursor-pointer text-muted-foreground"
                                            onClick={(event) => {
                                                event.stopPropagation();
                                                handleClear();
                                            }}
                                        />
                                        <Separator
                                            orientation="vertical"
                                            className="flex min-h-6 h-full"
                                        />
                                        <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between w-full mx-auto">
                                    <span className="text-sm text-muted-foreground mx-3">
                                        {placeholder}
                                    </span>
                                    <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
                                </div>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[200px] p-0"
                        align="start"
                        onEscapeKeyDown={() => setIsPopoverOpen(false)}
                    >
                        <Command shouldFilter={false}>
                            <CommandInput
                                placeholder="Hledat..."
                                onKeyDown={handleInputKeyDown}
                                value={searchValue}
                                onValueChange={(event) => { setSearchValue(event) }}
                            />
                            <CommandList>
                                <CommandEmpty>No results found.</CommandEmpty>


                                <CommandGroup>
                                    <FilteredList
                                        filteredOptions={filteredOptions}
                                        selectedValues={selectedValues}
                                        toggleOption={toggleOption} />

                                    {/* {options.map((option) => {
                                    const isSelected = selectedValues.includes(option[1]);
                                    return (
                                        <CommandItem
                                            key={`${option[1]}-${option[0]}`}
                                            onSelect={() => toggleOption(option[1])}
                                            style={{ pointerEvents: "auto", opacity: 1 }}
                                            className="cursor-pointer"
                                        >
                                            <div
                                                className={cn(
                                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                                    isSelected
                                                        ? "bg-primary text-primary-foreground"
                                                        : "opacity-50 [&_svg]:invisible"
                                                )}
                                            >
                                                <CheckIcon className="h-4 w-4" />
                                            </div>
                                            <span>{option[0]}</span>
                                        </CommandItem>
                                    );
                                })} */}
                                </CommandGroup>
                                <CommandSeparator />
                                <CommandGroup>
                                    <div className="flex items-center justify-between">
                                        {selectedValues.length > 0 && (
                                            <>
                                                <CommandItem
                                                    onSelect={handleClear}
                                                    style={{ pointerEvents: "auto", opacity: 1 }}
                                                    className="flex-1 justify-center cursor-pointer"
                                                >
                                                    Zrušit výběr
                                                </CommandItem>
                                                <Separator
                                                    orientation="vertical"
                                                    className="flex min-h-6 h-full"
                                                />
                                            </>
                                        )}
                                        <CommandSeparator />
                                        <CommandItem
                                            onSelect={() => setIsPopoverOpen(false)}
                                            style={{ pointerEvents: "auto", opacity: 1 }}
                                            className="flex-1 justify-center cursor-pointer"
                                        >
                                            Zavřít
                                        </CommandItem>
                                    </div>
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
            </>
        );
    }
);

MultiSelect.displayName = "MultiSelect";