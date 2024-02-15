import express from 'express';
import { Server as SocketServer } from 'socket.io';
import { Server as httpServer } from 'http';
import cors from 'cors';
import { IO as IOServer } from './types/socket';

const app = express();
const PORT = 4000;

//New imports
const http = new httpServer(app);

app.use(cors());

// app.get('/api', (req, res) => {
//   res.json({
//     message: 'Hello world',
//   });
// });

http.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

const io = new SocketServer(http, {
  cors: {
    origin: "http://localhost:3000",
  }
});

interface User {
  id: string;
  name: string;
  group: string;
}

const socket = new IOServer(io);
