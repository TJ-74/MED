const express = require('express');
const cors = require('cors');
const { readCSV } = require('./csvReader');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let servicesData = [];

// Load CSV data when the server starts
readCSV()
    .then((data) => {
        servicesData = data;
        console.log('CSV data loaded successfully.');
    })
    .catch((error) => {
        console.error('Error loading CSV data:', error);
    });

// Endpoint to get service codes from CSV
app.get('/api/services', async (req, res) => {
    try {
        if (!servicesData.length) {
            servicesData = await readCSV();
        }
        console.log('CSV data loaded successfully.');
        res.json(servicesData);
    } catch (error) {
        res.status(500).send('Error reading CSV file');
    }
});

// Enhanced endpoint to search for hospital and price by serviceCode and nearest zipCodes
app.get('/api/service', (req, res) => {
    const { serviceCode, zipCode } = req.query;

    if (!serviceCode || !zipCode) {
        return res.status(400).send('Service code and zip code are required');
    }

    const zipCodePrefix = zipCode.slice(0, 5).trim();
    console.log('Received serviceCode:', serviceCode);
    console.log('Received zipCode prefix:', zipCodePrefix);

    // Filter all services that match the service code and have valid zip codes
    const matchingServices = servicesData.filter(service =>
        service.serviceCode.toLowerCase() === serviceCode.toLowerCase() &&
        service.serviceZipcode && service.serviceZipcode.trim() !== ''
    );

    console.log('Matching services count:', matchingServices.length);

    if (matchingServices.length === 0) {
        console.log('No matching service code found.');
        return res.status(404).send('No matching service found for the provided service code.');
    }

    // Find the exact match by zip code with safety check
    const exactMatch = matchingServices.find(service =>
        service.serviceZipcode && service.serviceZipcode.slice(0, 5).trim() === zipCodePrefix
    );

    if (exactMatch) {
        console.log('Exact match found:', exactMatch);
        return res.json([{
            serviceHospital: exactMatch.serviceHospital,
            servicePrice: exactMatch.servicePrice,
            serviceZipcode: exactMatch.serviceZipcode
        }]);
    }

    // Find the two nearest zip codes if no exact match is found
    const providedZipCodeNum = parseInt(zipCodePrefix, 10);

    if (isNaN(providedZipCodeNum)) {
        console.log('Invalid zip code format.');
        return res.status(400).send('Invalid zip code format.');
    }

    const nearestMatches = matchingServices
        .map(service => {
            const serviceZipPrefix = service.serviceZipcode
                ? parseInt(service.serviceZipcode.slice(0, 5).trim(), 10)
                : NaN;

            if (isNaN(serviceZipPrefix)) {
                console.log('Invalid service zip code format:', service.serviceZipcode);
                return null;
            }

            return {
                ...service,
                zipDifference: Math.abs(serviceZipPrefix - providedZipCodeNum)
            };
        })
        .filter(service => service !== null)
        .sort((a, b) => a.zipDifference - b.zipDifference)
        .slice(0, 2); // Get the top 2 nearest matches

    // Log the nearest matches and their details
    console.log('Nearest matches found:');
    nearestMatches.forEach(match => {
        console.log(`Zip Code: ${match.serviceZipcode}, Hospital: ${match.serviceHospital}, Price: ${match.servicePrice}, Zip Difference: ${match.zipDifference}`);
    });

    if (nearestMatches.length > 0) {
        return res.json(nearestMatches.map(match => ({
            serviceHospital: match.serviceHospital,
            servicePrice: match.servicePrice,
            serviceZipcode: match.serviceZipcode,
            serviceCode: match.serviceCode,
            serviceAddress: match.serviceAddress
        })));
    } else {
        console.log('No nearest matches found.');
        return res.status(404).send('No matching or nearest services found for the provided service code.');
    }
});


module.exports = app;

