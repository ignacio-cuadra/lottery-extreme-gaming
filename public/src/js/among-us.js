/*
    Add fps functionalities
    EXPECTED_FPS
    fps
*/
const GAME_WIDTH = 640
const GAME_HEIGHT = 480
const contestants = []
const log = []
let gameStartTime = 0
let gameTime = 0
let gameTimeInterval = 0
let step1Pane
let step2Pane
let contestantsInput
let gamePanel
let eliminationTypeInput
let eliminationsAmountInput
let eliminateButton
let historialElement
let contestantsTableBodyElement
let resurrectButton
let winner
let sprites
let background
const SPRITE_WIDTH_IMAGE = 608
const debug = false

let firstEliminated = -1

const spriteFrames = {
  waiting: { x: 4, y: 1, width: 63, height: 80, colorDistance: 10 }, // 10
  moving: [
    { x: 0, y: 81, width: 68, height: 77, colorDistance: 8 }, // 8
    { x: 11, y: 158, width: 60, height: 74, colorDistance: 13 }, // 13
    { x: 16, y: 232, width: 61, height: 79, colorDistance: 12 }, // 12
    { x: 14, y: 311, width: 59, height: 74, colorDistance: 14 } // 14
  ],
  dead: { x: 17, y: 385, width: 60, height: 54, colorDistance: 13 }, // 13
  resurrect: { x: 20, y: 513, width: 60, height: 62, colorDistance: 13 }, // 13
  winner: { x: 16, y: 439, width: 69, height: 73, colorDistance: 4 } // 4
}

const messagesForFailWinner = [
  'De todas formas no se lo merecía',
  'Celebró demaciado pronto',
  'No eres tu, soy yo',
  'Tampoco es que fuera un gran premio'
]

const messagesForWinner = [
  'Este sorteo está arreglado',
  '¿En serio? ¿Ganó ese?',
  'Pensé que sería el primero en morir',
  'Bueno... algo que gane en la vida',
  '¿Ganaba el mas tonto?',
  'Apreta resucitar rapido!!!'
]

const messagesForResurrect = [
  'Un virús zombie lo ha resucitado',
  'El nuevo profeta ha resucitado',
  'Es el elegido. Ha resucitado',
  'Solo se hacía el muerto',
  'No lo aguantarón ni en el cielo ni en el infierno',
  'No me esperaba menos de una cucaracha',
  'Está vivo, pero no veas como huele',
  'No estaba muerto, solo era feo'
]

const messagesForDead = [
  'Se le olvidó respirar y murió',
  'Miró al sol durante un eclipse solar y murió',
  'No tomó dos litros de agua al día y murió',
  'No se cubrió con las sabanas hasta la cabeza y murió',
  'Era antivacunas... no lo extrañaremos',
  'Le dió covid y murió',
  'Ya no tendremos que compartir oxigeno con este inútil'
]
const messagesForTheLiving = [
  'Un tropiezo menor. ¿Quien necesita los dos brazos?',
  'Viajó al sol, pero era de noche',
  'Si había suficiente espacio para los dos en la tabla',
  'Se suscribió y puso a me gusta a este canal',
  'Esquivó la chancla',
  'Tiene mas vidas que un gato'
]

function truncateText (str, n) {
  return (str.length > n) ? str.substr(0, n - 1) + '...' : str
}

class Contestant {
  constructor (name, health) {
    this.name = name
    this.health = health
    this.state = 'IDDLE'
    this.dimensions = { width: 32, height: 32 }
    this.position = {
      x: Math.floor(Math.random() * (GAME_WIDTH - this.dimensions.width)),
      y: Math.floor(Math.random() * (GAME_HEIGHT - this.dimensions.height))
    }
    this.waitCounter = 2
    this.idealPosition = { x: 0, y: 0 }
    this.speed = 100
    this.timeoutStart = 0
    this.timeout = 0
    this.wasWinner = false
    this.color = Math.floor(Math.random() * 7)
    this.direction = 1
    this.drawPriority = 0
  }

  render (context) {
    this.drawPriority = this.position.y
    if (this.state === 'DEAD') this.drawPriority -= GAME_HEIGHT
    if (debug) {
      if (this.state === 'IDDLE') context.fillStyle = 'blue'
      if (this.state === 'MOVING') context.fillStyle = 'green'
      if (this.state === 'WAITING') context.fillStyle = 'yellow'
      if (this.state === 'DEAD') context.fillStyle = 'red'
      if (this.state === 'WINNER') context.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)}, ${Math.floor(Math.random() * 256)})`
      if (this.state === 'RESURRECT') context.fillStyle = 'purple'
      context.fillRect(this.position.x, this.position.y, 32, 32)
    }
    if (!debug) {
      let tmpSpriteFrame
      if (this.state === 'IDDLE') tmpSpriteFrame = spriteFrames.waiting
      if (this.state === 'MOVING' || this.state === 'WINNER') {
        tmpSpriteFrame = spriteFrames.moving[Math.floor(this.movingSprite) % spriteFrames.moving.length]
        this.movingSprite += 0.2
      }
      if (this.state === 'WAITING' && this.waitCounter < 2) tmpSpriteFrame = spriteFrames.waiting
      if (this.state === 'WAITING' && this.waitCounter > 1) tmpSpriteFrame = spriteFrames.winner
      if (this.state === 'DEAD') tmpSpriteFrame = spriteFrames.dead
      if (this.state === 'WINNER' &&
                this.position.x === GAME_WIDTH / 2 - this.dimensions.width / 2 &&
                this.position.y === GAME_HEIGHT / 2 - this.dimensions.height / 2) tmpSpriteFrame = spriteFrames.winner

      if (this.state === 'RESURRECT') tmpSpriteFrame = spriteFrames.resurrect
      // tmpSpriteFrame = spriteFrames.waiting
      // context.translate(this.position.x, this.position.y)
      context.save()
      context.translate(SPRITE_WIDTH_IMAGE, 1)
      context.scale(this.direction, 1)
      context.drawImage(sprites,
        tmpSpriteFrame.x + (87 * this.color),
        tmpSpriteFrame.y,
        tmpSpriteFrame.width,
        tmpSpriteFrame.height,
        (this.direction === -1) ? SPRITE_WIDTH_IMAGE - tmpSpriteFrame.width / 2 - this.position.x : this.position.x - SPRITE_WIDTH_IMAGE, // - 608
        this.position.y,
        tmpSpriteFrame.width / 2,
        tmpSpriteFrame.height / 2)
      context.restore()
    }
    if (this.state !== 'DEAD') {
      context.font = '10pt Courier New'
      context.lineWidth = 3
      context.strokeStyle = 'black'
      context.fillStyle = 'white'
      context.textAlign = 'center'
      context.strokeText(truncateText(this.name, 15), this.position.x + 16, this.position.y + 52)
      context.fillText(truncateText(this.name, 15), this.position.x + 16, this.position.y + 52)
    }

    // context.fillStyle = "red"
    // context.fillRect(this.idealPosition.x, this.idealPosition.y, 16, 16)
  }

  process () {
    if (this.health <= 0 && this.state !== 'RESURRECT') {
      this.state = 'DEAD'
    }
    if (this.state === 'MOVING') {
      this.move()
    }
    if (this.state === 'WAITING') {
      this.wait()
    } else if (this.state !== 'IDDLE') {
      this.waitCounter = 0
    }
    if (this.state === 'WINNER') {
      if (this.position.x !== GAME_WIDTH / 2 - this.dimensions.width / 2 &&
            this.position.y !== GAME_HEIGHT / 2 - this.dimensions.height / 2) {
        this.move()
      }
    }
    if (this.state === 'IDDLE') {
      if (Math.random() <= 0.8) {
        this.startMovement()
      } else {
        this.startWait()
      }
    }
  }

  startMovement () {
    this.state = 'MOVING'
    this.movingSprite = 0
    let targetDistance = 0
    do {
      this.idealPosition.x = Math.floor(Math.random() * (GAME_WIDTH - this.dimensions.width))
      this.idealPosition.y = Math.floor(Math.random() * (GAME_HEIGHT - this.dimensions.height))
      targetDistance = Math.sqrt(Math.pow(Math.abs(this.position.x - this.idealPosition.x), 2) +
            Math.pow(Math.abs(this.position.y - this.idealPosition.y), 2))
    } while (targetDistance < 10)
  }

  startWait () {
    this.waitCounter++
    this.state = 'WAITING'
    this.timeoutStart = gameTime
    this.timeout = (1 + Math.random() * 2) * 1000
  }

  startWinner () {
    this.state = 'WINNER'
    this.wasWinner = true
    this.movingSprite = 0
    this.idealPosition.x = GAME_WIDTH / 2 - this.dimensions.width / 2
    this.idealPosition.y = GAME_HEIGHT / 2 - this.dimensions.height / 2
  }

  startResurrect () {
    this.state = 'RESURRECT'
    this.wasWinner = true
  }

  startDead () {
    this.state = 'DEAD'
  }

  move () {
    const targetDistance = Math.sqrt(Math.pow(Math.abs(this.position.x - this.idealPosition.x), 2) +
            Math.pow(Math.abs(this.position.y - this.idealPosition.y), 2))

    if ((this.speed * (gameTimeInterval / 1000)) >= targetDistance) {
      this.position.x = this.idealPosition.x
      this.position.y = this.idealPosition.y
      if (this.state !== 'WINNER') this.state = 'IDDLE'
      return
    }

    const percentDistance = 1 / (targetDistance / (this.speed * (gameTimeInterval / 1000)))
    const tmpX = (this.idealPosition.x - this.position.x) * percentDistance
    const tmpY = (this.idealPosition.y - this.position.y) * percentDistance
    if (tmpX < 0) this.direction = -1
    else this.direction = 1
    this.position.x += tmpX
    this.position.y += tmpY
  }

  wait () {
    if (gameTime >= this.timeoutStart + this.timeout) {
      this.state = 'IDDLE'
    }
  }
}

function process () {
  contestants.forEach(contestant => {
    contestant.process()
  })
}

function render (context) {
  context.beginPath()
  context.fillStyle = 'black'
  context.fillRect(0, 0, 640, 480)
  context.drawImage(background, 0, 0)
  const tmpContestants = [...contestants].sort(function (a, b) {
    return a.drawPriority - b.drawPriority
  })
  tmpContestants.forEach(contestant => {
    contestant.render(context)
  })
}

// eslint-disable-next-line no-unused-vars
function resurrect () {
  contestants[winner].health = 0
  contestants[winner].startDead()
  log.push({
    index: winner,
    name: contestants[winner].name,
    message: messagesForFailWinner[Math.floor(Math.random() * messagesForFailWinner.length)],
    state: 'fail-winner'
  })
  const tmpReverseLog = log.slice().reverse()
  for (let index = 0; index < tmpReverseLog.length; index++) {
    if (!contestants[tmpReverseLog[index].index].wasWinner) {
      winner = tmpReverseLog[index].index
      contestants[tmpReverseLog[index].index].startResurrect()
      log.push({
        index: tmpReverseLog[index].index,
        name: contestants[tmpReverseLog[index].index].name,
        message: messagesForResurrect[Math.floor(Math.random() * messagesForResurrect.length)],
        state: 'resurrect'
      })
      break
    }
  }
  if (winner === firstEliminated) resurrectButton.style.display = 'none'
  updateLogView()
  updateContestantsList()
}

function eliminate () {
  const eliminationsAmount = parseInt(eliminationsAmountInput.value)
  const liveContestants = []
  const tmpHealthList = []
  contestants.forEach(function (contestant) {
    if (contestant.health > 0) liveContestants.push(contestant)
    for (let l = 0; l < contestant.health; l++) {
      tmpHealthList.push(contestant.name)
    }
  })
  for (let i = 0; i < eliminationsAmount; i++) {
    if (liveContestants.length <= 1) break
    let liveContestantIndex
    let name
    if (eliminationTypeInput.value === 'HEALTH_DELETING') {
      const eliminateIndex = Math.floor(Math.random() * tmpHealthList.length)
      name = tmpHealthList[eliminateIndex]
      liveContestantIndex = liveContestants.map(function (contestant) { return contestant.name }).indexOf(name)
      tmpHealthList.splice(eliminateIndex, 1)
    } else if (eliminationTypeInput.value === 'NAME_DELETING') {
      liveContestantIndex = Math.floor(Math.random() * liveContestants.length)
    }

    name = liveContestants[liveContestantIndex].name
    const contestantIndex = contestants.map(function (contestant) { return contestant.name }).indexOf(name)

    liveContestants[liveContestantIndex].health--

    if (liveContestants[liveContestantIndex].health > 0) {
      // Sigue vivo!
      log.push({
        index: contestantIndex,
        name,
        message: messagesForTheLiving[Math.floor(Math.random() * messagesForTheLiving.length)],
        state: 'alive'
      })
    } else {
      // Está muerto
      liveContestants.splice(liveContestantIndex, 1)
      if (firstEliminated === -1) firstEliminated = contestantIndex
      log.push({
        index: contestantIndex,
        name,
        message: messagesForDead[Math.floor(Math.random() * messagesForDead.length)],
        state: 'dead'
      })
    }
    if (liveContestants.length === 1) {
      const contestantIndex = contestants.map(function (contestant) { return contestant.name }).indexOf(liveContestants[0].name)
      contestants[contestantIndex].startWinner()
      log.push({
        index: contestantIndex,
        name: contestants[contestantIndex].name,
        message: messagesForWinner[Math.floor(Math.random() * messagesForDead.length)],
        state: 'winner'
      })
      winner = contestantIndex
      eliminateButton.style.display = 'none'
      resurrectButton.style.display = 'block'
    }
  }
  updateLogView()
  updateContestantsList()
}

function updateContestantsList () {
  const tmpContestants = [...contestants].sort(function (a, b) { return b.health - a.health })
  contestantsTableBodyElement.innerHTML = ''
  tmpContestants.forEach(function (contestant) {
    contestantsTableBodyElement.innerHTML +=
        `<tr>
            <td>${contestant.name}</td>
            ${(contestant.health > 0) ? `<td>${(contestant.health < 6) ? '<i class = "fas fa-heart"></i>'.repeat(contestant.health) : `<i class = "fas fa-heart"></i>x${contestant.health}`}</td>` : ''}
            ${(contestant.health <= 0) ? '<td><i class = "fas fa-skull-crossbones"></i></td>' : ''}
        </tr>`
  })
}

function updateLogView () {
  historialElement.innerHTML = ''
  log.slice().reverse().forEach(function (log) {
    historialElement.innerHTML +=
        `<div class = "historial-item">
            <div>
                <span>${log.name}</span>
                ${(log.state === 'alive') ? '<i class="ml-2 fas fa-heart-broken"></i>' : ''}
                ${(log.state === 'dead') ? '<i class = "ml-2 fas fa-skull-crossbones"></i>' : ''}
                ${(log.state === 'winner') ? '<i class = "ml-2 fas fa-trophy"></i>' : ''}
                ${(log.state === 'resurrect') ? '<i class = "ml-2 fas fa-biohazard"></i>' : ''}
                ${(log.state === 'fail-winner') ? '<i class = "ml-2 fas fa-dizzy"></i>' : ''}
            </div>
            <small>${log.message}</small>
        </div>`
  })
}

// eslint-disable-next-line no-unused-vars
function loadContestants () {
  const contestantsInputArray = contestantsInput.value.split('\n')

  contestantsInputArray.forEach(contestantInput => {
    if (contestantInput.trim() === '') return
    const contestantIndex = contestants.map(function (contestant) { return contestant.name }).indexOf(contestantInput.trim())
    if (contestantIndex === -1) {
      contestants.push(new Contestant(contestantInput.trim(), 1))
    } else {
      contestants[contestantIndex].health++
    }
  })

  if (contestantsInputArray.length < 2) {
    document.getElementById('error').style.opacity = 1
    return
  }
  document.getElementById('error').style.opacity = 0

  step1Pane.style.display = 'none'
  step2Pane.style.display = 'flex'
  updateLogView()
  updateContestantsList()
  startGame()
}

function startGame () {
  const gameContext = gamePanel.getContext('2d')
  gameStartTime = performance.now()
  setInterval(function () {
    gameTimeInterval = -gameTime
    gameTime = performance.now() - gameStartTime
    gameTimeInterval += gameTime
    process(contestants)
    render(gameContext, contestants)
  }, 14)
}

function main () {
  /* contestants.push(new Contestant("Nacho", 3))
    contestants.push(new Contestant("José", 6))
    contestants.push(new Contestant("Char's Extreme Gaming", 2))
    contestants.push(new Contestant("Drieh", 1))
    contestants.push(new Contestant("Junito Gamer", 3))
    contestants.push(new Contestant("Pepe", 1))
    contestants.push(new Contestant("Santiago", 3))

    contestants.push(new Contestant("Nacho'", 3))
    contestants.push(new Contestant("José'", 6))
    contestants.push(new Contestant("Char's Extreme Gaming'", 2))
    contestants.push(new Contestant("Drieh'", 1))
    contestants.push(new Contestant("Junito Gamer'", 3))
    contestants.push(new Contestant("Pepe'", 1))
    contestants.push(new Contestant("Santiago'", 3)) */

  step1Pane = document.getElementById('step-1')
  step2Pane = document.getElementById('step-2')
  contestantsInput = document.getElementById('contestants-input')
  gamePanel = document.getElementById('game')
  eliminationTypeInput = document.getElementById('elimination-type-input')
  eliminationsAmountInput = document.getElementById('eliminations-amount-input')
  eliminateButton = document.getElementById('eliminate')
  resurrectButton = document.getElementById('resurrect')
  historialElement = document.getElementById('historial')
  contestantsTableBodyElement = document.getElementById('contestants-table-body')
  sprites = document.getElementById('sprites')
  background = document.getElementById('background')
}

window.addEventListener('load', function () {
  main()
  eliminate()
})
