class VoteMessage {
  constructor(type, upvotes, downvotes, postId) {
    this.type = type;
    this.upvotes = upvotes;
    this.downvotes = downvotes;
    this.postId = postId;
  }
}

class _WebSocket {
  events = [];
  handlers = [];

  constructor() {
      let port = window.location.port;
      const protocol = window.location.protocol === 'http:' ? 'ws' : 'wss';
      this.socket = new WebSocket(`${protocol}://${window.location.hostname}:${port}/ws`);
      console.log('WebSocket connection configured');
      this.socket.onopen = (event) => {
          console.log('WebSocket connection opened');
      };
      this.socket.onclose = (event) => {
          console.log('WebSocket connection closed:', event);
      };
      this.socket.onmessage = async (event) => {
          try {
              const msg = JSON.parse(await event.data.text());
              this.receiveEvent(msg);
          } catch (error) {
              console.error('Error parsing WebSocket message:', error);
          }
      };
  }

  broadcastPost(post) {
      post.type = 'post';
      this.socket.send(JSON.stringify(post));
  }

  broadcastVote(upvotes, downvotes, postId) {
      const event = new VoteMessage('vote', upvotes, downvotes, postId);
      try {
          this.socket.send(JSON.stringify(event));
      } catch (error) {
          console.log(error);
      }
  }

  addHandler(handler) {
      this.handlers.push(handler);
  }

  removeHandler(handler) {
      this.handlers = this.handlers.filter((h) => h !== handler);
  }

  receiveEvent(event) {
      this.handlers.forEach((handler) => {
          handler(event);
      });
  }
}

const websocket = new _WebSocket();
export { websocket };