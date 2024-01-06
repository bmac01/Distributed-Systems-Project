//import gRPC and proto loader modules
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

//Load gRPC Service Definitions
var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

//Create gRPC Server Instance and Initialize Light Status:
var server = new grpc.Server();
let lightStatus = false; // needs to be updated so that it is random ?? - leave as false for now, update later

//Add light service to gRPC Server:
server.addService(smarthomecontrolPackage.LightService.service, {
    ToggleLight: (call, callback) => {
        lightStatus = call.request.status;
        callback(null, {
            result: lightStatus,
            message: `Lights are now ${lightStatus ? 'ON' : 'OFF'}`
        });
    }
});

//Add Security Service to gRPC Server:
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

//Add Alert Service to gRPC Server:
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

//Add Thermostat Service to gRPC Server
server.addService(smarthomecontrolPackage.ThermostatService.service, {
    SetTemperature: (call, callback) => {
        var temperature = call.request.temperature;
        // Logic to set the temperature
        callback(null, { message: `Temperature set to ${temperature}°C` });
    },
   
});

//Add Brightness Service to gRPC Server:
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
  
//Add Temperature Service to gRPC Server:
server.addService(smarthomecontrolPackage.TemperatureService.service, {
    GetCurrentTemperature: (_, callback) => {
      callback(null, { temperature: getRandomTemperature() });
}});

//Add System Status Service to gRPC Server:
server.addService(smarthomecontrolPackage.SystemStatusService.service, {
    CheckStatus: (call) => {
      call.on('data', (request) => {
        console.log(`Received check command: ${request.checkCommand}`);
        // Implement your logic to check system status
        // For example, respond with a status message
        let statusMessage = `Status checked for command: ${request.checkCommand}`;
        call.write({ statusMessage: statusMessage });
      });
  
      call.on('end', () => {
        call.end();
      });
    }
  });

//Start the gRPC Server
server.bindAsync('0.0.0.0:4000', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    server.start();
    console.log(`gRPC server running on port ${port}`);
});