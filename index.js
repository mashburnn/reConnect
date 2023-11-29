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
const PostCard = require('./static/postCard');

var app = express();
var server = http.Server(app);
var io = sio(server);

let htmlDirectory = path.resolve(__dirname+'/static');
app.use(express.static(htmlDirectory, {index: 'Onboarding.html'}));
server.listen(4124);

// globals for whether a user is logged in, which user, which profile needs to be displayed
var loggedIn = false;
var currentUser = -1;
var profileToSend = -1;
var resultsToSend = -1;

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

app.get('/results', (req, res)=>{
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

//Search for Post by ID TRIP
function findPost(postID)
{
    for(let i = 0; i < Posts.length; i++)
    {
        if (Posts[i].ID == postID)
        {
            return i; //Found
        }
    }

    return 0; //Not Found
}

// search by username -- exact matches TRIP
function searchUser(username) {
    for (let i = 0; i < Users.length; i++) {
        if (Users[i].getUsername() == username) {
            return i; // Found
        }
    }
    
    return -1; // Not Found
}

// like a post TRIP
function likePost(postID, userID){
    let loc = findPost(postID);

    try
    {
        if(!loc) throw "PostID does not exist";
    }
    catch(err)
    {
        console.log(err);
    }

    let currLikes = Posts[loc].likes;
    currLikes.push(userID);

    // Toggle the liked class on the like button
    //$('#like-' + postID).toggleClass('liked');

    setTimeout(()=>{
        Posts[loc].likes = currLikes;
    }, 15);
}

// comment on a post TRIP
function commentPost(postID, cmt){
    let loc = findPost(postID);
    try
    {
        if(!loc) throw "PostID does not exist";
    }
    catch(err)
    {
        console.log(err);
    }

    Posts[loc].addComment(cmt);
}

// share a post
function sharePost(postID){
    let index = findPost(postID);
    let currShares = Posts[index].shares;
    currShares++;
    setTimeout(()=>{
        Posts[index].shares = currShares;
    }, 50);
    // TODO get it to the friend
}

// create a post
function createNewPost(posterID, content) {
    let newID = -1;
    while(newID == -1) { // changed condition + removed an extra break
      newID = Math.floor(Math.random() * (100)) + 1;
      for (let i = 0; i < Posts.length; i++) {
        if(Posts[i].ID == newID) {
          newID = -1;
          break;
        }
      }
    }
  
  setTimeout(()=>{
    let newPost = new PostCard(newID, posterID, "deprecated", content, [], 0, []);
    Posts.push(newPost);
    // added -- push new post to its poster class
    // let index = -1;
    //     for(let i = 0; i < Users.length; i++){
    //         if(posterID == Users[i].getUserID()){
    //             Users[i].addPostID(newID);
    //             break;
    //         }
    //         if(i == Users.length-1 && index == -1){
    //             console.log("couldn't add post to user");
    //             return;
    //         }
    //     }
  }, 500);
  
}

// create a user TODO fix this to create a new ID on duplicate
function usercreate(username, password) {
    
    let tempUID = (Users.length + 1); // UID is generated as being its place in the Users array

    try
    {
        if(searchUser(tempUID)) throw "UserID already exists";
    }

    catch(err)
    {
        console.log(err);
    }

    setTimeout(()=>{
        let tempUser = new User(tempUID, username, password, [], []); // not using that last parameter for now oops
        Users.push(tempUser);
    }, 100);
}

// check user credentials
function checkCred(userN, pass)
{
    for(let i = 0; i < Users.length; i++)
    {
        if(userN == Users[i].getUsername() && pass == Users[i].getPassword())
        {
            return true;
        }
    }
    return false;
}

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
        setTimeout(()=>{
            // console.log(tmpRequests);
            let tmp = new User(row.userID, row.username, row.password, tmpFriends, tmpRequests);
            Users.push(tmp);
        }, 100);
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

            setTimeout(()=>{
                let tmp = new PostCard(row.postID, row.userID, "deprecated", row.postContent, tmpLikes, row.shareCount, tmpComments);
                Posts.push(tmp);
            }, 100);
            // console.log("pushed a post");
        }
    });
};

// backup current program state (users and posts) to database -- called upon exit
let backupDB = function() {
    console.log("Backing up database...");
    /* USER BACKUP */
    // let's see who all is here!
    let userIDs = new Array();
    for(let i = 0; i < Users.length; i++){
        userIDs.push(Users[i].getUserID());
    }

    // add completely new folks and update existing ones
    setTimeout(()=>{
        console.log(userIDs.length, userIDs[5]);
        for(let i = 0; i < userIDs.length; i++){
            db.get(`SELECT username username FROM users WHERE userID = ?`, [userIDs[i]], (err, row)=>{
                console.log("testing", userIDs[i]);
                // if(err){
                //     console.log(err);
                // }
                if(row == undefined){
                    // add user to the database
                    console.log("inserting", userIDs[i]);
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
                    console.log("user", userIDs[i], "was already here")
                    db.run(`UPDATE users SET username = ?, password = ? WHERE userID = ?`, [Users[i].getUsername(), Users[i].getPassword(), userIDs[i]], (err, row)=>{});
                    
                    // update their friends too
                    let tmpFriendsUpdated = new Array();
                    db.each(`SELECT friendID friendID FROM friends WHERE userID = ?`, [Users[i].getUserID()], (err, row)=>{
                        // if in database and local
                        if(Users[i].getFriends().includes(row.friendID)){
                            tmpFriendsUpdated.push(row.friendID);
                        }
                        // if in database but not local
                        else if(!Users[i].getFriends().includes(row.friendID)){
                            // delete from database
                            db.run(`DELETE FROM friends WHERE userID =?, friendID = ?`, [Users[i].getUserID(), row.friendID], (err, row)=>{});
                        }
                    });
                    setTimeout(()=>{
                        // add to database from local if not there
                        for(let j = 0; j < Users[i].getFriends().length; j++){
                            if(!tmpFriendsUpdated.includes(Users[i].getFriends()[j])){
                                // add to database
                                db.run(`INSERT INTO friends (userID, friendID) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getFriends()[j]], (err, row)=>{});
                            }
                        }
                    }, 200);
    
                    // update their friend requests too
                    let tmpRequestsUpdated = new Array();
                    db.each(`SELECT friendRequesting friendRequesting FROM friendRequests WHERE userID = ?`, [Users[i].getUserID()], (err, row)=>{
                        // if in database and local
                        if(Users[i].getIncomingFriendRequest().includes(row.friendRequesting)){
                            tmpRequestsUpdated.push(row.friendRequesting);
                        }
                        // if in database but not local
                        else if(!Users[i].getIncomingFriendRequest().includes(row.friendRequesting)){
                            // delete from database
                            db.run(`DELETE FROM friendRequests WHERE userID =?, friendRequesting = ?`, [Users[i].getUserID(), row.friendRequesting], (err, row)=>{});
                        }
                    });
                    setTimeout(()=>{
                        // add to database from local if not there
                        for(let j = 0; j < Users[i].getIncomingFriendRequest().length; j++){
                            if(!tmpRequestsUpdated.includes(Users[i].getIncomingFriendRequest()[j])){
                                // add to database
                                db.run(`INSERT INTO friendRequests (userID, friendRequesting) VALUES (?, ?)`, [Users[i].getUserID(), Users[i].getIncomingFriendRequest()[j]], (err, row)=>{});
                            }
                        }
                    }, 200);
                }
            });
        };
    
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
    }, 1000);
    
    /* POST BACKUP */
    let postIDs = Array();
    for(let i = 0; i < Posts.length; i++){
        postIDs.push(Posts[i].ID);
    }
    setTimeout(()=>{
        console.log(postIDs.length);
        for(let i = 0; i < postIDs.length; i++){
            db.get(`SELECT userID userID FROM posts WHERE postID = ?`, [postIDs[i]], (err, row)=>{
                console.log("testing", postIDs[i]);
                if(row == undefined){
                    // add post to the database
                    db.run(`INSERT INTO posts (userID, postID, postContent, shareCount) VALUES (?, ?, ?, ?)`, 
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
                    console.log("post", Posts[i].ID, "was already here");
                    db.run(`UPDATE posts SET postContent = ?, shareCount = ? WHERE postID = ?`, 
                    [Posts[i].content, Posts[i].shares], (err, row)=>{});
    
                    // update comments too
                    let tmpCommentsUpdated = new Array();
                    db.each(`SELECT comment comment FROM comments WHERE postID = ?`, [Posts[i].ID], (err, row)=>{
                        // if in database and local
                        if(Posts[i].comments.includes(row.comment)){
                            tmpCommentsUpdated.push(row.comment);
                        }
                        // if in database but not local
                        else if(!Posts[i].comments.includes(row.comment)){
                            // delete comment from database
                            db.run(`DELETE FROM comments WHERE comment = ?`, [row.comment], (err, row)=>{});
                        }
                    });
                    setTimeout(()=>{
                        // add to database from local if not there
                        for(let j = 0; j < Posts[i].comments.length; j++){
                            if(!tmpCommentsUpdated.includes(Posts[i].comments[j])){
                                // add to database
                                db.run(`INSERT INTO comments (postID, comment) VALUES (?, ?)`, [Posts[i].ID, Posts[i].comments[j]], (err, row)=>{});
                            }
                        }
                    }, 200);
    
                    // update likes too
                    let tmpLikesUpdated = new Array();
                    db.each(`SELECT userID userID FROM likes WHERE postID = ?`, [Posts[i].ID], (err, row)=>{
                        // if in database and local
                        if(Posts[i].likes.includes(row.userID)){
                            tmpLikesUpdated.push(row.userID);
                        }
                        // if in database but not local
                        else if(!Posts[i].likes.includes(row.userID)){
                            // delete like from database
                            db.run(`DELETE FROM likes WHERE userID = ?`, [row.userID], (err, row)=>{});
                        }
                    });
                    setTimeout(()=>{
                        // add to database from local if not there
                        for(let j = 0; j < Posts[i].likes.length; j++){
                            if(!tmpLikesUpdated.includes(Posts[i].likes[j])){
                                // add to database
                                db.run(`INSERT INTO likes (postID, userID) VALUES (?, ?)`, [Posts[i].ID, Posts[i].likes[j]], (err, row)=>{});
                            }
                        }
                    }, 200);
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
    }, 1000);
}



// note: to access the interface (once we have one), use this URL in your browser after running index.js:
// localhost:4124/home

/* FRONTEND HANDLERS */
io.on('connection', (socket)=>{
    socket.on('test', (data)=>{
        console.log("test signal received");
    });

    socket.on('search request', (data)=>{
        if(data == "friends"){
            let index = -1;
            // get to the current user instance
            for(let i = 0; i < Users.length; i++){
                if(Users[i].getUserID() == currentUser){
                    index = i;
                    break;
                }
                if(i == Users.length-1){
                    console.log("profile not found");
                    return;
                }
            }
            // get all the friend IDs
            let friendIDs = new Array();
            setTimeout(()=>{
                if(Users[index].getFriends().length == 0){
                    resultsToSend = "none";
                    return;
                }
                for(let i = 0; i < Users[index].getFriends().length; i++){
                    friendIDs.push(Users[index].getFriends()[i]);
                }
            }, 150);
            // get all the friend instances
            let friendsToSend = new Array();
            setTimeout(()=>{
                for(let i = 0; i < friendIDs.length; i++){
                    let tmpFriend = new Array();
                    tmpFriend[0] = friendIDs[i];
                    for(let j = 0; j < Users.length; j++){
                        if(Users[j].getUserID() == friendIDs[i]){
                            tmpFriend[1] = Users[j].getUsername();
                            break;
                        }
                    }
                    setTimeout(()=>{
                        friendsToSend.push(tmpFriend);
                    }, 100)
                }
            }, 300);
            setTimeout(()=>{
                resultsToSend = friendsToSend;
            }, 500);
        }
        else{
            console.log("received", data);
            let index = searchUser(data);
            if(index == -1){
                resultsToSend = "none";
            }
            else{
                resultsToSend = [[Users[index].getUserID(), Users[index].getUsername()]];
            }
        }
    });

    socket.on("need results", (data)=>{
        // time out to give the previous handler time to set
        setTimeout(()=>{
            console.log("sending", resultsToSend);
            socket.emit("here results", resultsToSend);
        }, 500);
    });

    socket.on("need to share", (data)=>{
        setTimeout(()=>{
            socket.emit("here friends", resultsToSend);
        }, 500);
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
        let myIndex = -1;
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == profileToSend){
                index = i;
            }
            else if(Users[i].getUserID() == currentUser){
                myIndex = i;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }
        let userToSend = new Array();
        // woo race condition
        setTimeout(()=>{
            // console.log("curr user is", Users[index].getUsername(), "and to send is", profileToSend);
            userToSend[0] = profileToSend;
            userToSend[1] = Users[index].getUsername();
            // -1 means self, 0 means not friends, 1 means request pending, 2 means friends
            if(profileToSend == currentUser){
                userToSend[2] = -1;
            }
            else if(Users[index].getIncomingFriendRequest().includes(currentUser)){
                userToSend[2] = 1;
            }
            else if(Users[myIndex].getFriends().includes(profileToSend)){
                userToSend[2] = 2;
            }
            else{
                userToSend[2] = 0;
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
            // console.log("all profile posts:", [userToSend, postsToSend]);
        }, 1000);
            
    });
    
    socket.on('login attempt', (data)=>{
        let index = -1;
        // console.log(data.username)
        for(let i = 0; i < Users.length; i++){
            if(data.username == Users[i].getUsername()){
                index = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("username not found");
                socket.emit('loginAttemptResults', 'false');
                return;
            }
        }
        setTimeout(()=>{
            if(Users[index].getPassword() == data.password){
                loggedIn = true;
                // console.log(data.username)
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
            // console.log(tmpUsernames);
            console.log(data.username);
            if(tmpUsernames.includes(data.username)){
                console.log("username already exists");
                socket.emit('registerAttemptResults', 'false');
            }
            else{
                usercreate(data.username, data.password);
                socket.emit('registerAttemptResults', 'true');
            }
        }, 500)
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
                // console.log("all posts:", postsToSend);
            }, 200);
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
            if(i == Posts.length-1 && index == -1){
                console.log("post not found");
                socket.emit("like result", ["false"]);
                return;
            }
        }

        setTimeout(()=>{
            if(Posts[index].PosterID != currentUser && !Posts[index].likes.includes(currentUser)){
                likePost(data, currentUser);
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
            if(i == Posts.length-1 && index == -1){
                console.log("post not found");
                socket.emit("share result", ["false"]);
                return;
            }
        }

        setTimeout(()=>{
            sharePost(data);
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
            if(i == Users.length-1 && index == -1){
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

    socket.on("comment request", (data)=>{
        console.log("got a comment request");
        commentPost(data[0], data[1]);
        console.log("added comment to post", data[0], data[1]);
        socket.emit("comment result", "true");
    });

    socket.on("need notifications", (data)=>{
        console.log("you need notifications");
        let index = -1;
        // get to the current user instance
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == currentUser){
                index = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }
        let requestIDs = new Array();
        setTimeout(()=>{
            for(let i = 0; i < Users[index].getIncomingFriendRequest().length; i++){
                requestIDs[i] = Users[index].getIncomingFriendRequest()[i];
                // console.log("pushed");
            }
        }, 50);

        let requests = new Array();
        setTimeout(()=>{
            // console.log(requestIDs.length);
            for(let i = 0; i < requestIDs.length; i++){
                let tmpRequest = new Array();
                tmpRequest[0] = requestIDs[i];
                for(let j = 0; j < Users.length; j++){
                    if(Users[j].getUserID() == requestIDs[i]){
                        tmpRequest[1] = Users[j].getUsername();
                        break;
                    }
                }
                setTimeout(()=>{
                    requests.push(tmpRequest);
                }, 100)
            }
        }, 100);
        
        setTimeout(()=>{
            socket.emit("here notifications", requests);
        }, 300);
    });

    socket.on("accept request", (data)=>{
        let index = -1;
        // get to the current user instance
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == currentUser){
                index = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }

        let friendIndex = -1;
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == data){
                friendIndex = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }

        setTimeout(()=>{
            Users[index].augmentFriend(1, data);
            Users[friendIndex].augmentFriend(1, currentUser);
            socket.emit("accept request result", "true");
        }, 200);
    });

    socket.on("decline request", (data)=>{
        let index = -1;
        // get to the current user instance
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == currentUser){
                index = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }

        setTimeout(()=>{
            Users[index].augmentFriend(0, data);
        }, 50);
    });

    socket.on("create post request", (data)=>{
        let index = -1;
        // get to the current user instance
        for(let i = 0; i < Users.length; i++){
            if(Users[i].getUserID() == currentUser){
                index = i;
                break;
            }
            if(i == Users.length-1 && index == -1){
                console.log("profile not found");
                return;
            }
        }

        setTimeout(()=>{
            createNewPost(currentUser, data);
            socket.emit("create post result", "true");
        }, 50);
    });

    socket.on("edit post request", (data)=>{
        let index = -1;
        // get to the current user instance
        for(let i = 0; i < Posts.length; i++){
            if(Posts[i].ID == data[0]){
                index = i;
                break;
            }
            if(i == Posts.length-1 && index == -1){
                console.log("post not found");
                return;
            }
        }

        setTimeout(()=>{
            Posts[index].content = data[1];
            socket.emit("edit post result", "true");
        }, 50);
    });

    socket.on("need current user", (data)=>{
        socket.emit(currentUser);
    });

    socket.on('log out', (data)=>{
        currentUser = -1;
        loggedIn = false;
    });

    socket.on('exit', (data)=>{
        exitProgram();
    });
});

/* MISC FUNCTIONS? */
let exitProgram = function() {
    backupDB();
    console.log("Exiting...");
    server.close();
    setTimeout(()=>{
        db.close();
        setTimeout(()=>{
            process.exit();
        }, 100);
    }, 5000);
}

process.on('SIGINT', exitProgram);

/* INIT FUNCTION CALLS */
loadUsers();
loadPosts();

// used this for testing
// setTimeout(()=>{
//     console.log("There are", Users.length, "users");
//     console.log("There are", Posts.length, "posts\n");
// }, 1000);

