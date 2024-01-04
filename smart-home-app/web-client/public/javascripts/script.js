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

