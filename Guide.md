# Decentralized Air Quality Index - Project IDX Simulation Guide

## 1. Introduction

This document provides a comprehensive guide to building a simulated Decentralized Air Quality Index system within Google's Project IDX. It covers setting up the development environment, deploying a smart contract, simulating IoT data submission, and creating a web dashboard for data visualization.

## 2. Project Goals

-   Establish a working development environment in Project IDX.
-   Develop, compile, and deploy a Solidity smart contract (`AirQualityData.sol`) to a simulated Ethereum blockchain.
-   Simulate IoT sensor data submission to the deployed smart contract.
-   Build a dynamic web dashboard, using Express.js and Web3.js, to visualize the blockchain-stored sensor data.

## 3. Environment setup

### 3.1. Setting Up the Project IDX Workspace

1.  **Create a New Project:**
    -   Open Project IDX in your preferred web browser.
    -   Initiate a new project. Select either a "Blank" template or a "Node.js" template.
2.  **Access the Integrated Terminal:**
    -   Locate and open the integrated terminal within the IDX workspace.
3.  **Install Essential Dependencies:**
    -   Execute the following commands in the terminal:
        ```bash
        # Truffle for smart contract development
        npm install -g truffle
        # Ganache for local blockchain
        npm install -g ganache
        # -g: means global install.

        # Backend and HTTP client libraries
        npm install web3 express axios
        # Frontend bundler (as a dev dependency)
        npm install -D parcel
        ```
4. **Modify package.json Scripts:**  
    Open the package.json file in the project root and add the scripts section:  
    ```json
    {
        "dependencies": {
            "axios": "^1.8.4",
            "express": "^4.21.2",
            "web3": "^4.16.0"
        },
        "devDependencies": {
            "parcel": "^2.14.4"
        },
        "scripts": {
            "migrate": "npx truffle migrate",
            "start": "node server.js",
            "build": "parcel build public/index.html --dist-dir public/dist",
            "dev": "parcel public/index.html --dist-dir public/dist"
        }
    }
    ```
    - Run the following command to setup the environment:
    ```bash
    npm install
    ```

## 4. Backend setup

### 4.1. Creating and Deploying the Smart Contract (with Ganache Workaround)

1. **Initialize a Truffle Project:**
    -   Navigate to the project root directory in the terminal and execute:
        ```bash
        truffle init
        ```
2. **Modify the `truffle-config.js`:**
    ```js
    module.exports = {
        networks: {
            development: {
                host: "127.0.0.1",
                port: 8545,
                network_id: "*",
            },
        },
        compilers: {
            solc: {
                version: "^0.8.0",
            },
        },
    };
    ```
3.  **Create `AirQualityData.sol`:**
    -   Navigate to the `contracts` directory and create a new file named `AirQualityData.sol`.
    -   Paste the following smart contract code into the file:
    ```sol
    // SPDX-License-Identifier: MIT
    pragma solidity ^0.8.0;

    contract AirQualityData {
        struct Reading {
            uint256 timestamp;
            uint256 co2;
            uint256 no2;
            uint256 pm25;
            uint256 pm10;
        }

        Reading[] public readings;
        address public owner;

        event NewReading(uint256 timestamp, uint256 co2, uint256 no2, uint256 pm25, uint256 pm10);

        constructor() {
            owner = msg.sender;
        }

        // Modifier to restrict function access
        modifier onlyOwner() {
            require(msg.sender == owner, "Only owner can call this function");
            _;
        }

        // Function to add a new reading (simulated IoT sensor data)
        function addReading(uint256 _co2, uint256 _no2, uint256 _pm25, uint256 _pm10) public onlyOwner {
            uint256 currentTime = block.timestamp;
            readings.push(Reading(currentTime, _co2, _no2, _pm25, _pm10));
            emit NewReading(currentTime, _co2, _no2, _pm25, _pm10);
        }

        // Function to get total number of readings
        function getReadingCount() public view returns (uint256) {
            return readings.length;
        }
        
        // Function to get the latest reading by accessing the last element of the readings array
        function getReading(uint index) public view returns (uint, uint, uint, uint, uint) {
            Reading memory r = readings[index];
            return (r.timestamp, r.co2, r.no2, r.pm25, r.pm10);
        }
    }
    ```
4.  **Compile the Smart Contract:**
    -   In the terminal, run:
        ```bash
        truffle compile
        ```
5.  **Create `2_deploy_contracts.js`:**
    -   Navigate to the `migrations` directory and create a file named `2_deploy_contracts.js`.
    -   Paste the following deployment script into the file:
    ```js
    const AirQualityData = artifacts.require("AirQualityData");

    module.exports = function (deployer) {
        deployer.deploy(AirQualityData);
    };
    ```
6.  **Start Ganache:**
    -   In a new terminal you can run `ganache emulator` by the following command:
        ```bash
        ganache
        ```
    -   This starts a local Ganache instance, which will be used for deployment.
7.  **Deploy the Smart Contract:**
    -   In the new terminal you can deploy the smart contract by the following command:
        ```bash
        npm run migrate
        ```
        - The command npm run migrate deploys the smart contract to the Ganache instance, which is a local blockchain.

### 4.2. Simulating IoT Data Submission

1.  **Create `simulateData.js`:**
    -   Create a new file named `simulateData.js` in the project root.
    -   Paste the following simulation script into the file:
        ```javascript
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
        const contractAddress = contractJson.networks["<YOUR_NETWORK_ID>"].address;

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
        ```
        - Replace `<YOUR_NETWORK_ID>` with the correct network ID. You will find this in the terminal where you ran the command `npm run migrate`.
        - After every run a new network id will get added to `AirQualityData.json` present at `/home/user/test/build/contracts/AirQualityData.json`, which cannot be used later, so you can delete it time to time to keep the file clean.
2.  **Run the Simulation Script:**
    -   In the new terminal you can run `simulateData.js` by the following command:
        ```bash
        node simulateData.js
        ```
3.  **Create `retrieveData.js`:**
    -   Create a new file named `retrieveData.js` in the project root.
    -   Paste the following simulation script into the file:
        ```javascript
        const Web3 = require("web3").default;
        const path = require("path");

        // Connect to Ganache local blockchain
        const web3 = new Web3("http://127.0.0.1:8545");

        // Read compiled contract JSON (adjust the path as needed)
        const contractJson = require(path.join(__dirname, "build", "contracts", "AirQualityData.json"));

        // Create contract instance
        const contractABI = contractJson.abi;
        // Use the correct network ID
        const contractAddress = contractJson.networks["<YOUR_NETWORK_ID>"].address;

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
        ```
        - Replace `<YOUR_NETWORK_ID>` with the correct network ID. You will find this in the terminal where you ran the command `npm run migrate`. The Network ID get generated after running the command `npm run migrate`.
4.  **Run the Retrieve Script:**
    -   In the new terminal you can run `retrieveData.js` by the following command:
        ```bash
        node retrieveData.js
        ```

### 4.3. Building the server for Web Dashboard

1.  **Create `server.js`:**
    -   Create a file named `server.js` in the project root.
    -   Paste the following Express.js server code into the file:
    ```js
    const express = require("express");
    const path = require("path");
    const Web3 = require("web3").default; // Import Web3
    const fs = require('fs'); // To read the contract JSON

    const app = express();
    const PORT = process.env.PORT || 3000;

    // --- Web3 and Contract Setup START ---
    let web3;
    let airQualityContract;
    let contractAddress;
    let contractABI;

    async function initWeb3() {
        try {
            web3 = new Web3("http://127.0.0.1:8545"); // Connect to Ganache inside the workspace

            // Read compiled contract JSON dynamically
            const contractJsonPath = path.join(__dirname, "build", "contracts", "AirQualityData.json");
            const contractJsonContent = fs.readFileSync(contractJsonPath, 'utf8');
            const contractJson = JSON.parse(contractJsonContent);

            contractABI = contractJson.abi;

            // Get the network ID Ganache is running on
            const networkId = await web3.eth.net.getId();
            const deployedNetwork = contractJson.networks[networkId.toString()]; // Use toString() for safety

            if (!deployedNetwork) {
                console.error(`Contract not deployed on network ID ${networkId}. Make sure Ganache is running and you have migrated.`);
                return; // Stop initialization if contract not found on this network
            }

            contractAddress = deployedNetwork.address;
            console.log(`Contract Address: ${contractAddress} on Network ID: ${networkId}`);

            airQualityContract = new web3.eth.Contract(contractABI, contractAddress);
            console.log("Web3 and contract initialized successfully.");

        } catch (error) {
            console.error("Failed to initialize Web3 or contract:", error);
        }
    }

    initWeb3(); // Initialize on server start
    // --- Web3 and Contract Setup END ---

    // Serve static files from the "public/dist" directory (Parcel output)
    app.use(express.static(path.join(__dirname, "public", "dist")));

    // --- API Endpoint START ---
    app.get("/api/data", async (req, res) => {
        if (!airQualityContract) {
            // Attempt to re-initialize if failed before
            await initWeb3();
            if (!airQualityContract) {
                return res.status(500).json({ error: "Contract not initialized. Check server logs." });
            }
        }
        try {
            // readingCount will be a BigInt
            const readingCount = await airQualityContract.methods.getReadingCount().call();
            // console.log("Reading Count:", readingCount, typeof readingCount); // Debug log

            if (readingCount > 0n) {
                const latestReadingIndex = readingCount - 1n;
                // console.log("Fetching index:", latestReadingIndex); // Debug log

                // latestReading will contain BigInts
                const latestReading = await airQualityContract.methods.getReading(latestReadingIndex).call();
                // console.log("Latest Reading Raw:", latestReading); // Debug log
                res.json({
                    timestamp: latestReading[0].toString(),
                    co2: latestReading[1].toString(),
                    no2: latestReading[2].toString(),
                    pm25: latestReading[3].toString(),
                    pm10: latestReading[4].toString(),
                });
            } else {
                res.json({ message: "No readings available yet." });
            }
        } catch (error) {
            console.error("Error fetching data from contract:", error);
            res.status(500).json({ error: "Failed to fetch data from blockchain." });
        }
    });

    app.get("/api/last10", async (req, res) => {
        if (!airQualityContract) {
            await initWeb3();
            if (!airQualityContract) {
                return res.status(500).json({ error: "Contract not initialized. Check server logs." });
            }
        }

        try {
            const readingCount = await airQualityContract.methods.getReadingCount().call();
            const count = Number(readingCount); // Convert BigInt to Number for calculations
            const readings = [];

            if (count === 0) {
                return res.json({ message: "No readings available yet." });
            }

            const numToFetch = Math.min(10, count);
            for (let i = count - numToFetch; i < count; i++) {
                const reading = await airQualityContract.methods.getReading(i).call();
                readings.push({
                    timestamp: new Date(Number(reading[0]) * 1000).toLocaleString(), // Convert to human-readable format
                    co2: reading[1].toString(),
                    no2: reading[2].toString(),
                    pm25: reading[3].toString(),
                    pm10: reading[4].toString(),
                });
            }

            res.json(readings);

        } catch (error) {
            console.error("Error fetching last 10 readings:", error);
            res.status(500).json({ error: "Failed to fetch last 10 readings from blockchain." });
        }
    });

    // --- API Endpoint END ---

    // Serve the main HTML file for any other GET request (helps with SPA routing if needed)
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "public", "dist", "index.html"));
    });

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Access the dashboard at: https://<span class="math-inline">\{PORT\}\-</span>{process.env.GOOGLE_CLOUD_WORKSTATIONS_CLUSTER_ID || 'your-idx-preview-url'}`); // Helper log
    });
    ```

### 4.4. Setting up Pinata IPFS

1. **Create a Pinata account (if you don't have one):**  
    Go to https://www.pinata.cloud/ and sign up.

2. **Get your JWT:**
    - Log in to your Pinata account.
    Navigate to the "API Keys" section (usually found in your account settings).
    - Create a new API key (if you don't have one already). Make sure it has the necessary permissions for pinning data.
    - Once the key is created, you should see your JWT. It will be a long string of characters.

3. **Create `.env` file:** In the project root.

4. **Set up .env:**  
    Copy the following line and paste it in the .env file.
    ```env
    PINATA_JWT="PINATA_JWT="your_actual_jwt_here"
    ```
    - Replace your_actual_jwt_here with your actual JWT key.

## 5. Setup Frontend

1.  **Create `public` Folder:**
    -   Create a directory named `public` in the project root to serve static files.
2.  **Create Front-End Files:**
    -   In the `public` folder, create `index.html`, `styles.css`, and `app.js` with the front-end code.

    **HTML code**
    ```html
    <!DOCTYPE html>
    <html lang="en">

    <head>
        <meta charset="UTF-8">
        <title>Air Quality Dashboard</title>
        <link rel="stylesheet" href="styles.css">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap" rel="stylesheet">
    </head>

    <body>

        <div class="molecule-container">
            <div class="molecule co2">CO₂</div>
            <div class="molecule no2">NO₂</div>
            <div class="molecule pm25">PM₂.₅</div>
            <div class="molecule pm10">PM₁₀</div>
            <div class="molecule co2" style="top: 60%; left: 80%; animation-delay: 2s;">CO₂</div>
            <div class="molecule no2" style="top: 15%; left: 80%; animation-delay: 4s;">NO₂</div>
            <div class="molecule pm25" style="top: 85%; left: 10%; animation-delay: 1s;">PM₂.₅</div>
            <div class="molecule pm10" style="top: 5%; left: 20%; animation-delay: 3s;">PM₁₀</div>
        </div>

        <div class="dashboard-container">
            <div class="dashboard-content">
                <h1>Air Quality Dashboard</h1>

                <div id="data-cards">
                    <div class="data-card">
                        <h2>CO₂</h2>
                        <p><span id="co2">Loading...</span> ppm</p>
                    </div>
                    <div class="data-card">
                        <h2>NO₂</h2>
                        <p><span id="no2">Loading...</span> µg/m³</p>
                    </div>
                    <div class="data-card">
                        <h2>PM₂.₅</h2>
                        <p><span id="pm25">Loading...</span> µg/m³</p>
                    </div>
                    <div class="data-card">
                        <h2>PM₁₀</h2>
                        <p><span id="pm10">Loading...</span> µg/m³</p>
                    </div>
                </div>

                <h2>Health Indicator</h2>
                <p id="healthy-indicator">Loading...</p>

                <div class="table-container">
                    <h2>Last 10 Readings</h2>
                    <table id="readings-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>CO₂</th>
                                <th>NO₂</th>
                                <th>PM₂.₅</th>
                                <th>PM₁₀</th>
                            </tr>
                        </thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>

        <script type="module" src="app.js"></script>
    </body>

    </html>
    ```
    **CSS code**
    ```css
    /* General Reset & Font */
    html,
    body {
        font-family: 'Poppins', sans-serif;
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #e0f7fa, #80deea);
        color: #333;
        height: 100%;
        overflow-x: hidden;
    }

    /* Scrollable Page Container */
    body {
        position: relative;
        min-height: 100vh;
    }

    /* Header */
    h1 {
        text-align: center;
        color: #004d40;
        margin-top: 40px;
        margin-bottom: 30px;
        font-weight: 600;
        text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
    }

    /* Dashboard Container */
    .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 40px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        position: relative;
        z-index: 1;
    }

    .dashboard-content {
        width: 100%;
        max-width: 960px;
    }

    /* Section Headings */
    .dashboard-container h2 {
        color: #00695c;
        font-weight: 500;
        margin: 40px 0 10px;
        font-size: 1.4em;
    }

    /* Health Indicator */
    #healthy-indicator {
        font-size: 1.2em;
        font-weight: 600;
        padding: 10px 20px;
        border-radius: 10px;
        background-color: rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(6px);
        color: #004d40;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    /* Data Card Grid */
    #data-cards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 25px;
        margin: 20px auto;
        padding: 0 20px;
    }

    /* Glass Card Style */
    .data-card {
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        border: 1px solid rgba(255, 255, 255, 0.35);
        padding: 25px;
        text-align: center;
        box-shadow: 0 8px 32px rgba(31, 38, 135, 0.15);
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .data-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 40px rgba(31, 38, 135, 0.2);
    }

    .data-card h2 {
        margin-top: 0;
        margin-bottom: 10px;
        color: #00695c;
        font-size: 1.3em;
        font-weight: 600;
    }

    .data-card p {
        font-size: 1.1em;
        margin-bottom: 0;
        color: #004d40;
        font-weight: 400;
    }

    .data-card span {
        font-size: 1.8em;
        font-weight: 600;
        display: block;
        margin-bottom: 5px;
        color: #00796b;
        transition: color 0.3s ease;
    }

    /* Table Container */
    .table-container {
        width: 100%;
        margin-top: 20px;
        border-radius: 15px;
        overflow-x: auto;
    }

    /* Table Style */
    #readings-table {
        width: 100%;
        border-collapse: collapse;
        background: rgba(255, 255, 255, 0.25);
        backdrop-filter: blur(8px);
        border-radius: 15px;
        overflow: hidden;
        font-size: 0.95em;
    }

    #readings-table thead {
        background-color: rgba(0, 77, 64, 0.2);
        color: #004d40;
        font-weight: 600;
    }

    #readings-table th,
    #readings-table td {
        padding: 12px 15px;
        text-align: center;
    }

    #readings-table tbody tr:nth-child(even) {
        background-color: rgba(255, 255, 255, 0.15);
    }

    /* Molecule Container */
    .molecule-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
        pointer-events: none;
        overflow: hidden;
    }

    /* Molecules Floating Animation */
    .molecule {
        position: absolute;
        border-radius: 50%;
        color: rgba(0, 77, 64, 0.5);
        font-weight: bold;
        font-size: 1.5em;
        width: 60px;
        height: 60px;
        display: flex;
        justify-content: center;
        align-items: center;
        opacity: 0.6;
        animation: float 15s infinite linear;
    }

    .molecule.co2 {
        top: 20%;
        left: 10%;
        animation-duration: 18s;
    }

    .molecule.no2 {
        top: 50%;
        left: 15%;
        animation-duration: 14s;
        font-size: 1.6em;
        width: 65px;
        height: 65px;
    }

    .molecule.pm25 {
        top: 60%;
        left: 30%;
        animation-duration: 20s;
        font-size: 1.2em;
        width: 50px;
        height: 50px;
    }

    .molecule.pm10 {
        top: 80%;
        left: 90%;
        animation-duration: 16s;
        font-size: 1.8em;
        width: 70px;
        height: 70px;
    }

    @keyframes float {
        0% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }

        25% {
            transform: translateY(-20px) translateX(15px) rotate(15deg);
        }

        50% {
            transform: translateY(10px) translateX(-10px) rotate(-5deg);
        }

        75% {
            transform: translateY(-15px) translateX(-15px) rotate(10deg);
        }

        100% {
            transform: translateY(0px) translateX(0px) rotate(0deg);
        }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
        #data-cards {
            grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
            gap: 15px;
        }

        h1 {
            font-size: 1.8em;
        }

        .data-card {
            padding: 20px;
        }

        .molecule {
            font-size: 1.2em;
            width: 50px;
            height: 50px;
        }
    }

    @media (max-width: 480px) {
        #data-cards {
            grid-template-columns: 1fr;
            gap: 15px;
        }

        .molecule {
            opacity: 0.3;
        }
    }
    ```
    **JS code**
    ```js
    async function fetchData() {
        try {
            // Fetch data from your backend API endpoint
            const response = await fetch('/api/data'); // Request to your Express server

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check if data or a message was received
            if (data.message) {
                console.log(data.message);
                document.getElementById("co2").textContent = 'N/A';
                document.getElementById("no2").textContent = 'N/A';
                document.getElementById("pm25").textContent = 'N/A';
                document.getElementById("pm10").textContent = 'N/A';
            } else if (data.co2 !== undefined) {
                document.getElementById("co2").textContent = data.co2;
                document.getElementById("no2").textContent = data.no2;
                document.getElementById("pm25").textContent = data.pm25;
                document.getElementById("pm10").textContent = data.pm10;

                const isHealthy = (
                    data.co2 >= 350 && data.co2 <= 450 &&
                    data.no2 >= 0 && data.no2 <= 50 &&
                    data.pm25 >= 0 && data.pm25 <= 12 &&
                    data.pm10 >= 0 && data.pm10 <= 20
                );

                document.getElementById("healthy-indicator").textContent = isHealthy ? 'Healthy' : 'Unhealthy';
            } else {
                console.warn("Received unexpected data format:", data);
                document.getElementById("healthy-indicator").textContent = 'Unknown';
            }

            // Fetch and display last 10 readings
            try {
                const last10Response = await fetch('/api/last10');
                if (!last10Response.ok) {
                    throw new Error(`HTTP error! status: ${last10Response.status}`);
                }

                const last10Data = await last10Response.json();
                const tableBody = document.getElementById('readings-table').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = ''; // Clear previous data

                if (last10Data && last10Data.length > 0) {
                    last10Data.forEach(reading => {
                        const row = tableBody.insertRow();
                        row.insertCell().textContent = reading.timestamp;
                        row.insertCell().textContent = reading.co2;
                        row.insertCell().textContent = reading.no2;
                        row.insertCell().textContent = reading.pm25;
                        row.insertCell().textContent = reading.pm10;
                    });
                } else {
                    const row = tableBody.insertRow();
                    const cell = row.insertCell();
                    cell.textContent = "No data available";
                    cell.colSpan = 5;
                    cell.style.textAlign = 'center';
                }
            } catch (err) {
                const tableBody = document.getElementById('readings-table').getElementsByTagName('tbody')[0];
                tableBody.innerHTML = '';
                const row = tableBody.insertRow();
                const cell = row.insertCell();
                cell.textContent = "Error fetching data";
                cell.colSpan = 5;
                cell.style.textAlign = 'center';
                console.error("Error fetching last 10 readings:", err);
            }
        } catch (error) {
            console.error("Error in fetchData:", error);
        }
    }

    // Fetch data immediately and then every 5 seconds
    fetchData();
    setInterval(fetchData, 5000);
    ```
3.  **Run the Parcel:**
    -   In the new terminal you can run Parcel to bundle your front-end code before starting the Express server by the following command:
        ```bash
        npm run dev
        ```
4.  **Run the Web Server:**
    -   In the new terminal you can start the `server` by the following command:
        ```bash
        npm run start
        ```
    - To find this address for you instance, run the Live server and replace the port number 5500 (default) to 3000 in the web address.  

## 6. Conclusion

This guide provides a comprehensive approach to simulating a decentralized air quality monitoring system in Project IDX.