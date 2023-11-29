// this file contains 3 test cases for the post interaction feature of reConnect

const PostCard = require('./static/postCard');

describe('post class', ()=>{
    const post = new PostCard(123, 1, "null", "this is a post", [1, 2, 3], 11, ["hi there", "hi yourself"]);

    jest.spyOn(post, "addComment");
    jest.spyOn(post, "testAddLike");
    jest.spyOn(post, "testAddShare");

    // test case 1
    test('adding a comment', ()=>{
        expect(post.addComment("this is a new comment")).toEqual(["hi there", "hi yourself", "this is a new comment"]);
        expect(post.addComment).toHaveBeenCalledTimes(1);
    });

    // test case 2
    test('liking a post', ()=>{
        expect(post.testAddLike(23)).toEqual([1, 2, 3, 23]);
        expect(post.testAddLike).toHaveBeenCalledTimes(1);
    });

    // test case 3
    test('sharing a post', ()=>{
        expect(post.testAddShare()).toEqual(12);
        expect(post.testAddShare).toHaveBeenCalledTimes(1);
    });
});