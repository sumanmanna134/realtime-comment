const express = require('express');
require('dotenv').config();
const app = express();

const port = process.env.PORT || 3050;
app.use(express.static('public'));
//database connection

const mongoose = require('mongoose');
const start = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defiled!');
  }

  try {
    await mongoose
      .connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      })
      .then(() => {
        console.log('MongoDB connected!');
      });
  } catch (err) {
    console.log(err);
  }
};
const Comment = require('./model/comment');
app.use(express.json());
app.post('/api/comments', (req, res) => {
  const comment = new Comment({
    username: req.body.username,
    comment: req.body.comment,
  });

  comment.save().then((response) => {
    res.status(201).send(response);
  });
});

app.get('/api/comments', (req, res) => {
  Comment.find()
    .then((response) => {
      res.status(200).send(response);
    })
    .catch((e) => {
      res.status(404).send(e);
    });
});

app.delete('/api/comments/clear', (req, res) => {
  Comment.remove({})
    .then((_) => {
      res.status(200).send('Cleared all data!');
    })
    .catch((e) => {
      res.status(404).send(e);
    });
});

const server = app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
start();
let io = require('socket.io')(server);
io.on('connection', (socket) => {
  console.log(`new connection ${socket.id}`);

  //receive event
  socket.on('comment', (data) => {
    data.time = Date();
    socket.broadcast.emit('comment', data);
  });

  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);
  });
});
