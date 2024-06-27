import Excel from 'exceljs';
import { read } from 'xlsx';

// Function to read an Excel file and convert it to JSON using a stream
async function readExcelFile(filePath: string) {
    const workbookReader = new Excel.stream.xlsx.WorkbookReader(filePath, {});
    const jsonData: { [key: string]: any }[] = [];

    for await (const worksheetReader of workbookReader) {
        // Assuming the first sheet is what we want; adjust as necessary
        // If you need to process a specific sheet, you can check worksheetReader.name here

        for await (const row of worksheetReader) {
            // Convert row to JSON - assuming you want the entire row
            // Adjust according to your needs, for example, reading specific cells
            const rowJson: { [key: string]: any } = {};
            row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
                rowJson[`column${colNumber}`] = cell.value;
            });
            console.log(rowJson);
            jsonData.push(rowJson);
        }

        // Break after the first sheet if you only need the first one
        break;
    }

    return jsonData;
}

// Example usage remains the same
const filePath = 'srv/data/jmena-raw.xlsx';

const completeJson = await readExcelFile(filePath);

Bun.write('srv/data/jmena-raw.json', JSON.stringify(completeJson, null, 2));