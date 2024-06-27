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
const filePath = 'srv/data/jmena-raw.xlsx';
let resultSimple: [string, number][] = []

let resultComplex: [string, number][] = []


const rawData = await readExcelFile(filePath)




if (Array.isArray(rawData) && rawData.length > 0) {
    let counterSimple = 0;
    let counterComplex = 0;
    for (const row of rawData as any[]) {
        // Capture both words and delimiters
        const parts = row["Křestní jméno"].toString().trim().match(/(\p{L}+|[\s.-]+)/gu);
        let processedName = '';
        let count = 0;
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
        const keys = Object.keys(row).filter(key => key !== 'Křestní jméno' && key !== '__rowNum__');

        keys.forEach(key => {
            count = count + row[key];
        });

        if (count > 0) {

            if (/[ .-]/.test(processedName)) {
                resultComplex.push([processedName, count]);
                await Bun.write(`public/data/complex/${counterComplex}.json`, JSON.stringify({ row, processedName, count }, null, 2));
                counterComplex++;
            } else {
                resultSimple.push([processedName, count]);
                await Bun.write(`public/data/simple/${counterSimple}.json`, JSON.stringify({ ...row, processedName, count }, null, 2));
                counterSimple++;
            }
            console.log(processedName, count);
        }
    }
}

// Writing result to names.json using Bun
await Bun.write('srv/data/namesSimple.json', JSON.stringify(resultSimple, null, 2));
await Bun.write('srv/data/namesComplex.json', JSON.stringify(resultComplex, null, 2));
console.log('Results written to namesSimple.json and namesComplex.json successfully.');

// Convert resultSimple and resultComplex to TSV format
const arrayToTsv = (data) => data.map(row => row.join('\t')).join('\n');

const simpleTsv = arrayToTsv(resultSimple);
const complexTsv = arrayToTsv(resultComplex);



// Writing the TSV data to files
await Bun.write('srv/data/namesSimple.tsv', simpleTsv);
await Bun.write('srv/data/namesComplex.tsv', complexTsv);

console.log('Results written to namesSimple.tsv and namesComplex.tsv successfully.');