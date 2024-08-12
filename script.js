// Add event listener to the button with id 'Calculate'
document.getElementById('Calculate').addEventListener('click', () => {
    // Get the value from the input field with id 'id_city'
    const city = document.getElementById('id_city').value;

    // Construct the API URL using the city value
    const apiUrl = `https://geocode.maps.co/search?q=` + city + `&api_key=66ab2f5467c2a205090311boq099d4a`;

    // Fetch data from the API
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            // Assuming the API returns an array of results
            if (data.length > 0) {
                const location = data[0]; // Get the first result
                const latitude = location.lat;
                const longitude = location.lon;

                // Display the result
                document.getElementById('Ans').innerHTML = `Latitude: ${latitude}<br> Longitude: ${longitude}<br>`;

                // Calculate Local Solar Time (LST)
                const now = new Date();
                const utcHours = now.getUTCHours();
                const utcMinutes = now.getUTCMinutes();
                const longitudeOffset = longitude / 15; // Longitude correction for hours
                const localSolarTime = utcHours + (utcMinutes / 60) + longitudeOffset;

                // Normalize Local Solar Time to 24-hour format
                const lstHours = Math.floor(localSolarTime);
                const lstMinutes = Math.round((localSolarTime - lstHours) * 60);
                const formattedLST = `${lstHours.toString().padStart(2, '0')}:${lstMinutes.toString().padStart(2, '0')}`;

                // Calculate Solar Declination
                const dayOfYear = Math.floor((now - new Date(now.getFullYear(), 0, 0)) / 86400000);
                const declination = 23.44 * Math.sin(((360 / 365) * (dayOfYear - 81)) * (Math.PI / 180));

                const hourAngleValue = hourAngle(latitude,declination);

                const dayLengthValue = dayLength(latitude,dayOfYear);

                const elevationAngle = solarElevationAngle(latitude,declination,hourAngleValue);

                // Display Local Solar Time and Declination
                document.getElementById('Ans').innerHTML += `Local Solar Time: ${formattedLST}<br>Solar Declination: ${declination.toFixed(2)}°<br>Hour Angle: ${hourAngleValue.toFixed(3)}°<br>Day Length: ${dayLengthValue.toFixed(4)}H<br>Elevation Angle: ${elevationAngle.toFixed(4)}°`;
            } else {
                document.getElementById('Ans').innerHTML = 'No results found.';
            }
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            document.getElementById('Ans').innerHTML = 'Error fetching data.';
        });
});

function hourAngle(latitude, declination) {
    const latRad = latitude * (Math.PI / 180); // Convert latitude to radians
    const decRad = declination * (Math.PI / 180); // Convert declination to radians
    return Math.acos(-Math.tan(latRad) * Math.tan(decRad));
}

function solarDeclination(dayOfYear) {
    const axialTilt = 23.44; // Earth's axial tilt in degrees
    return axialTilt * Math.sin((2 * Math.PI / 365) * (dayOfYear - 81));
}


function dayLength(latitude, dayOfYear) {
    const declination = solarDeclination(dayOfYear);
    const H = hourAngle(latitude, declination);
    const dayLengthHours = (2 * H * 180 / Math.PI) / 15; // Convert radians to hours
    return dayLengthHours;
}

function getDayOfYear(date) {
    const start = new Date(date.getFullYear(), 0, 0); // Start of the year
    const diff = date - start; // Difference in milliseconds
    const oneDay = 1000 * 60 * 60 * 24; // Milliseconds in one day
    const dayOfYear = Math.floor(diff / oneDay); // Calculate day of the year
    return dayOfYear;
}

function solarElevationAngle(latitude, solarDeclination, hourAngle) {
    const latRad = latitude * (Math.PI / 180);
    const declRad = solarDeclination * (Math.PI / 180);
    const haRad = hourAngle * (Math.PI / 180);
    return Math.asin(Math.sin(latRad) * Math.sin(declRad) + Math.cos(latRad) * Math.cos(declRad) * Math.cos(haRad)) * (180 / Math.PI);
}