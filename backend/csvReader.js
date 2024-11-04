const fs = require('fs');
const csvParser = require('csv-parser');

const readCSV = () => {
    return new Promise((resolve, reject) => {
        const filePath = './backend/Cigna_LocalPlus_rows.csv';

        // Check if the file exists before attempting to read it
        if (!fs.existsSync(filePath)) {
            return reject(new Error(`File not found: ${filePath}`));
        }

        const results = [];

        fs.createReadStream(filePath)
            .pipe(csvParser())
            .on('data', (data) => {
                // Push each row into the results array without filtering by uniqueness
                results.push({
                    serviceCode: data['billing_code_description'],
                    serviceZipcode: data['zip_code'],
                    serviceHospital: data['organization_name'],
                    servicePrice: data['negotiated_rate'],
                    serviceCity: data['city'],
                    serviceAddress: data['address_line_1']
                });
            })
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                console.error('Error reading CSV file:', error);
                reject(error);
            });
    });
};

module.exports = { readCSV };
