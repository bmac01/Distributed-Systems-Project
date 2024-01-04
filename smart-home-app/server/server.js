var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

var server = new grpc.Server();
let lightStatus = false; // needs to be updated so that it is random?? 

server.addService(smarthomecontrolPackage.LightService.service, {
    ToggleLight: (call, callback) => {
        lightStatus = call.request.status;
        callback(null, {
            result: lightStatus,
            message: `Light is now ${lightStatus ? 'ON' : 'OFF'}`
        });
    }
});

server.addService(smarthomecontrolPackage.AlertService.service, {
    GetAlerts: (call) => {
        const alerts = ["Intruder detected", "Window opened", "Motion detected", "Door unlocked"];
        let count = 0;
        const maxAlerts = 3; // Set the maximum number of alerts

        const intervalId = setInterval(() => {
            if (count >= maxAlerts) {
                clearInterval(intervalId); // Stop the interval
                call.end(); // End the call
                return; // Exit the function to prevent further execution
            }

            const alertIndex = Math.floor(Math.random() * alerts.length);
            call.write({
                message: alerts[alertIndex],
                timestamp: new Date().toISOString()
            });

            count++; // Increment the count
        }, 500); // Sending a random alert every .5 second
    }
});

server.bindAsync('0.0.0.0:4000', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    server.start();
    console.log(`gRPC server running on port ${port}`);
});