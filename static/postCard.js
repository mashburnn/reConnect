class PostCard {
  constructor(author, content, likes, comments, isComment) {
    this.author = author;
    this.content = content;
    this.likes = likes;
    this.comments = comments;
    this.isComment = isComment;
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
    const commentsHtml = this.isComment ? this.renderComments(this.comments) : '';

    const cardHtml = `
      <div class="thread-container">
        <div class="thread-card">
          <div class="thread-info">
            <div class="name"><strong>${this.author}</strong></div>
            <div class="snippet">${this.content}</div>
            <div class="tag"><strong>${this.likes} 🖤 </strong></div> 
          </div>
          ${commentsHtml}
        </div>
      </div>
    `;

    // Create a DOM element from the HTML string
    const cardElement = document.createElement('div');
    cardElement.innerHTML = cardHtml;

    return cardElement;
  }
}

