const UserTest = require('./static/User');

describe('Friend Request', ()=>{
    const t1 = new UserTest(null, null, null, [], [1, 2], null);

    jest.spyOn(t1, "augmentFriend");

    test('accepting a friend request', ()=>{
        expect(t1.augmentFriend(true, 1)).toBeFalsy();
        expect(t1.augmentFriend).toHaveBeenCalledTimes(1);
    });

    test('denying a friend request', ()=>{
        expect(t1.augmentFriend(false, 2)).toBeFalsy();
        expect(t1.augmentFriend).toHaveBeenCalledTimes(2);
    });

    test('removing a friend not in friends list', ()=>{
        expect(t1.augmentFriend(false, 999)).toBeTruthy();
        expect(t1.augmentFriend).toHaveBeenCalledTimes(3);
    });
});