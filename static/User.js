class User {
    constructor(userID, username, password, friends, incoming) {
        this.userID = userID; //integer
        this.username = username; //string
        this.password = password; //string
        this.friends = friends; //int array for userID
        this.incomingFriendRequest = incoming; //int array for userID
        this.postID = []; //int array for postID's
        this.notifications = []; // array of notif strings (?) maybe do userIDs of requesting people
    }

    getUserID() {
        return this.userID;
    }

    getUsername() {
        return this.username;
    }

    getPassword() {
        return this.password;
    }

    getFriends() {
        return this.friends;
    }

    getIncomingFriendRequest() {
        return this.incomingFriendRequest;
    }

    setUserID(uID) {
        this.userID = uID;
    }

    setUsername(usrnme) {
        this.username = usrnme;
    }

    setPassword(pswrd) {
        this.password = pswrd;
    }

    setFriends(userID) {
        this.friends.push(userID);
    }

    setIncomingFriendRequest(userID) {
        this.incomingFriendRequest.push(userID);
    }

    augmentSnippet(add, postID){
        ind = 0;

        //Add
        if(add){
        this.postID.push(postID);
        }

        //Remove
        else{
            while(1){    
                if(ind == (this.postID.length - 1))
                {
                    return 1;     //postID not found
                }   
                else if(this.postID[ind] == postID)
                {
                    this.postID.splice(ind, 1)
                    break;
                    return 0;
                }
                else{ind++}
            }
        }
    }

    addIncomingFriendRequest(userID){
        this.incomingFriendRequest.push(userID);
    }

    augmentFriend(add, userID) {
        ind = 0;

        //Add
        if(add){
            this.friends.push(userID);
            return 0;
        }
        //Remove
        else{
            //Find userID in incomingFriendRequest[] then splice()
            while(1){    
                if(ind == (this.incomingFriendRequest.length - 1))
                {
                    return 1;   //User not in incomingFriendRequest                    
                }   
                else if(this.incomingFriendRequest[ind] == userID)
                {
                    this.incomingFriendRequest.splice(ind, 1)
                    break;
                    return 0;
                }
                else{ind++}
            }
        }
    }
} 
module.exports = User;
