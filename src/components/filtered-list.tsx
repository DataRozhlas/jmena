import { Virtuoso } from "react-virtuoso";
import { CheckIcon } from "lucide-react"
import { cn } from "@/lib/utils";
import { CommandItem } from "@/components/ui/command";

import { toast } from "sonner"


const formatNumber = (num: number) => {
    if (num >= 1000) {
        return `${(num / 1000).toFixed(0)} tis.`; // Adjust decimal places as needed
    }
    return num.toLocaleString("cs-CZ");
};


type FilteredListProps = {
    filteredOptions: [string, number, number, string][],
    selectedValues: { id: number, set: string }[],
    toggleOption: (id: number, set: string) => void
};

function FilteredList({ filteredOptions, selectedValues, toggleOption }: FilteredListProps) {
    if (filteredOptions.length === 0) {
        return (
            <div className="flex items-center justify-center h-48 text-gray-500">
                Žádné výsledky
            </div>
        );
    }

    return (
        <Virtuoso
            style={{ height: 250 }}
            totalCount={filteredOptions.length}
            data={filteredOptions}
            itemContent={(_, option) => {
                const isSelected = selectedValues.some(
                    selected => selected.id === option[2] && selected.set === option[3]
                );
                return (
                    <CommandItem
                        key={`${option[2]}-${option[0]}`}
                        onSelect={() => {
                            if (option[1] < 20 && !isSelected) {
                                toast.info(<div><p>Křestní jméno <strong>{option[0]}</strong> se v evidenci obyvatel vyskytuje jen <strong>{option[1]}</strong>×.</p><br /><p>Chceme chránit soukromí, proto <em>zobrazujeme detailní statistiky až u jmem s alespoň 20 výskyty</em>.</p></div>, { duration: 3500 })
                            }
                            toggleOption(option[2], option[3])
                        }}
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
                        <span>{`${option[0]} (${formatNumber(option[1])})`}</span>
                    </CommandItem>
                );
            }}
        >

        </Virtuoso>

    )
}

export default FilteredList;