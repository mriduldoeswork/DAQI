const Web3 = require("web3").default;
const path = require("path");

// Connect to Ganache local blockchain
const web3 = new Web3("http://127.0.0.1:8545");

// Read compiled contract JSON (adjust the path as needed)
const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

// Create contract instance
const contractABI = contractJson.abi;
// Use the correct network ID
const contractAddress = contractJson.networks["<YOUR_NETOWRK_ID>"].address;

const airQualityContract = new web3.eth.Contract(contractABI, contractAddress);

async function retrieveData() {
    try {
        const readingCount = await airQualityContract.methods.getReadingCount().call();
        console.log(`Total readings: ${readingCount}`);

        if (readingCount > 0) {
            for (let i = 0; i < readingCount; i++) {
                const reading = await airQualityContract.methods.getReading(i).call();
                console.log(`Reading ${i + 1}:`);
                console.log(`  Timestamp: ${new Date(Number(reading[0]) * 1000).toLocaleString()}`); // Convert timestamp to readable format
                console.log(`  CO2: ${reading[1]}`);
                console.log(`  NO2: ${reading[2]}`);
                console.log(`  PM2.5: ${reading[3]}`);
                console.log(`  PM10: ${reading[4]}`);
            }
        } else {
            console.log("No readings found on the blockchain.");
        }
    } catch (error) {
        console.error("Error retrieving data:", error);
    }
}

retrieveData();