import xlsx from 'xlsx';

// Function to read an Excel file and convert it to JSON
async function readExcelFile(filePath) {
    // Reading the file
    const workbook = xlsx.readFile(filePath, {});

    // Assuming the first sheet is what we want; adjust as necessary
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];


    // Converting the first column of the sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet, /* { range: "A2:A210829" } */);
    return jsonData;
}




// Example usage
const filePath = 'srv/data/jmena-raw-sample.xlsx';
let resultSimple: string[] = []

let resultComplex: string[] = []


const rawData = await readExcelFile(filePath)

console.log(rawData)


if (Array.isArray(rawData) && rawData.length > 0) {
    rawData.forEach((row: any) => {
        // Capture both words and delimiters
        const parts = row["Křestní jméno"].toString().trim().match(/(\p{L}+|[\s.-]+)/gu);
        let processedName = '';

        if (parts) {
            for (let i = 0; i < parts.length; i++) {
                // Check if the part is a word
                if (/[a-zA-Z]/.test(parts[i])) {
                    // Capitalize the first letter of the word and lower case the rest
                    processedName += parts[i].charAt(0).toUpperCase() + parts[i].slice(1).toLowerCase();
                } else {
                    // If it's not a word, it's a delimiter, so keep it as is
                    processedName += parts[i];
                }
            }
        }
        if (/[ .-]/.test(processedName)) {
            resultComplex.push(processedName);
        } else {
            resultSimple.push(processedName);
        }
        console.log(processedName);

    })
}

// Writing result to names.json using Bun
await Bun.write('srv/data/namesSimple.json', JSON.stringify(resultSimple, null, 2));
await Bun.write('srv/data/namesComplex.json', JSON.stringify(resultComplex, null, 2));
console.log('Results written to namesSimple.json and namesComplex.json successfully.');

// Convert resultSimple and resultComplex to TSV format
const toTsvString = (data: string[]) => data.join('\n').replace(/(.+)/g, '$1');
const simpleTsv = toTsvString(resultSimple);
const complexTsv = toTsvString(resultComplex);

// Writing the TSV data to files
await Bun.write('srv/data/namesSimple.tsv', simpleTsv);
await Bun.write('srv/data/namesComplex.tsv', complexTsv);

console.log('Results written to namesSimple.tsv and namesComplex.tsv successfully.');