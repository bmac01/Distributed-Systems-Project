var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

var server = new grpc.Server();
let lightStatus = false; // needs to be updated so that it is random ?? - leave as false for now

server.addService(smarthomecontrolPackage.LightService.service, {
    ToggleLight: (call, callback) => {
        lightStatus = call.request.status;
        callback(null, {
            result: lightStatus,
            message: `Lights are now ${lightStatus ? 'ON' : 'OFF'}`
        });
    }
});

server.addService(smarthomecontrolPackage.SecurityService.service, {
    ActivateZones: (call, callback) => {
        call.on('data', (zoneActivationRequest) => {
            console.log(`Zone ${zoneActivationRequest.zone_id} activation status: ${zoneActivationRequest.activate}`);
            // Process zone activation
        });

        call.on('end', () => {
            callback(null, { message: "Zones activation updated" });
        });
    },
    
});

server.addService(smarthomecontrolPackage.AlertService.service, {
    GetAlerts: (call) => {
        var alerts = ["Intruder detected", "Window opened", "Motion detected", "Door unlocked"];
        let count = 0;
        var maxAlerts = 3; // Set the maximum number of alerts

        var intervalId = setInterval(() => {
            if (count >= maxAlerts) {
                clearInterval(intervalId); // Stop the interval
                call.end(); // End the call
                return; // Exit the function to prevent further execution
            }

            var alertIndex = Math.floor(Math.random() * alerts.length);
            call.write({
                message: alerts[alertIndex],
                timestamp: new Date().toISOString()
            });

            count++; // Increment the count
        }, 500); // Sending a random alert every .5 seconds
    }
});

server.addService(smarthomecontrolPackage.ThermostatService.service, {
    SetTemperature: (call, callback) => {
        var temperature = call.request.temperature;
        // Logic to set the temperature
        callback(null, { message: `Temperature set to ${temperature}°C` });
    },
   
});

server.addService(smarthomecontrolPackage.BrightnessService.service, {
    AdjustBrightness: (call, callback) => {
        call.on('data', (request) => {
            console.log(`Zone ${request.zone_id} brightness: ${request.brightness}`);
            // Logic to adjust the brightness
        });

        call.on('end', () => {
            callback(null, { message: "Brightness adjusted" });
        });
    },
    
});

// Function to generate a random temperature
function getRandomTemperature() {
    return Math.random() * (25-18) + 18; // Random temperature between 18°C and 25°C
  }
  
  // Add the TemperatureService implementation
  server.addService(smarthomecontrolPackage.TemperatureService.service, {
    GetCurrentTemperature: (_, callback) => {
      callback(null, { temperature: getRandomTemperature() });
}});



server.bindAsync('0.0.0.0:4000', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    server.start();
    console.log(`gRPC server running on port ${port}`);
});