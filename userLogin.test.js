const UserTest = require('./static/User');
// const checkCred = require('./index')

var Users = new Array();

    let u1 = new UserTest(null, "user", "password", null, null, null);
    let u2 = new UserTest(null, "user", "!password*_", null, null, null);
    let u3 = new UserTest(null, "user", "12345", null, null, null);
    let u4 = new UserTest(null, "user", "4pass4", null, null, null);
    let u5 = new UserTest(null, "!*_", "password", null, null, null);
    let u6 = new UserTest(null, "12345", "password", null, null, null);
    let u7 = new UserTest(null, "7user7", "password", null, null, null);

    Users.push(u1);
    Users.push(u2);
    Users.push(u3);
    Users.push(u4);
    Users.push(u5);
    Users.push(u6);
    Users.push(u7);

function checkCred(userN, pass)
{
    for(let i = 0; i < Users.length; i++)
    {
        if(userN == Users[i].getUsername() && pass === Users[i].getPassword()) // added a triple equal sign -> deep equality
        {
            return true;
        }
    }
    return false;
}

describe('user class', ()=>{

    // jest.spyOn(checkCred, "user", "password");

    test('User Login', ()=>{
        expect(checkCred("user", "password")).toBeTruthy();
        
        // expect(checkCred).toHaveBeenCalledTimes(1);
    });

    test('Special Symbols in password', ()=>{
        expect(checkCred("user", "!password*_")).toEqual(true);

        expect(checkCred).toHaveBeenCalledTimes(2);
    });

    test('Numbers in password', ()=>{
        expect(checkCred("user", "12345")).toEqual(true);

        // expect(checkCred).toHaveBeenCalledTimes(3);
    });

    test('Numbers and letters in password', ()=>{
        expect(checkCred("user", "4pass4")).toEqual(true);

        // expect(checkCred).toHaveBeenCalledTimes(4);
    });

    test('Special symbols in username', ()=>{
        expect(checkCred("!*_", "password")).toEqual(true);

        // expect(checkCred).toHaveBeenCalledTimes(5);
    });

    test('Numbers in username', ()=>{
        expect(checkCred("12345", "password")).toEqual(true);

        // expect(checkCred).toHaveBeenCalledTimes(6);
    });

    test('Number and letters in username', ()=>{
        expect(checkCred("7user7", "password")).toEqual(true);

        // expect(checkCred).toHaveBeenCalledTimes(7);
    });

    test('Case sensitivity for password', ()=>{
        expect(checkCred("user", "Password")).toEqual(false);

        // expect(checkCred).toHaveBeenCalledTimes(8);
    });

    test('Case sensitivity for Username', ()=>{
        expect(checkCred("User", "Password")).toEqual(false);

        // expect(checkCred).toHaveBeenCalledTimes(9);
    });

    test('Passing an int instead of string for password', ()=>{
        expect(checkCred("user", 12345)).toEqual(false);

        // expect(checkCred).toHaveBeenCalledTimes(10);
    });

    test('Passing an int instead of string for username', ()=>{
        expect(checkCred(12345, "Password")).toEqual(false);

        // expect(checkCred).toHaveBeenCalledTimes(11);
    });
    
});