
module.exports = class ServerHelper{

    static disconnectOldUser(socket, io){

        console.log("current socket: " + socket.id);
        for(var id in io.of("/").connected){
            var s = io.of("/").connected[id];
            if(s.client.user === undefined){
                s.disconnect();
                continue;
            }
            if(s.client.user.access_token === socket.client.user.access_token && s.id !== socket.id){
                s.disconnect();
            }
        }
    }
}
