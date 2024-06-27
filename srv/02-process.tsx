function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}


const rawData = await Bun.file('srv/data/jmena-raw.json').json();

const columnNames = rawData.shift();

// count sums of all columns
const counts = rawData.filter(row => !isEmpty(row)).map(row => {
    let count = 0;
    for (const key in row) {
        if (key !== 'column1') {
            count += row[key];
        }
    }
    return { ...row, count };
});

const cleanCounts = counts.filter(row => row.count > 0).sort((a, b) => b.count - a.count).map(row => {
    // rename keys according to the columnNames
    let newRow = {
        name: row["Křestní jméno"],
        count: row.count
    };
    for (const key in row) {
        if (key !== 'count' && key !== 'Křestní jméno') {
            newRow[columnNames[key]] = row[key];
        }
    }
    return newRow;
});

// console.log(counts.length, cleanCounts.length, cleanCounts[0], cleanCounts[1], cleanCounts[2]);

let resultSimple: [string, number][] = []
let resultComplex: [string, number][] = []

let counterSimple = 0;
let counterComplex = 0;
for (const row of cleanCounts as any[]) {
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
        resultComplex.push([processedName, row.count]);
        await Bun.write(`public/data/complex/${counterComplex}.json`, JSON.stringify({ ...row, processedName }, null, 2));
        counterComplex++;
    } else {
        resultSimple.push([processedName, row.count]);
        await Bun.write(`public/data/simple/${counterSimple}.json`, JSON.stringify({ ...row, processedName }, null, 2));
        counterSimple++;
    }
    console.log(processedName);
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

export { }