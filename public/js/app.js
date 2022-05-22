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
  //BroadCast
  broadcastComment(data);
  textarea.value = '';

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
