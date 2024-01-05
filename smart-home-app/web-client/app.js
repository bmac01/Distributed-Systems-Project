var express = require('express');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.json()); // for parsing application/json

// Load the proto file
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
var client = new smarthomecontrolPackage.ThermostatService('localhost:4000', grpc.credentials.createInsecure());

// Route to render the home page
app.get('/', (req, res) => {
    res.render('index', { lightStatus: false });
});

// Route to toggle light
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

// Route to fetch alerts
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

// Route to activate zones
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


app.post('/set-temperature', (req, res) => {
    var { temperature } = req.body;
    
    client.SetTemperature({ temperature }, (error, response) => {
        if (!error) {
            res.json(response);
        } else {
            res.status(500).send('Error setting temperature');
        }
    });
});


module.exports = app; // Export the app instance for use in www