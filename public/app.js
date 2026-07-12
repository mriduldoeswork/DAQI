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