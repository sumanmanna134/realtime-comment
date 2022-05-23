let username;
let socket = io();
do {
  username = prompt('Enter Username: ');
} while (!username);

const textarea = document.querySelector('#textarea');
const submitBtn = document.querySelector('#submitBtn');

const commentBox = document.querySelector('.comment__box');
submitBtn.addEventListener('click', (currentEvent) => {
  currentEvent.preventDefault();
  let comment = textarea.value;
  if (!comment) {
    return;
  }

  postComment(comment);
});

function postComment(comment) {
  //append to dom
  let data = {
    username: username,
    comment: comment,
  };
  appendToDom(data);
  textarea.value = '';
  //BroadCast
  broadcastComment(data);

  syncWithDb(data);

  //sync with database
}
function appendToDom(data) {
  let lTag = document.createElement('li');
  lTag.classList.add('comment', 'mb-3');
  let markup = `
     <div class="card border-light mb-3">
    <div class="card-body">
      <h6>${data.username}</h6>
      <p>${data.comment}</p>
      <div>
        <img src="./img/clock.png" alt="clock" />
        <small>${moment(data.time).format('LT')}</small>
      </div>
    </div>
  </div>
    `;

  lTag.innerHTML = markup;
  commentBox.prepend(lTag);
}

//broadcast comment using socket
function broadcastComment(data) {
  socket.emit('comment', data);
}

socket.on('comment', (data) => {
  appendToDom(data);
});
let typingDev = document.querySelector('.typing');
let timerId = null;
socket.on('typing', (data) => {
  typingDev.innerText = `${data.username} is typing...`;
  debounce(function () {
    typingDev.innerText = '';
  }, 1000);
});

function debounce(func, timer) {
  if (timerId) {
    clearTimeout(timerId);
  }
  timerId = setTimeout(() => {
    func();
  }, timer);
}

//Event Listener on textarea
textarea.addEventListener('keyup', (e) => {
  socket.emit('typing', { username });
});

//api calls

function syncWithDb(data) {
  const header = {
    'Content-Type': 'application/json',
  };
  fetch('/api/comments', {
    method: 'Post',
    body: JSON.stringify(data),
    headers: header,
  })
    .then((response) => response.json())
    .then((result) => {
      console.log(result);
    });
}

function fetchComments() {
  fetch('/api/comments')
    .then((res) => res.json())
    .then((result) => {
      result.forEach((data) => {
        data.time = data.createdAt;
        appendToDom(data);
      });
    });
}

window.onload = fetchComments;
