class User {
    constructor() {
        this.userID = userID; //integer
        this.username = username; //string
        this.password = password; //string
        this.friends = []; //array of userID
        this.incomingFriendRequest = []; //array of userID
        this.postID = []; //array of postID's
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
        //add
        if(add){
        this.postID.push(postID);
        }
        //remove
        else{
            while(1){    
                if(ind == (this.postID.length - 1))
                {
                    return 1;                
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

        //Adding
        if(add){
            this.friends.push(userID);
            return 0;
        }
        //Removing
        else{
            //Find userID in incomingFriendRequest[] then splice()
            while(1){    
                if(ind == (this.incomingFriendRequest.length - 1))
                {
                    return 1; //User not in incomingFriendRequest                    
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