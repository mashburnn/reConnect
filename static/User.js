class User {
    constructor(userID, username, password, friends, incoming, postID) {
        this.userID = userID; //integer
        this.username = username; //string
        this.password = password; //string
        this.friends = friends; //int array for userID
        this.incomingFriendRequest = incoming; //int array for userID
        this.postID = postID; //int array for postID's
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

    setIncomingFriendRequest(uID) {
        this.incomingFriendRequest.push(uID);
    }

    augmentSnippet(add, poID){
        ind = 0;

        //Add
        if(add){
        this.postID.push(poID);
        }

        //Remove
        else{
            while(1){    
                if(ind == (this.postID.length - 1))
                {
                    return 1;     //postID not found
                }   
                else if(this.postID[ind] == poID)
                {
                    this.postID.splice(ind, 1)
                    break;
                    return 0;
                }
                else{ind++}
            }
        }
    }

    addIncomingFriendRequest(uID){
        this.incomingFriendRequest.push(uID);
    }

    augmentFriend(add, uID) {
        for(let i = 0; i < this.incomingFriendRequest.length; i++){
            if(uID == (this.incomingFriendRequest[i])){
                if(add){
                    this.friends.push(uID);
                    this.incomingFriendRequest.splice(i, 1)
                    return 0;   //Added Friend, removed from requests
                }
                else{
                    this.incomingFriendRequest.splice(i, 1)
                    // break;
                    return 0;   //Removed from requests
                }                 
            }   
        }
        // adding this so the friendship shows up for both users -- will maybe make a more sophisticated solution later
        if(add){
            this.friends.push(uID);
        }
        return 1; //User not in requests
    }

} 
module.exports = User;
