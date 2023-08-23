const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const userList = document.querySelector('.js-users')
const activate = document.querySelector('.js-activate')
const deactivate = document.querySelector('.js-deactivate')
const clear = document.querySelector('.js-clear')
const reset = document.querySelector('.js-reset')
const buzzer = document.querySelector('.js-buzzer')
const buzzedAlarm = document.querySelector('.buzzed')

const buzzAudio = new Audio('/assets/buzz-sound-2.mp3');
let soundOn = true;

const toggleSound = (img) => {
  soundOn = !soundOn;
  img.src= soundOn ? "/assets/speaker_on.png" : "/assets/speaker_off.png";
}

socket.on('buzzSound', () => {
  if (soundOn) {
    // play buzz sound if not muted
    buzzAudio.play();
  }
})

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} member/s joined`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1], time: p[2], option: p[3] }
    })
    // .map(user => `<li><b>${user.name}</b> from <b>Team ${user.team}</b> Selected <b>option - ${user.option} </b> on time - ${user.time}</li>`)
    .map(user => `<li><b>${user.name}</b> - <b>Team ${user.team}</b> Selected <b>option - ${user.option} </b> on time - <i> ${user.time}</i></li>`)
    .join('')
})

socket.on('members', (members) => {
  userList.innerHTML = members.map(user => `<li>${user}</li>`).join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear') // clear buzzers for all players
})

reset.addEventListener('click', () => {
  socket.emit('reset') // reset game and kick out all players
})

activate.addEventListener('click', () => {
  socket.emit('activate') // enable buzzers for all players
})

deactivate.addEventListener('click', () => {
  socket.emit('deactivate') // disable buzzers for all players
})