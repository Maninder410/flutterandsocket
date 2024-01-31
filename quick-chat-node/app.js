var express = require('express');
var app = require('express')();
const path = require('path')
var server = require('http').Server(app);
var io = require('socket.io')(server);
const cors = require('cors');

var allUsers = [];
const corsOptions = {
    origin: '*', 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,  
};

app.use(cors(corsOptions));



app.get("/",(req,res)=>{
    res.send("<h1> Server is working <h1/>");
})
app.use(express.static(path.join(__dirname,'web')));

function emitUsers() {
    io.emit('users',allUsers);    
    console.log('users',allUsers);
}
function removeUser(user) {
    allUsers= allUsers.filter(function(ele){ 
        return ele != user; 
    });   
}

//socket listeners
io.on('connection', function (socket) {
    var userName = socket.request._query.userName;
    allUsers.push(userName);
    emitUsers();
    var msg = ` ${userName} has joined! `;
    console.log(msg)

    //broadcast when a user connects
    io.emit('message', {
        "message": msg
    }
    );
    socket.on('disconnect', () => {       
      
        var disMsg = `${userName} has disconnected!`;
        console.log(disMsg);
        io.emit('message', {
            "message": disMsg,
        });
        removeUser(userName);
        emitUsers()
    });

    socket.on('message', (data) => {
        console.log(`👤 ${data.userName} : ${data.message}`)
        io.emit('message', data);
    });



});



const PORT = 8080;

server.listen(PORT,'0.0.0.0',()=>{
    console.log(`Server up and running at http://localhost:${PORT}`);
});