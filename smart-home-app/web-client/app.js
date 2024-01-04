var express = require('express');
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var app = express();
app.set('view engine', 'ejs');
app.use(express.static('public'));

// Load the proto file
var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

// Initialize gRPC client for LightService
var lightClient = new smarthomecontrolPackage.LightService('localhost:4000', grpc.credentials.createInsecure());

// Initialize gRPC client for AlertService
var alertStatusClient = new smarthomecontrolPackage.AlertService('localhost:4000', grpc.credentials.createInsecure());

// Route to render the home page
app.get('/', (req, res) => {
    res.render('index', { lightStatus: false });
});

// Route to toggle light
app.get('/toggle', (req, res) => {
    const lightStatus = req.query.status === 'true';
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

module.exports = app; // Export the app instance for use in www