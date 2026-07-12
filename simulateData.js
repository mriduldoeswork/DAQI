require('dotenv').config(); // Load environment variables from .env
const Web3 = require("web3").default;
const path = require("path");
const axios = require("axios"); // Import axios

// Get Pinata JWT from environment variables
const pinataJWT = process.env.PINATA_JWT;

// Connect to Ganache local blockchain
const web3 = new Web3("http://127.0.0.1:8545");

// Read compiled contract JSON (adjust the path as needed)
const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

// Create contract instance
const contractABI = contractJson.abi;
// Use the correct network ID
const contractAddress = contractJson.networks["<YOUR_NETOWRK_ID>"].address;

const airQualityContract = new web3.eth.Contract(contractABI, contractAddress);

// Get the first account from Ganache
async function getOwnerAddress() {
    const accounts = await web3.eth.getAccounts();
    return accounts[0];
}

async function sendToPinata(data) {
    try {
        const body = {
            pinataContent: data,
            pinataOptions: {
                keyvalues: { name: "Air Quality Reading" }
            }
        };
        const response = await axios.post(
            "https://api.pinata.cloud/pinning/pinJSONToIPFS",
            body, {
            headers: {
                "Authorization": `Bearer ${pinataJWT}`
            },
        }
        );
        console.log("Data pinned to IPFS with hash:", response.data.IpfsHash);
        return response.data.IpfsHash; // Return the IPFS hash
    } catch (error) {
        console.error("Error pinning data to IPFS:", error);
        return null;
    }
}


async function simulateSensorData() {
    try {
        const ownerAddress = await getOwnerAddress();

        // Simulate sensor data
        const co2 = Math.floor(Math.random() * (450 - 350 + 1)) + 350; // CO2: 350-450 ppm
        const no2 = Math.floor(Math.random() * (50 + 1)); // NO2: 0-50 µg/m³
        const pm25 = Math.floor(Math.random() * (12 + 1)); // PM2.5: 0-12 µg/m³
        const pm10 = Math.floor(Math.random() * (20 + 1)); // PM10: 0-20 µg/m³

        console.log(`Submitting data: CO2=${co2}, NO2=${no2}, PM2.5=${pm25}, PM10=${pm10}`);

        await airQualityContract.methods.addReading(co2, no2, pm25, pm10).send({ from: ownerAddress, gas: '1000000' });
        console.log("Data submitted to blockchain.");

        // Prepare data for Pinata
        const sensorData = {
            co2: co2,
            no2: no2,
            pm25: pm25,
            pm10: pm10,
            timestamp: new Date().toISOString() // Add a timestamp
        };

        // Send data to Pinata
        const ipfsHash = await sendToPinata(sensorData);
        if (ipfsHash) {
            console.log("Successfully pinned data to IPFS. IPFS Hash:", ipfsHash);
            // You might want to store the IPFS hash on the blockchain as well
        }


    } catch (error) {
        console.error("Error submitting data:", error);
    }
}

// Run simulation every 10 seconds
setInterval(simulateSensorData, 10000);