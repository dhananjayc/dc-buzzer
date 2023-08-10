const http = require('http')
const express = require('express')
const socketio = require('socket.io')

const app = express();
const server = http.Server(app);
const io = socketio(server);

const title = 'DC Buzzer App'

let data = {
  users: new Set(),
  members: new Set(),
  buzzes: new Set(),
}

let buzz_active = false

const getData = () => ({
  users: [...data.users],
  members: [...data.members],
  buzzes: [...data.buzzes].map(b => {
    const [ name, team, time ] = b.split('-')
    return { name, team, time }
  })
})

app.use(express.static('public'))
app.set('view engine', 'pug')

app.get('/', (req, res) => res.render('index', { title }))
app.get('/host', (req, res) => res.render('host', Object.assign({ title }, getData())))

io.on('connection', (socket) => {
  socket.on('join', (user) => {
    data.users.add(user.id)
    data.members.add(`${user.name} from Team ${user.team}`)
    io.emit('active', [...data.users].length)
    socket.emit('active', [...data.users].length)
    io.emit('members', [...data.members])
    socket.emit('members', [...data.members])
    console.log(`Log: ${user.name} joined!`)
  })

  socket.on('remove', (user) => {
    data.users.delete(user.id)
    io.emit('active', [...data.users].length)
    console.log(`Log: ${user.name} left.`)
  })

  socket.on('buzz', ({ user, option }) => {
    const dateObject = new Date();
    console.log('user?? ', user, ' option selected: ', option);
    // current hours
    const hours = dateObject.getHours();
    // current minutes
    const minutes = dateObject.getMinutes();
    // current seconds
    const seconds = dateObject.getSeconds();
    const time = `${hours}:${minutes}:${seconds}`
    // console.log(time);
    if (buzz_active) {
      // console.log('lets emit buzzes--- ',JSON.stringify(data.buzzes));
      if (data.users.has(user.id)) {
        if (data.buzzes.has(`${user.name}-${user.team}`)) {
          console.log(`Log: ${user.name} already buzzed in!`)
        } else {
          data.buzzes.add(`${user.name}-${user.team}-${time}-${option}`)
          io.emit('buzzes', [...data.buzzes])
          // console.log(`DC ? Log: ${[...data.buzzes]} buzzed so far!`)
          console.log(`DC ? Log: ${user.name} buzzed ${option}! on time - ${time}`)
        }
      } else {
        console.log(`Log: Old user '${user.name}' buzzed in! (not counted)`)
      }
    } else {
      console.log(`Log: ${user.name} is buzzing when deactivated.`)
    }
  })

  socket.on('clear', () => {
    data.buzzes.clear()
    io.emit('buzzes', [...data.buzzes])
    io.emit('activateBuzzes', true)
    console.log(`Log: Clear buzzes`)
  })

  socket.on('reset', () => {
    data.users.clear()
    data.members.clear()
    data.buzzes.clear()
    console.log([...data.users].length)
    io.emit('active', [...data.users].length)
    io.emit('buzzes', [...data.buzzes])
    io.emit('members', [...data.members])
    io.emit('activateBuzzes', false)
    console.log(`Log: Reset game`)
  })

  socket.on('activate', () => {
    console.log(`Debug: Activate buzzer from host ${socket.id}`)
    buzz_active = true
    io.emit('activateBuzzes', true)
  });

  socket.on('deactivate', () => {
    io.emit('activateBuzzes', false)
    console.log(`Debug: Deactivate buzzer from host ${socket.id}`)
    buzz_active = false
  });
})

server.listen(8090, () => console.log('Listening on 8090'))
