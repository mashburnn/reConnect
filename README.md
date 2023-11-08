# ReConnect

## How do I run ReConnect?
  ReConnect uses the Node.js runtime and hosts the interface locally on your device while the program is running. To run this program, make sure that Node.js is installed on your computer. You will be using the command line to run and exit the program.

  ### INSTALLING NODE.JS
  Visit https://nodejs.org/en/download to access the installer for your operating system. Once you have finished installing Node.js, you should be able to check its version in command line.
  
  ![image](https://github.com/ManishKansana/reConnect/assets/113923272/e99389ab-77a0-439f-a2b1-202e143fc00a)

  The Node Package Manager (npm) should come with your Node.js installation. You can check the version of npm as well to ensure that it is installed. This is what you will use to install dependencies.

  ![image](https://github.com/ManishKansana/reConnect/assets/113923272/89978022-0b91-446f-bac4-0431b883d24f)

  ### INSTALLING DEPENDENCIES

  ReConnect uses several node packages. You can install these dependencies easily using npm and the given package.json file. Running this command should install all dependencies from the package.json file.

  `npm install`

  ### RUNNING RECONNECT

  Once all dependencies are installed, simply navigate to the program directory (after downloading it from the repository). Run this command to start the program.

  `node index.js`

  NOTE: If the program does not compile, please analyze your error messages for any missing dependencies!

  This command does not automatically open the interface!! To view the interface, navigate to this URL in your choice of browser.

  `http://localhost:4124/home`

  This will allow you to view the login page of ReConnect, where you can begin using the program. When you are done using the program, navigate to your **command line** and use the command 'Ctrl + C' to quit. The program will take a few seconds to offload information into the local database file.


## Description
  ReConnect is a social media platform that is geared towards software developers. With functionality similar to popular, generic social media platforms such as FaceBook, ReConnect allows a more close-knit setting for  developers to interact, share ideas, and make connections with like-minded individuals.

### Objective
  The goal of this project is to develop a full-stack social media web app for developers.
  Upon completion of the first version, users will be able to create an account, log in and log out with this account, post onto their personal timeline, send/accept friend requests, and like, comment on, and share the posts, or "snippitz", of their friends.

### Requirements
1. Create an Account
    - Users will be able to create an account by choosing a username and password.
2. Log in / Log out
    - Users will be able to log in to the website by correctly entering his or her username and password.
    - Users will also be able to log out of his or her account.
3. Create and Post a "Snippit"
   - Users can create a post, called a "snippit", and post it to their personal timeline.
   - This "snippit" will appear on the homepage of users who are friends with the poster.
   - Users will also be able to edit the content of their snippitz after posting.
4. View "Snippitz" on a Homepage
   - Users can view a homepage.
   - The homepage displays recent "snippitz" made by friends.
5. Send and Accept Friend Requests
   - Users can send friend requests to other users.
   - Users can accept pending friend requests from other users.
6. View Friends' "Snippitz" on a User Timeline
   - Users can view the profile of another user.
   - "Snippitz" posted by users are visible on their profile.
7. Interaction with "Snippitz"
   - A user can send a friend request to another user to add that user to their friends list.
   - Users within a friend's timeline will be able to see that account's snippitz and interact with them.
   - Possible snippit interactions: liking, commenting, and sharing.
       

## Team Members
1. ManishKansana 
   - Github: ManishKansana
   - NetID: mk1684
   - Github E-mail: manish.kansana.24@gmail.com
   - Role: Backend
     
2. William Scherer 
   - samshamrock12
   - NetID: wjs271
   - Github E-mail: samshamrock12@gmail.com
   - Role: Frontend
     
3. Jade Thompson
    - Github: jadethomp
    - NetID: jet475
    - Github E-mail: jadethompson285@gmail.com
    - Role: Backend, Database
    
4. Evan Coats 
    - Github: EvanC545
    - NetID: ejc304
    - Github E-mail: evancoats20@gmail.com
    - Role: Frontend
    
5. Trip Chapman 
    - Github: TChaps52
    - NetID: rcc385
    - Github E-mail: tripchapman52@gmail.com
    - Role: Backend

## Languages, Frameworks, and Databases
  Languages: Javacript, HTML, CSS 
  
  Framework: Node.js
  
  Database: SQLite
