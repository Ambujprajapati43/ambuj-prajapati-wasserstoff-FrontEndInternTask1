import Peer from 'peerjs';
import { v4 as uuidv4 } from 'uuid';

const peerManager = {
  peer: null,
  connections: [],
  userName: '',
  onContentReceived: null,
  onUsersUpdated: null,

  initialize(onContentReceived, onUsersUpdated) {
    this.onContentReceived = onContentReceived;
    this.onUsersUpdated = onUsersUpdated;

    this.userName = localStorage.getItem('userName') || `User-${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('userName', this.userName); 

    const peerId = 'user-' + uuidv4();
    this.peer = new Peer(peerId);

    this.peer.on('open', (id) => {
      console.log('Peer connected with ID:', id);
      this.updateUserList();
    });

    this.peer.on('connection', (conn) => {
      console.log('Incoming connection from:', conn.peer);
      conn.on('open', () => {
        this.setupConnection(conn, true);
        
        conn.send({ type: 'identity', name: this.userName });
      });
    });

    this.peer.on('error', (err) => {
      console.error('Peer error:', err);
    });
  },

  connectToPeer(peerId) {
    if (!this.peer || this.peer.id === peerId) {
      console.warn('Cannot connect to self or peer not initialized');
      return;
    }

    const conn = this.peer.connect(peerId);

    conn.on('open', () => {
      console.log('Connected to peer:', peerId);
      this.setupConnection(conn, false);
     
      conn.send({ type: 'identity', name: this.userName });
    });

    conn.on('error', (err) => {
      console.error('Connection error:', err);
    });
  },

  setupConnection(conn, isIncoming) {
    if (this.connections.find((c) => c.conn.peer === conn.peer)) return;

    const newConnection = {
      conn,
      id: conn.peer,
      name: 'Loading...', 
    };
    this.connections.push(newConnection);
    this.updateUserList();

    conn.on('data', (data) => {
      if (data.type === 'content') {
        this.onContentReceived?.(data.content);
      } else if (data.type === 'identity') {
        
        const user = this.connections.find((u) => u.id === conn.peer);
        if (user) {
          user.name = data.name || 'Anonymous';
          this.updateUserList();
        }

        
        conn.send({ type: 'identity', name: this.userName });
      }
    });

    conn.on('close', () => {
      console.log('Connection closed:', conn.peer);
      this.connections = this.connections.filter((c) => c.conn.peer !== conn.peer);
      this.updateUserList();
    });
  },

  broadcastContent(content) {
    this.connections.forEach(({ conn }) => {
      if (conn.open) {
        conn.send({ type: 'content', content });
      }
    });
  },

  updateUserList() {
    const users = [
      { id: this.peer?.id || 'unknown', name: this.userName },
      ...this.connections.map((c) => ({
        id: c.id,
        name: c.name || 'Loading...',
      })),
    ];
    this.onUsersUpdated?.(users);
  },
};

export default peerManager;

