// to run:
// make sure node.js is installed in your terminal
// then just run "node index.js"
// might need to install any non-native modules also?

const sqlite3 = require('sqlite3').verbose();
const http = require('http');
const express = require('express');
const sio = require('socket.io');
const path = require('path');

// import classes
const User = require('./static/User');
const PostCard = require('./static/PostCard');

var app = express();
var server = http.Server(app);
var io = sio(server);

let htmlDirectory = path.resolve(__dirname+'/static');
app.use(express.static(htmlDirectory));
server.listen(4124);

// globals for whether a user is logged in, which user, which profile needs to be displayed
var loggedIn = false;
var currentUser = -1;
var profileToSend = -1;

app.get('/postCard', (req, res)=> {
    res.sendFile(path.join(__dirname, "./static/postCard.js"));
});

app.get('/style.css', (req, res) => {
  res.sendFile(path.join(__dirname, './static/style.css')); // Serve your CSS file
});

// need to test the conditionals for these three gets
app.get('/', (req, res) => {
  if(loggedIn){
    let filePath = path.join(__dirname, "./static/index.html");
    res.sendFile(filePath);
  }
  else{
    let filePath = path.join(__dirname, "./static/Onboarding.html");
    res.sendFile(filePath);
  }
});

app.get('/login', (req, res) => {
  if(loggedIn){
    const filePath = path.join(__dirname, "./static/index.html");
    res.sendFile(filePath);
  }
  else{
    const filePath = path.join(__dirname, "./static/Onboarding.html");
    res.sendFile(filePath);
  }
});

app.get('/home', (req, res) => {
  if(loggedIn){
    const filePath = path.join(__dirname, "./static/index.html");
    res.sendFile(filePath);
  }
  else{
    const filePath = path.join(__dirname, "./static/Onboarding.html");
    res.sendFile(filePath);
  }
});

app.get('/profile', (req, res)=>{
    if(!loggedIn){
        const filePath = path.join(__dirname, "./static/Onboarding.html");
        res.sendFile(filePath);
    }
    else{
        const filePath = path.join(__dirname, "./static/profile.html");
        res.sendFile(filePath);
    }
});

app.get('/friends', (req, res)=>{
    if(!loggedIn){
        const filePath = path.join(__dirname, "./static/Onboarding.html");
        res.sendFile(filePath);
    }
    else{
        const filePath = path.join(__dirname, "./static/search.html");
        res.sendFile(filePath);
    }
});

/* functions/functionalities to write */
/* these could be functions or could just be implemented in the socket handlers! */

// search by username -- maybe start with exact matches? TRIP

// like a post

// comment on a post

// share a post

// create a post

// create a user TRIP

// check user credentials

/* LOADING FROM DATABASE */
let db = new sqlite3.Database('storage.db');

var Users = new Array();
// load users from database into array
let loadUsers = function() {
    db.each(`SELECT username username, password password, userID userID FROM users`, [], (err, row)=>{ //double check this SQL
        // these are arrays of user IDs
        let tmpFriends = new Array();
        let tmpRequests = new Array();

        db.each(`SELECT friendID friendID FROM friends WHERE userID = ?`, [row.userID], (err, row)=>{
            // add friend to vector
            tmpFriends.push(row.friendID);
        });
        // note to self: need to ensure that friend request backup is stored respective to who is sending/receiving the request
        db.each(`SELECT friendRequesting friendRequesting, userID userID FROM friendRequests WHERE userID = ?`, [row.userID], (err, row)=>{
            // add friend request (requesting person's user ID) to vector
            tmpRequests.push(row.friendRequesting);
        });

        let tmp = new User(row.userID, row.username, row.password, tmpFriends, tmpRequests);
        Users.push(tmp);
        // console.log("pushed a user");
    });
};

var Posts = new Array();
// load posts from database into array
let loadPosts = function() {
    db.each(`SELECT userID userID, postID postID, postContent postContent, shareCount shareCount FROM posts`, [], (err, row)=>{
        let tmpComments = new Array();
        if(row != undefined){
            db.each(`SELECT comment comment, commentID commentID FROM comments WHERE postID = ?`, [row.postID], (err, row)=>{
                // not doing anything with commentID yet?
                tmpComments.push(row.comment);
            });
            let tmpLikes = new Array();
            db.each(`SELECT userID userID FROM likes WHERE postID = ?`, [row.postID], (err, row)=>{
                tmpLikes.push(row.userID);
            });

            let tmp = new PostCard(row.postID, row.userID, "deprecated", row.postContent, tmpLikes, row.shareCount, tmpComments);
            Posts.push(tmp);
            // console.log("pushed a post");
        }
    });
};

// backup current program state (users and posts) to database -- called upon exit
let backupDB = function() {
    /* USER BACKUP */
    // let's see who all is here!
    let userIDs = new Array();
    for(let i = 0; i < Users.length; i++){
        userIDs.push(Users[i].getUserID());
    }

    // add completely new folks and update existing ones
    for(let i = 0; i < userIDs.length; i++){
        db.each(`SELECT username username FROM users WHERE userID = ?`, [userIDs[i]], (err, row)=>{
            if(row == undefined){
                // add user to the database
                db.run(`INSERT INTO users (userID, username, password) VALUES (?, ?, ?)`, [Users[i].getUserID(), Users[i].getUsername(), Users[i].getPassword()], (err, row)=>{});
                // add their friends
                for(let j = 0; j < Users[i].getFriends().length; j++){
                    db.run(`INSERT INTO friends (userID, friendID) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getFriends()[j]], (err, row)=>{});
                }
                // add their incoming friend requests
                for(let j = 0; j < Users[i].getIncomingFriendRequest().length; j++){
                    db.run(`INSERT INTO friendRequests (userID, friendRequesting) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getIncomingFriendRequest()[j]], (err, row)=>{});
                }
            }
            // if user is in the database already, update their stuff
            else{
                db.run(`UPDATE users SET username = ?, password = ? WHERE userID = ?`, [Users[i].getUsername(), Users[i].getPassword(), userIDs[i]], (err, row)=>{});
                // update their friends too
                for(let j = 0; j < Users[i].getFriends().length; j++){
                    db.each(`SELECT friendID friendID FROM friends WHERE userID = ?, friendID = ?`, [Users[i].getUserID(), Users[i].getFriends()[j]], (err, row)=>{
                        // console.log(row.userID);
                        // if not in database
                        if(row == undefined){
                            // add the friend
                            db.run(`INSERT INTO friends (userID, friendID) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getFriends()[j]], (err, row)=>{});
                        }
                    });
                }
                db.each(`SELECT friendID friendID FROM friends WHERE userID = ?`, [Users[i].getUserID()], (err, row)=>{
                    if(!Users[i].getFriends().includes(row.friendID)){
                        // delete friend from database
                        db.run(`DELETE FROM friends WHERE friendID = ?`, [row.friendID], (err, row)=>{});
                    }
                });
                // update their friend requests too
                for(let j = 0; j < Users[i].getIncomingFriendRequest().length; j++){
                    db.each(`SELECT friendRequesting friendRequesting FROM friendRequests WHERE userID = ?, friendRequesting = ?`, [Users[i].getUserID(), Users[i].getIncomingFriendRequest()[j]], (err, row)=>{
                        // if not in database
                        if(row == undefined){
                            // add the friend request
                            db.run(`INSERT INTO friendRequests (userID, friendRequesting) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getIncomingFriendRequest()[j]], (err, row)=>{});
                        }
                    });
                }
                db.each(`SELECT friendRequesting friendRequesting FROM friendRequests WHERE userID = ?`, [Users[i].getUserID()], (err, row)=>{
                    if(!Users[i].getIncomingFriendRequest().includes(row.friendRequesting)){
                        // delete friend request from database
                        db.run(`DELETE FROM friendRequests WHERE friendRequesting = ?`, [row.friendRequesting], (err, row)=>{});
                    }
                });
            }
        });
    }

    // delete the non-existent users from db
    db.each(`SELECT userID userID FROM users`, [], (err, row)=>{
        if(!userIDs.includes(row.userID)){
            // delete user from database
            db.run(`DELETE FROM users WHERE userID = ?`, [row.userID], (err, row)=>{

            });
            // delete their friends & requests too
            db.each(`SELECT friendID friendID FROM friends WHERE userID = ?`, [row.userID], (err, row)=>{
                db.run(`DELETE FROM friends WHERE friendID = ?`, [row.friendID], (err, row)=>{});
            });
            db.each(`SELECT friendRequesting friendRequesting FROM friendRequests WHERE userID = ?`, [row.userID], (err, row)=>{
                db.run(`DELETE FROM friendRequests WHERE friendRequesting = ?`, [row.friendRequesting], (err, row)=>{});
            });
        }
    });
    
    /* POST BACKUP */
    let postIDs = Array();
    for(let i = 0; i < Posts.length; i++){
        postIDs.push(Posts[i].ID);
    }
    for(let i = 0; i < postIDs.length; i++){
        db.each(`SELECT userID userID FROM posts WHERE postID = ?`, [postIDs[i]], (err, row)=>{
            if(row == undefined){
                // add post to the database
                db.run(`INSERT INTO posts (userID, postID, postContent, shareCount) VALUES (?, ?, ?, ?, ?)`, 
                [Posts[i].PosterID, Posts[i].ID, Posts[i].content, Posts[i].shares], (err, row)=>{});
                // add comments as well
                for(let j = 0; j < Posts[i].comments.length; j++){
                    db.run(`INSERT INTO comments (postID, comment) VALUES (?, ?)`, [Posts[i].ID, Posts[i].comments[j]], (err, row)=>{});
                }
                // add likes as well
                for(let j = 0; j < Posts[i].likes.length; j++){
                    db.run(`INSERT INTO likes (postID, userID) VALUES (?, ?)`, [Posts[i].ID, Posts[i].likes[j]], (err, row)=>{});
                }
            }
            // if post is in the database already, update the stats jic
            else{
                db.run(`UPDATE posts SET postContent = ?, shareCount = ? WHERE postID = ?`, 
                [Posts[i].content, Posts[i].shares], (err, row)=>{});
                // update comments too
                for(let j = 0; j < Posts[i].comments.length; j++){
                    db.get(`SELECT comment comment FROM comments WHERE postID = ?, comment = ?`, 
                    [Posts[i].ID, Posts[i].comments[j]], (err, row)=>{
                        // if not in database
                        if(row == undefined){
                            // add the comment to the database
                            db.run(`INSERT INTO comments (postID, comment) VALUES (?, ?)`, [Posts[i].ID, Posts[i].comments[j]], (err, row)=>{});
                        }
                    });
                }
                // update likes too
                for(let j = 0; j < Posts[i].likes.length; j++){
                    db.get(`SELECT userID userID FROM likes WHERE postID = ?, userID = ?`, 
                    [Posts[i].ID, Posts[i].likes[j]], (err, row)=>{
                        // if not in database
                        if(row == undefined){
                            // add the like to the database
                            db.run(`INSERT INTO likes (postID, userID) VALUES (?, ?)`, [Posts[i].ID, Posts[i].likes[j]], (err, row)=>{});
                        }
                    });
                }
                db.each(`SELECT comment comment FROM comments WHERE postID = ?`, [Posts[i].ID], (err, row)=>{
                    if(!Posts[i].comments.includes(row.comment)){
                        // delete comment from database
                        db.run(`DELETE FROM comments WHERE comment = ?`, [row.comment], (err, row)=>{});
                    }
                });
                db.each(`SELECT userID userID FROM likes WHERE postID = ?`, [Posts[i].ID], (err, row)=>{
                    if(!Posts[i].likes.includes(row.userID)){
                        // delete like from database
                        db.run(`DELETE FROM likes WHERE userID = ?`, [row.userID], (err, row)=>{});
                    }
                });
            }
        });
    }

    // delete the non-existent posts from db
    db.each(`SELECT postID postID FROM posts`, [], (err, row)=>{
        if(!postIDs.includes(row.postID)){
            // delete post from database
            db.run(`DELETE FROM posts WHERE postID = ?`, [row.postID], (err, row)=>{});
            // delete their comments
            db.run(`DELETE FROM comments WHERE postID = ?`, [row.postID], (err, row)=>{});
            // delete their likes
            db.run(`DELETE FROM likes WHERE postID = ?`, [row.postID], (err, row)=>{});
        }
    });
};


// note: to access the interface (once we have one), use this URL in your browser after running index.js:
// localhost:4124/home

/* FRONTEND HANDLERS */
io.on('connection', (socket)=>{
    socket.on('test', (data)=>{
        console.log("test signal received");
    });

    socket.on('search request', (data)=>{
        let index = searchUser(data);
        if(index == -1){
            socket.emit('search result', 'none');
        }
        else{
            socket.emit('search result', [Users[index].getUserID(), Users[index].getUsername()]);
        }
    });

    socket.on("nextProfile", (data)=>{
        // store a user ID to send over to profile.html
        profileToSend = -1;
        // if own profile
        if(data == "ownProfile"){
            profileToSend = currentUser;
        }
        else{
            profileToSend = parseInt(data);
        }
    });

    socket.on("need profile", (data)=>{
        let index = -1;
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == profileToSend){
                index = i;
                break;
            }
            if(i == Users.length-1){
                console.log("profile not found");
                return;
            }
        }
        let userToSend = new Array();
        // woo race condition
        setTimeout(()=>{
            userToSend.push(profileToSend);
            userToSend.push(Users[index].getUsername());
            // -1 means self, 0 means not friends, 1 means request pending, 2 means friends
            if(profileToSend == currentUser){
                userToSend.push(-1);
            }
            else if(Users[index].getIncomingFriendRequest().includes(profileToSend)){
                userToSend.push(1);
            }
            else if(Users[index].getFriends().includes(profileToSend)){
                userToSend.push(2);
            }
            else{
                userToSend.push(0);
            }
        }, 500);
        // now get all the posts from that user
        let postsToSend = new Array();
        for(let i = Posts.length-1; i >= 0; i--){
            if(Posts[i].PosterID == profileToSend){
                let postInfo = new Array();
                postInfo[0] = Posts[i].ID;
                postInfo[1] = Users[index].getUsername();
                postInfo[2] = Posts[i].content;
                postInfo[3] = Posts[i].likes;
                postInfo[4] = Posts[i].shares;
                setTimeout(()=>{
                    postsToSend.push(postInfo);
                    postsToSend.push(Posts[i].comments);
                }, 100);
            }
        }
        setTimeout(()=>{
            socket.emit("here profile", [userToSend, postsToSend]);
            console.log("all profile posts:", [userToSend, postsToSend]);
        }, 1000);
            
    });
    
    socket.on('login attempt', (data)=>{
        let index = -1;
        for(let i = 0; i < Users.length; i++){
            if(data.username == Users[i].getUsername()){
                index = i;
                break;
            }
            if(i == Users.length-1){
                console.log("username not found");
                return;
            }
        }
        setTimeout(()=>{
            if(Users[index].getPassword() == data.password){
                loggedIn = true;
                socket.emit('loginAttemptResults', 'true');
                console.log("set loggedIn to true");
                currentUser = Users[index].getUserID();
            }
            else{
                console.log("incorrect password");
                socket.emit('loginAttemptResults', 'false');
            }
        }, 50);
    });

    // TODO test this
    socket.on('registration attempt', (data)=>{
        // commented out stuff is for testing
        // socket.emit('registerAttemptResults', 'true');
        // console.log("new user registered");

        let tmpUsernames = new Array();
        for(let i = 0; i < Users.length; i++){
            tmpUsernames.push(Users[i].getUsername());
        }
        setTimeout(()=>{
            if(tmpUsernames.includes(data.username)){
                socket.emit('registerAttemptResults', 'false');
            }
            else{
                // TODO add new user function here
                socket.emit('registerAttemptResults', 'true');
            }
        }, 100)
    });

    socket.on("empty values", (data)=>{
        console.log("empty values");
    });

    // this one was fun to debug
    socket.on("need posts", (data)=>{        
        let index = -1;
        let postsToSend = new Array();
        let posterID = -1;
        for(let i = 0; i < Users.length; i++){
            if(currentUser == Users[i].getUserID()){
                index = i;
                console.log("selected user:", Users[index].getUsername());
                break;
            }
            if(i == Users.length-1){
                console.log("couldn't find current user");
                return;
            }
        }

        let friendIDs = new Array();
        // get the user IDs of every friend
        setTimeout(()=>{
            for(let i = 0; i < Users[index].getFriends().length; i++){
                friendIDs.push(Users[index].getFriends()[i]);
            }
            setTimeout(()=>{
                for(let i = Posts.length-1; i >= 0; i--){
                    // empty array
                    // postInfo.length = 0;
                    posterID = Posts[i].PosterID;
                    if(friendIDs.includes(posterID)){
                        let postInfo = new Array();
                        postInfo[0] = Posts[i].ID;
                        console.log(Posts[i].ID);
                        for(let j = 0; j < Users.length; j++){
                            if(Users[j].getUserID() == Posts[i].PosterID){
                                postInfo[1] = Users[j].getUsername();
                                break;
                            }
                        }
                        // postInfo.push(Posts[i].username); // PROBLEM -- need to get username outside of the post class or change post initializations
                        postInfo[2] = Posts[i].content;
                        postInfo[3] = Posts[i].likes;
                        postInfo[4] = Posts[i].shares;
                        // comments too
                        setTimeout(()=>{
                            postsToSend.push(postInfo);
                            // console.log("pushed post:", postInfo);
                            postsToSend.push(Posts[i].comments);
                        }, 100);
                    }
                }
            }), 50;
            
            // if you wanna test it with just one post, uncomment below and comment out the rest of the function lol
            // postsToSend = [[123, "jadethomp", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
            // [1, 2, 3, 4], 5], ["wow this is cool!", "i love this lol!"]];
            setTimeout(()=>{
                socket.emit("herePosts", {posts: postsToSend});
                console.log("all posts:", postsToSend);
            }, 200)
            // console.log("just emitted", postsToSend.length/2, "posts");
            // console.log("post 1 was from", postsToSend[0][0]);
        }, 100);    
    });

    socket.on("like request", (data)=>{
        // data is just postID
        let index = -1;
        for(let i = 0; i < Posts.length; i++){
            if(Posts[i].ID == data){
                index = i;
                break;
            }
            if(i == Posts.length-1){
                console.log("post not found");
                socket.emit("like result", ["false"]);
                return;
            }
        }

        setTimeout(()=>{
            if(Posts[index].PosterID != currentUser && !Posts[index].likes.includes(currentUser)){
                // TODO like post function goes here
                socket.emit("like result", ["true", data]);
            }
            else{
                console.log("can't like own post"); // should this be a thing?
                socket.emit("like result", ["false"]);
            }
        }, 50);
    });

    socket.on("share request", (data)=>{
        let index = -1;
        for(let i = 0; i < Posts.length; i++){
            if(Posts[i].ID == data){
                index = i;
                break;
            }
            if(i == Posts.length-1){
                console.log("post not found");
                socket.emit("share result", ["false"]);
                return;
            }
        }

        setTimeout(()=>{
            // TODO share post function goes here
            socket.emit("share result", ["true", data]);
        }, 50);
    });

    socket.on("friend request", (data)=>{
        // data is just a userID
        if(data == currentUser){
            console.log("can't friend self");
            socket.emit("friend request result", "false");
        }
        let index = -1;
        for(let i = 0; i < Users.length; i++){
            if(data == Users[i].getUserID()){
                index = i;
                break;
            }
            if(i == Users.length-1){
                console.log("couldn't find current user");
                socket.emit("friend request result", "false");
                return;
            }
        }

        setTimeout(()=>{
            // check if user already has incoming from this user
            Users[index].setIncomingFriendRequest(currentUser);
            socket.emit("friend request result", "true");
        }, 50);
    });

    socket.on('log out', (data)=>{
        currentUser = -1;
        loggedIn = false;
    });

    socket.on('exit', (data)=>{
        console.log("Exiting...");
        exitProgram();
    });
});

/* MISC FUNCTIONS? */
let exitProgram = function() {
    backupDB();
    db.close();
}

/* INIT FUNCTION CALLS */
loadUsers();
loadPosts();

// used this for testing
// setTimeout(()=>{
//     console.log("There are", Users.length, "users");
//     console.log("There are", Posts.length, "posts\n");
// }, 1000);

