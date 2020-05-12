const UserManagermentComponent =  require('../components/userManagerComponent')

module.exports = class ServerHelper{

    static disconnectOldUser(socket, io){
        var userManagerment = new UserManagermentComponent()
        console.log("current socket: " + socket.id);
        io.of("/").adapter.clients((err, clients)=>{
            clients.forEach(function(clientId){
                userManagerment.isExistUser(clientId, {
                    done: (result) => {
                        userManagerment.getUser(clientId,{
                            done:(user) =>{
                                user = JSON.parse(user);
                              //  console.log(user);
                               if(user.access_token === socket.client.user.access_token && clientId !== socket.id){
                                   io.of("/").adapter.remoteDisconnect(clientId, true);
                               }
                            }
                        })
                    }
                })

            })
        })
     //    for(var id in io.of("/").connected){
     //      // console.log("dxx"+id);
     //        var s = io.of("/").connected[id];
     //        if(s.client.user === undefined){
     //            s.disconnect();
     //            continue;
     //        }
     //        if(s.client.user.access_token === socket.client.user.access_token && s.id !== socket.id){
     //            s.disconnect();
     //        }
     //    }
    }
}
