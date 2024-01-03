var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

var packageDef = protoLoader.loadSync('smarthome.proto', {});
var grpcObject = grpc.loadPackageDefinition(packageDef);
var smarthomecontrolPackage = grpcObject.smarthomecontrol;

var server = new grpc.Server();
let lightStatus = false; // needs to be updated so that it is random?? 

//Light Service 
//<<----->> light toggle 
server.addService(smarthomecontrolPackage.LightService.service, {
    ToggleLight: (call, callback) => {
        lightStatus = call.request.status;
        callback(null, {
            result: lightStatus,
            message: `Light is now ${lightStatus ? 'ON' : 'OFF'}`
        });
    }
});
// <<----->> light toggle

// Addtional Services to be added


server.bindAsync('0.0.0.0:4000', grpc.ServerCredentials.createInsecure(), (error, port) => {
    if (error) {
        console.error(error);
        return;
    }
    server.start();
    console.log(`gRPC server running on port ${port}`);
});