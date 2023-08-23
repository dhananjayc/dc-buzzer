const socket = io()
const body = document.querySelector('.js-body')
const form = document.querySelector('.js-join')
const joined = document.querySelector('.js-joined')
const buzzer = document.querySelector('.js-buzzer')
const buzzer2 = document.querySelector('.js-buzzer2')
const buzzer3 = document.querySelector('.js-buzzer3')
const buzzer4 = document.querySelector('.js-buzzer4')
const joinedInfo = document.querySelector('.js-joined-info')
const buzzGroupInfo = document.querySelector('.js-buzz-info')

let user = {}

const getUserInfo = () => {
  user = JSON.parse(localStorage.getItem('user')) || {}
  if (user.name) {
    form.querySelector('[name=name]').value = user.name
    form.querySelector('[name=team]').value = user.team
  }
}

const saveUserInfo = () => {
  localStorage.setItem('user', JSON.stringify(user))
}

const isBuzzAllowed = () =>  JSON.parse(localStorage.getItem('ready'));

const updateJoinForm = (isReset = false) => {
  if (isReset) {
    // reset game.. lets display JOIN form
    form.classList.remove('hidden')
    joined.classList.add('hidden')
    body.classList.remove('buzzer-mode')
  } else {
    // Joined.. lets play
    joinedInfo.innerText = `${user.name} on Team ${user.team}`
    buzzGroupInfo.innerText = `Hey ${user.name}, Please Buzz with correct option -"`
    form.classList.add('hidden')
    joined.classList.remove('hidden')
    body.classList.add('buzzer-mode')
    updateBuzzers(false);
  }
}

const buzzSound = () => {
  if (body.querySelector('[name=sound]').checked) {
    const buzzAudio = new Audio('./assets/buzz-sound-3.mp3');
    // play buzz sound if not muted
    buzzAudio.play();
  }
}

form.addEventListener('submit', (e) => {
  e.preventDefault()
  user.name = form.querySelector('[name=name]').value
  user.team = form.querySelector('[name=team]').value
  if (user.name && user.team) {
    if (!user.id) {
      user.id = Math.floor(Math.random() * new Date())
    }
    socket.emit('join', user)
    localStorage.setItem('ready', true);
    saveUserInfo()
    updateJoinForm()
  }
})

const handleBuzzEvent = (buzz , option) => {
  if (!isBuzzAllowed()) { return; }
  let isBuzzed = false;
  let optionSelected;
  // console.log(user.name, " buzzed!! -> option - ", option);
  [buzzer, buzzer2, buzzer3, buzzer4].some((btn, index) => {
    isBuzzed = btn.classList.contains('buzzed')
    optionSelected = index + 1;
    return isBuzzed;
  })
  if (isBuzzed) {
    // console.log(`You already buzzed with option ${optionSelected}!! Wait for buzzer reset!`);
    alert(`Heyy ${user.name}!!! You already buzzed with option ${optionSelected}!! Plz Wait for buzzer reset!`);
    return;
  }
  buzz.classList.add('buzzed')
  socket.emit('buzz', { user, option })
  buzzSound();
}

const resetBuzzers = () => {
  [buzzer, buzzer2, buzzer3, buzzer4].forEach((btn) => {
    btn.classList.remove('buzzed')
  })
}

const updateBuzzers = (isActivate) => {
  [buzzer, buzzer2, buzzer3, buzzer4].forEach((btn) => {
    btn.disabled = !isActivate;
    if (isActivate) { // activate Buzzers
      btn.classList.remove('buzzer-disabled');
    } else { // de-activate Buzzers
      btn.classList.add('buzzer-disabled');
    }
  })
}
// Socket listeners
socket.on('resetGame', () => {
  resetBuzzers();
  updateBuzzers(false);
  localStorage.clear();
  user = {};
  updateJoinForm(true)
  localStorage.setItem('ready', false);
})

socket.on('activateBuzzes', (isActivate) => {
  resetBuzzers();
  updateBuzzers(isActivate && isBuzzAllowed());
})

socket.on('clearBuzzes', () => {
  resetBuzzers();
})

// Buzz button handlers
buzzer.addEventListener('click', (e) => {
  handleBuzzEvent(buzzer, 1)
})
buzzer2.addEventListener('click', (e) => {
  handleBuzzEvent(buzzer2, 2)
})
buzzer3.addEventListener('click', (e) => {
  handleBuzzEvent(buzzer3, 3)
})
buzzer4.addEventListener('click', (e) => {
  handleBuzzEvent(buzzer4, 4)
})

getUserInfo()
