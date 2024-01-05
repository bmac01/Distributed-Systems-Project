let lightIsOn = false;

async function toggleLight() {
    const response = await fetch(`/toggle?status=${!lightIsOn}`);
    const data = await response.json();
    lightIsOn = data.result;
    document.getElementById('LightStatus').innerText = data.message;
}

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

setInterval(fetchAlerts, 3000); // Poll every 3 seconds

async function toggleSecuritySystem() {
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



