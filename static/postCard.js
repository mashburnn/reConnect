class PostCard {
    comments = new Array();
  
  constructor(id, PosterID ,author, content, likes, shares, comments) {
    this.ID = id;
    this.PosterID = PosterID;
    this.author = author;
    this.content = content;
    this.likes = likes; //Array for storing userID's
    this.shares = shares;
    this.comments = comments;
  }

  get ID() {
    return this._ID;
  }

  set ID(newID) {
    this._ID = newID;
  }

  get PosterID() {
    return this._PosterID;
  }

  set PosterID(newPosterID) {
    this._PosterID = newPosterID;
  }

  get author() {
    return this._author;
  }

  set author(newAuthor) {
    this._author = newAuthor;
  }

  get content() {
    return this._content;
  }

  set content(newContent) {
    this._content = newContent;
  }

  get likes() {
    return this._likes;
  }

  set likes(newLikes) {
    this._likes = newLikes;
  }

  get shares() {
    return this._shares;
  }

  set shares(newShares) {
    this._shares = newShares;
  }

  set comments(newComments) {
    if (Array.isArray(newComments) && newComments.every(comment => typeof comment === 'string')) {
      this.comments = newComments;
    } else {
      throw new Error('Comments must be an array of strings');
    }
  }

// added by Jade
  get comments() {
    return this._comments;
  }

  addComment(comment) {
    if (typeof comment === 'string') {
      this.comments.push(comment);
    } else {
      throw new Error('Comment must be a string');
    }
  }

  // Function to render comments if present
  renderComments(comments) {
    if (!comments || comments.length === 0) return '';

    const commentsHtml = comments.map(comment => `
      <div class="comment">
        <strong>${comment.author}:</strong> ${comment.content}
      </div>
    `).join('');

    return `
      <div class="comments">
        <h4>Comments:</h4>
        ${commentsHtml}
      </div>
    `;
  }

  // Render method to generate the post card HTML
  render() {
    const commentsHtml = this.comments ? this.renderComments(this.comments) : '';

    const cardHtml = `
      <div class="thread-container">
        <div class="thread-card">
          <div class="thread-info">
            <div class="name"><strong>${this.author}</strong></div>
            <div class="snippet">${this.content}</div>
            <div class="tag">
              <button class="like-button">
                <img src="static/like.svg" alt="like" width="20" height="20">
              </button>
              <strong>${this.likes} 🖤 </strong>
              <button class="share-button">
                <img src="static/share.svg" alt="share" width="20" height="20">
              </button>
              <strong>${this.shares} 🔗 </strong>
            </div> 
          </div>
          ${commentsHtml}
        </div>
      </div>
    `;

    // Create a DOM element from the HTML string
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml;

    // Get button elements
    const likeButton = cardElement.querySelector('.like-button');
    const shareButton = cardElement.querySelector('.share-button');

    // Add click handlers to buttons
    // Emit socket events when buttons are clicked
    likeButton.addEventListener('click', () => {
      socket.emit('like request', this.ID);
    });
    shareButton.addEventListener('click', () => {
      socket.emit('share request', this.ID);
    });

    return cardElement;
  }
}
module.exports = PostCard;
// Create a new Post object


