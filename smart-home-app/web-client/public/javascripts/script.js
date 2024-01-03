let lightIsOn = false;

async function toggleLight() {
    const response = await fetch(`/toggle?status=${!lightIsOn}`);
    const data = await response.json();
    lightIsOn = data.result;
    document.getElementById('LightStatus').innerText = data.message;
}



