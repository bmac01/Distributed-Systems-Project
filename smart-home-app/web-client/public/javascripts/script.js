//keep track o light status
let lightIsOn = false;

//Function to toggle light status 
async function toggleLight() {
    const response = await fetch(`/toggle?status=${!lightIsOn}`);
    const data = await response.json();
    lightIsOn = data.result;
    document.getElementById('LightStatus').innerText = data.message;
}

// Function to fetch and display alerts
async function fetchAlerts() {
    try {
        const response = await fetch('/alerts');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const alerts = await response.json();
        const ul = document.getElementById('recentActivity');
        ul.innerHTML = ''; // Clear existing alerts
        alerts.forEach(alert => {
            const li = document.createElement('li');
            li.textContent = `${alert.message} at ${alert.timestamp}`;
            ul.appendChild(li);
        });
    } catch (error) {
        console.error('Error fetching alerts:', error);
    }
}

// alerts every 3 seconds
setInterval(fetchAlerts, 3000); 


// Function to toggle security system state
async function toggleSecuritySystem() {
    // Gather state of each zone from the Web GUI
    const zones = [
        { zone_id: 1, activate: document.getElementById('zone1').checked },
        { zone_id: 2, activate: document.getElementById('zone2').checked },
        { zone_id: 3, activate: document.getElementById('zone3').checked }
    ];

    try {
        const response = await fetch('/activate-zones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zones }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        document.getElementById('securityStatus').innerText = `Current Status: ${data.message}. Active Zones: ${data.activeZones}. Inactive Zones: ${data.inactiveZones}.`;
    } catch (error) {
        console.error('Error activating zones:', error);
        document.getElementById('securityStatus').innerText = `Error: ${error.message}`;
    }
}

// Function to set the temperature
async function setTemperature() {
    var temperature = document.getElementById('temperature').value;
    try {
        var response = await fetch('/set-temperature', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ temperature: parseFloat(temperature) }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        var data = await response.json();
        document.getElementById('temperatureStatus').innerText = data.message;
    } catch (error) {
        console.error('Error setting temperature:', error);
        document.getElementById('temperatureStatus').innerText = `Error: ${error.message}`;
    }
}

// Function to adjust brightness
async function adjustBrightness(zoneId, brightness) {
    try {
        var response = await fetch('/adjust-brightness', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ zone_id: zoneId, brightness: parseInt(brightness) }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        var data = await response.json();
        document.getElementById(`brightnessLevel${zoneId}`).innerText = `Brightness: ${brightness}`;

        // Update and show the status message
        var statusElement = document.getElementById('brightnessStatus');
        statusElement.innerText = data.message;
        statusElement.style.display = 'block'; // Make it visible
    } catch (error) {
        var statusElement = document.getElementById('brightnessStatus');
        statusElement.innerText = `Error: ${error.message}`;
        statusElement.style.display = 'block'; // Make it visible
    }
}

//  Event listener setup for DOMContentLoaded event for the brightness sliders
document.addEventListener('DOMContentLoaded', (event) => {
    var slider1 = document.getElementById('brightnessSlider1');
    var slider2 = document.getElementById('brightnessSlider2');

 // Add change event listeners to brightness sliders   
    slider1.addEventListener('change', () => adjustBrightness(1, slider1.value));
    slider2.addEventListener('change', () => adjustBrightness(2, slider2.value));
});

document.addEventListener('DOMContentLoaded', () => {
    // Set up other event listeners...
});

// Function to fetch current temperature
async function fetchCurrentTemperature() {
    try {
      const response = await fetch('/current-temperature');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      document.getElementById('currentTemp').innerText = data.temperature.toFixed(0);
    } catch (error) {
      console.error('Error fetching current temperature:', error);
    }
  }
  
  // Fetch the temperature immediately when the page loads
  fetchCurrentTemperature();
  
  // Then update the temperature every 5 seconds
setInterval(fetchCurrentTemperature, 5000);
  
