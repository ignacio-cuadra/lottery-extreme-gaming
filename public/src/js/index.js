window.onload = () => {
  // eslint-disable-next-line no-undef, no-unused-vars
  const app = new Vue({
    el: '#app',
    data: {
      contestantsInput: '',
      contestants: [],
      probabilisticContestants: [],
      historial: [],
      eliminatorInput: 1,
      eliminatorMode: 'mode1',
      step: 0,
      sounds: null,
      loading: true
    },
    mounted () {
      this.sounds = {
        bonk: new Audio('https://lottery-extreme-gaming.web.app/src/files/bonk.mp3'),
        double: new Audio('https://lottery-extreme-gaming.web.app/src/files/double.mp3'),
        triple: new Audio('https://lottery-extreme-gaming.web.app/src/files/triple.mp3'),
        quadra: new Audio('https://lottery-extreme-gaming.web.app/src/files/quadra.mp3'),
        penta: new Audio('https://lottery-extreme-gaming.web.app/src/files/penta.mp3'),
        win: new Audio('https://lottery-extreme-gaming.web.app/src/files/final-fantasy.mp3')
      }
      this.loading = false
    },
    methods: {
      load: function () {
        this.contestants = []

        this.probabilisticContestants = []
        this.contestantsInput.split('\n').forEach(strContestants => {
          const strc = strContestants.trim()
          if (strc === '') return
          this.probabilisticContestants.push(strc)
          const index = this.contestants.map(function (contestant) { return contestant.name }).indexOf(strc)
          if (index === -1) this.contestants.push({ name: strc, health: 1 })
          else this.contestants[index].health++
        })
        this.step = 1
      },
      remove () {
        const index = Math.floor(Math.random() * this.contestants.length)
        const index2 = this.probabilisticContestants.indexOf(this.contestants[index].name)
        this.probabilisticContestants.splice(index2, 1)
        this.contestants[index].health--
        if (this.contestants[index].health === 0) {
          this.historial.push({
            name: this.contestants[index].name,
            isDead: true
          })
          this.contestants.splice(index, 1)
          return true
        } else {
          this.historial.push({
            name: this.contestants[index].name,
            isDead: false
          })
        }
        return false
      },
      specialRemove () {
        let index = Math.floor(Math.random() * this.probabilisticContestants.length)
        const name = this.probabilisticContestants[index]
        this.probabilisticContestants.splice(index, 1)
        index = this.contestants.map(function (contestant) { return contestant.name }).indexOf(name)
        this.contestants[index].health--
        if (this.contestants[index].health === 0) {
          this.historial.push({
            name: this.contestants[index].name,
            isDead: true
          })
          this.contestants.splice(index, 1)
          return true
        } else {
          this.historial.push({
            name: this.contestants[index].name,
            isDead: false
          })
        }
        return false
      },
      eliminator: function () {
        let deadCount = 0
        let isDead
        for (let i = 0; i < parseInt(this.eliminatorInput); i++) {
          if (this.eliminatorMode === 'mode0') isDead = this.remove()
          if (this.eliminatorMode === 'mode1') isDead = this.specialRemove()
          if (this.contestants.length === 1) break
          if (isDead) deadCount++
        }

        if (this.contestants.length !== 1) {
          if (deadCount === 1) this.sounds.bonk.play()
          if (deadCount === 2) this.sounds.double.play()
          if (deadCount === 3) this.sounds.triple.play()
          if (deadCount === 4) this.sounds.quadra.play()
          if (deadCount === 5) this.sounds.penta.play()
        } else {
          this.sounds.win.play()
        }

        if (this.contestants.length === 1) {
          this.step = 2
        }
      },
      reset: function () {
        this.step = 0
        this.historial = []
      }

    }
  })
}
