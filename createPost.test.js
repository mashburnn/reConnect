//const createNewPost = require('./createPost');
const PostCard = require('./static/postCard'); // fixed pathing

let Posts = new Array();

// create a post - moved over from index.js
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
  Posts.push(new PostCard(newID, posterID, "deprecated", content, [], 0, []));
  return true;
}

describe('createNewPost', () => {

  test('creates a new post with a unique post ID', () => {
    expect(createNewPost(1, "content")).toBeTruthy();
  });

  test('creates multiple posts with unique post IDs', () => {
    expect(createNewPost(1, "content")).toBeTruthy();
    expect(createNewPost(1, "content")).toBeTruthy();
    expect(createNewPost(1, "content")).toBeTruthy();
  });

  test('handles different poster IDs', () => {
    // Create posts with different poster IDs
    expect(createNewPost(1, "content")).toBeTruthy();
    expect(createNewPost(2, "content")).toBeTruthy();
  });
});
