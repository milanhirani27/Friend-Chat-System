const Chat = require('../models/chat');
const onlineUser = require('../models/onlineUser')
const formatMessage = require('../utils/messages');
const User = require('../models/user')

module.exports= function(io) {
	io.on('connection', (socket) =>{
		
		socket.on('friendRequest', (friend, callback)=> {
			io.to(friend.receiver).emit('newFriendRequest', {
				from: friend.sender,
				to: friend.receiver
			});
			callback();
		});


        //friend list
        socket.on('friendList', async (data)=> {
            var friendList  = await User.findOne({username: data})
            console.log('friendlist', friendList);
            socket.emit('newFriendList',friendList.friendsList)
        })


        console.log('New User Logged In with ID '+socket.id);
        
        socket.on('chatMessage', (data) =>{ 
            var dataElement = formatMessage(data);
            if(dataElement){
                Chat.insertOne(dataElement, (err,res) => { 
                    if(err) throw err;
                    socket.emit('message',dataElement); 
                });
            }
            onlineUser.findOne({"name":data.toUser}, (err,res) => { 
                if(err) throw err;
                if(res!=null) 
                socket.emit('message',dataElement);
            });
        });

        socket.on('userDetails',(data) => { 
                    var onlineuser = { 
                        "ID":socket.id,
                        "name":data.fromUser
                    };
                   
                    onlineUser.insertOne(onlineuser,(err,res) =>{ 
                        if(err) throw err;
                        console.log(onlineuser.name + " is online...");
                    });
                    Chat.find({ 
                        "from" : { "$in": [data.fromUser, data.toUser] },
                        "to" : { "$in": [data.fromUser, data.toUser] }
                    },{projection: {_id:0}}).toArray((err,res) => {
                        if(err)
                            throw err;
                        else {
                            socket.emit('output',res); 
                        }
                    });
               

        });  

        var userID = socket.id;
        socket.on('disconnect', () => {
                var myquery = {"ID":userID};
                onlineUser.deleteOne(myquery, function(err, res) { 
                if (err) throw err;
                console.log("User " + userID + "went offline...");
            });
        }); 
	});
}