# Decentralized Air Quality Monitoring System

## Project Description

This project simulates a decentralized air quality monitoring system. It showcases how IoT sensor data can be stored on a blockchain using a Solidity smart contract and visualized on a dynamic web dashboard. The system simulates air quality readings, including CO2, NO2, PM2.5, and PM10 levels, and stores them securely on a local Ethereum blockchain created with Ganache. The data is then retrieved and displayed in real-time on a user-friendly web dashboard. This project also sends data to the IPFS using Pinata.

## Features

-   **Smart Contract:** A Solidity smart contract (`AirQualityData.sol`) securely stores sensor readings on a local Ethereum blockchain.
-   **Data Simulation:** `simulateData.js` simulates IoT sensor readings and submits them to the smart contract.
-   **Backend API:** An Express.js server provides API endpoints (`/api/data`, `/api/last10`) to retrieve air quality data.
-   **Dynamic Web Dashboard:** A frontend built with HTML, CSS, and JavaScript dynamically displays the latest air quality data and the last 10 readings.
-   **Real-Time Updates:** The dashboard automatically updates with new sensor data every 5 seconds.
-   **Health Indicator:** Displays a health indicator based on the current air quality readings.
-   **IPFS Storage:** `simulateData.js` pins simulated sensor data to IPFS using Pinata, providing decentralized and immutable data storage.
-   **Decentralized Data Storage:** Sensor readings are stored in a smart contract on the blockchain, ensuring transparency and immutability.
-   **Responsive Design:** The web dashboard adapts to different screen sizes, providing a seamless user experience.
-   **Local Blockchain:** Utilizes Ganache for a local Ethereum blockchain, simplifying development and testing.

## Technologies Used

-   **Solidity:** For writing the smart contract.
-   **Truffle:** For smart contract development, compilation, and deployment.
-   **Ganache:** For setting up a local Ethereum blockchain.
-   **Node.js:** For the backend server and data simulation.
-   **Express.js:** For creating the backend API.
-   **Web3.js:** For interacting with the Ethereum blockchain.
-   **HTML, CSS, JavaScript:** For building the frontend web dashboard.
-   **Parcel:** For bundling the frontend code.
-   **Pinata:** For sending data to IPFS.
-   **IPFS:** For decentralized data storage.
-   **axios:** For making HTTP requests.

## Environment Setup

### Prerequisites

-   **Node.js:** Make sure Node.js and npm (Node Package Manager) are installed on your system.
-   **Project IDX:** Set up a project on Project IDX. ***(Run every command in a new terminal)***

### Installation

1.  **Clone the Repository:**  
    At `https://idx.google.com/`, on the bottom bar there is an option for "Import Rep". Click on that option and enter the repository URL, and give your workspace a name (you can give any name of your choice).

2.  **Install Global Packages:**
```bash
    npm install -g truffle ganache 
```
3.  **Install Project Dependencies:**
```bash
    npm install 
```
4.  **Create `.env` File:**
    - Create a `.env` file in the project root.
    - Add your Pinata JWT.
```env
    PINATA_JWT="your_pinata_jwt"     
```
## Smart Contract

### `AirQualityData.sol`

-   **Location:** `contracts/AirQualityData.sol`
-   **Description:** This Solidity smart contract defines the structure for storing air quality sensor data. It includes:
    -   A `Reading` struct to store timestamp, CO2, NO2, PM2.5, and PM10 levels.
    -   An array `readings` to hold all the sensor readings.
    -   An `owner` address to control data submission.
    -   The `addReading` function, restricted to the contract owner, to add new readings.
    -   The `getReadingCount` function to retrieve the total number of readings.
    -   The `getReading` function to retrieve a specific reading by its index.
    - An `event` named `NewReading` that emits the new sensor reading added to the array.

### Deployment

1.  **Compile:**
```bash
    truffle compile 
```

3.  **Start Ganache:**
```bash
    ganache 
```
4.  **Deploy:**
```bash
    npm run migrate 
```
- After every run a new network id will get added to `AirQualityData.json` present at `/home/user/test/build/contracts/AirQualityData.json`, which cannot be used later, so you can delete it time to time to keep the file clean.

## Data Simulation

### `simulateData.js`

-   **Location:** `simulateData.js`
-   **Description:** This script simulates IoT sensor data and submits it to the deployed smart contract. It performs the following actions:
    -   Generates random values for CO2, NO2, PM2.5, and PM10 levels within realistic ranges.
    -   Connects to the Ganache blockchain using Web3.js.
    -   Retrieves the owner address from Ganache accounts.
    -   Calls the `addReading` function on the smart contract with the simulated data.
    -   Sends the sensor data to Pinata using their API.
    -   Runs the simulation every 10 seconds using `setInterval`.
- Replace `<YOUR_NETWORK_ID>` with the correct network ID in both simulationData.js and retrieveData.js. You will find this in the terminal where you ran the command `npm run migrate`. 
-   **How to Run:**
```bash
    node simulateData.js 
```

### `retrieveData.js`

-   **Location:** `retrieveData.js`
-   **Description:** This script connects to the Ganache blockchain, reads the deployed contract, and retrieves all the stored air quality readings. It then logs each reading to the console, including timestamp, CO2, NO2, PM2.5, and PM10 levels.
- Replace `<YOUR_NETWORK_ID>` with the correct network ID in both simulationData.js and retrieveData.js. You will find this in the terminal where you ran the command `npm run migrate`. 
-   **How to Run:**
```bash
    node retrieveData.js 
```

## Backend Setup

### `server.js`

-   **Location:** `server.js`
-   **Description:** This file sets up an Express.js server that:
    -   Connects to the Ganache blockchain using Web3.js.
    -   Reads the compiled smart contract JSON dynamically.
    -   Provides API endpoints:
        -   `/api/data`: Returns the latest sensor reading.
        -   `/api/last10`: Returns the last 10 sensor readings.
    -   Serves static files from the `public/dist` directory (Parcel output).
    -   Handles single-page application (SPA) routing by serving `public/dist/index.html` for all other GET requests.

## Web Dashboard

### Frontend Files

-   **`public/index.html`:** The main HTML file for the dashboard.
    -   Displays data cards for CO2, NO2, PM2.5, and PM10 levels.
    -   Shows a health indicator based on current readings.
    -   Includes a table of the last 10 readings.
-   **`public/styles.css`:** CSS file for styling the dashboard.
    -   Uses a glassmorphism design with floating molecule animations.
    -   Includes responsive design for different screen sizes.
-   **`public/app.js`:** JavaScript file for fetching and displaying data.
    -   Fetches data from the `/api/data` and `/api/last10` endpoints.
    -   Updates the HTML elements with the latest data.
    -   Calculates and displays the health indicator.
    - Updates the dashboard every 5 seconds.

### Running Parcel and the Web Server

1.  **Run Parcel:**
    -   In the new terminal you can run Parcel to bundle your front-end code before starting the Express server by the following command:
```bash
    npm run dev
```
2.  **Run the Web Server:**
    -   In the new terminal you can start the `server` by the following command:
```bash
    npm run start
```
- On the left bar of Project IDX you will find "Firebase studio" (hold ctrl and press ' twice). On the bottom you will find "Backend ports" section, expand the section now there will a action button beside every port. You have to click on the "open in the new tab" button beside 3000 port, then a dialog box will pop up select "open" option from it, and the dashboard will open.

## Contribution

Contributions are welcome! If you have any suggestions or want to contribute to the project, please:

1.  Fork the repository.
2.  Create a new branch for your feature or fix.
3.  Make your changes and commit them.
4.  Submit a pull request.