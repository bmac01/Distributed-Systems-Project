// Importing required modules
var express = require('express');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

// Initializing Express app
var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json

// Load the gPRC package
var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

// Initialize gRPC for LightService
var lightClient = new smarthomecontrolPackage.LightService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC for AlertService
var alertStatusClient = new smarthomecontrolPackage.AlertService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC for SecurityService
var securityClient = new smarthomecontrolPackage.SecurityService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC for ThermostatService
var thermostatClient = new smarthomecontrolPackage.ThermostatService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC for BrightnessService
var brightnessclient = new smarthomecontrolPackage.BrightnessService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC for TemperatureService
var temperatureClient = new smarthomecontrolPackage.TemperatureService('localhost:4000', grpc.credentials.createInsecure());

//Initialize gRPC for SystemStatus
var client = new smarthomecontrolPackage.SystemStatusService('localhost:4000', grpc.credentials.createInsecure());

// Route to render the home page
app.get('/', (req, res) => {
    res.render('index', { lightStatus: false });
});

// Route to toggle light status
app.get('/toggle', (req, res) => {
    var lightStatus = req.query.status === 'true';
    lightClient.ToggleLight({ status: lightStatus }, (error, response) => {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).json({ message: "Error toggling light" });
        }
    });
});

// Route to fetch security alerts
app.get('/alerts', (req, res) => {
    var call = alertStatusClient.GetAlerts({});
    let alerts = [];

    call.on('data', (alert) => {
        alerts.push(alert);
    });

    call.on('end', () => {
        // Stream ended by the server
        res.json(alerts); // Send the collected alerts to the client
    });

    call.on('error', (error) => {
        console.error('Error on GetAlerts stream:', error);
        if (!res.headersSent) {
            res.status(500).json({ message: "Error fetching alerts" });
        }
    });
});

// Route to activate security zones
// Assume a default state for each zone
let zonesState = {
    1: false, // Zone 1
    2: false, // Zone 2
    3: false  // Zone 3
};

app.post('/activate-zones', (req, res) => {
    const zones = req.body.zones;

    zones.forEach(zone => {
        // Update the state of each zone
        zonesState[zone.zone_id] = zone.activate;
    });

    // response indicating which zones are active and which are not
    let activeZones = [];
    let inactiveZones = [];
    for (const [zoneId, isActive] of Object.entries(zonesState)) {
        if (isActive) {
            activeZones.push(zoneId);
        } else {
            inactiveZones.push(zoneId);
        }
    }

    res.json({ 
        message: "Zones updated",
        activeZones: activeZones.join(', '),
        inactiveZones: inactiveZones.join(', ')
    });
});

//Route to set thermostat temperature
app.post('/set-temperature', (req, res) => {
    var { temperature } = req.body;
    
        thermostatClient.SetTemperature({ temperature }, (error, response) => {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).send('Error setting temperature');
        }
    });
});

//Route to adjust brightness
app.post('/adjust-brightness', (req, res) => {
    const { zone_id, brightness } = req.body;
    
    
    let call = brightnessclient.AdjustBrightness((error, response) => {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).send('Error adjusting brightness');
        }
    });

    call.write({ zone_id, brightness });
    call.end();
});

//Route to get current temperature
app.get('/current-temperature', (req, res) => {
  temperatureClient.GetCurrentTemperature({}, (error, response) => {
    if (!error) {
      res.json({ temperature: response.temperature });
    } else {
      res.status(500).json({ message: "Error fetching current temperature" });
    }
  });
});


// Creating and handling System Status check stream
const statusCheckCall = client.checkStatus();

statusCheckCall.on('data', (response) => {
  console.log('Received from server:', response.statusMessage);
});

statusCheckCall.on('end', () => {
  console.log('Server has completed sending messages');
});

// Send a check command
statusCheckCall.write({ checkCommand: "initial check" });

// Send another check command after 5 seconds
setTimeout(() => {
  statusCheckCall.write({ checkCommand: "follow-up check" });
}, 5000);

// End the call after 10 seconds
setTimeout(() => {
  statusCheckCall.end();
}, 10000);


module.exports = app; // Export the app instance for use in www