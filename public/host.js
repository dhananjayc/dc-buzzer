const socket = io()
const active = document.querySelector('.js-active')
const buzzList = document.querySelector('.js-buzzes')
const userList = document.querySelector('.js-users')
const activate = document.querySelector('.js-activate')
const deactivate = document.querySelector('.js-deactivate')
const clear = document.querySelector('.js-clear')
const reset = document.querySelector('.js-reset')
const buzzer = document.querySelector('.js-buzzer')

socket.on('active', (numberActive) => {
  active.innerText = `${numberActive} member/s joined`
})

socket.on('buzzes', (buzzes) => {
  buzzList.innerHTML = buzzes
    .map(buzz => {
      const p = buzz.split('-')
      return { name: p[0], team: p[1], time: p[2], option: p[3] }
    })
    .map(user => `<li><b>${user.name}</b> from <b>Team ${user.team}</b> Selected <b>option - ${user.option} </b> on time - ${user.time}</li>`)
    .join('')
})

socket.on('members', (members) => {
  userList.innerHTML = members
    .map(user => `<li>${user}</li>`)
    .join('')
})

clear.addEventListener('click', () => {
  socket.emit('clear')
})

reset.addEventListener('click', () => {
  socket.emit('reset')
})

activate.addEventListener('click', () => {
  socket.emit('activate')
})

deactivate.addEventListener('click', () => {
  socket.emit('deactivate')
})