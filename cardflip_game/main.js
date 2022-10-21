const GAME_STATE = {
  FirstCardAwaits: "FirstCardAwaits",
  SecondCardAwaits: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const Symbols = [
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
  'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
]


const view = {
  getCardElement(index) {
    // 卡片背面
    // 預設渲染是卡片背面，須將index綁定在此，才能在點擊卡片時，透過event target回傳給後端程式做運算
    return `
      <div data-index="${index}" class="card back">
      </div>
    `
  },

  getCardContent(index) {
    // 卡片正片（數字＆花色）
    // 卡片數字
    const number = this.transformNumber((index % 13) + 1)
    // 卡片花色
    const symbol = Symbols[Math.floor(index / 13)]

    return `<p>${number}</p>
        <img src="${symbol}">
        <p>${number}</p>`

  },

  flipCards(...cards) {
    cards.map(card => {
      if (card.classList.contains('back')) {
        // 回傳正面
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(Number(card.dataset.index))
        return
      }
      // 回傳背面
      card.classList.add('back')
      card.innerHTML = null //清空牌面內容，否則轉回背面後，數字仍會留著
    })
  },

  transformNumber(number) {
    switch (number) {
      case 1:
        return 'A'
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      default:
        return number
    }

  },

  displayCards(indexes) {
    const rootElement = document.querySelector('#cards')
    rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('')
  },

  // 卡片配對成功時
  pairCards(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  // 計分
  renderScore(score) {
    document.querySelector(".score").textContent = `Score: ${score}`;
  },

  // 點擊次數
  renderTriedTimes(times) {
    document.querySelector(".tried").textContent = `You've tried: ${times} times`;
  },

  // animation
  appendWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')

      // 當點選後，要讓影格消失
      // once:要求在事件執行一次之後，就要卸載這個監聽器
      card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true })
    })
  },

  // Game finished
  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>Complete!</p>
      <p>Score: ${model.score}</p>
      <p>You've tried: ${model.triedTimes} times</p>
    `
    const header = document.querySelector('#header')
    header.before(div)
  }


}
// 洗牌演算法 Fisher-Yales Shuffle 
const utility = {
  getRandomNumberArray(count) {
    const number = Array.from(Array(count).keys())
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index + 1))
        ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}


const controller = {
  currentState: GAME_STATE.FirstCardAwaits,  // 加在第一行
  generateCards() {
    view.displayCards(utility.getRandomNumberArray(52))
  },

  dispatchCardAction(card) {
    // 如果已經是卡背，就不理他
    if (!card.classList.contains('back')) {
      return
    }
    switch (this.currentState) {
      case GAME_STATE.FirstCardAwaits:
        view.renderTriedTimes(++model.triedTimes) //嘗試次數+1
        view.flipCards(card) //翻牌
        model.revealedCards.push(card) //將卡片放進reveledCards array
        this.currentState = GAME_STATE.SecondCardAwaits //變更狀態
        break
      case GAME_STATE.SecondCardAwaits:
        view.flipCards(card) //翻牌
        model.revealedCards.push(card) // 將卡片放進reveledCards array
        // 判斷配對是否成功
        if (model.isRevealedCardsMatched()) {
          // 配對成功
          view.renderScore(model.score += 10) //配對成功+10分
          this.currentState = GAME_STATE.CardsMatched //變更狀態
          view.pairCards(...model.revealedCards) // 翻牌改變
          model.revealedCards = [] //清空data

          // game finished
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }

          this.currentState = GAME_STATE.FirstCardAwaits //變更狀態
        } else {
          // 配對失敗
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appendWrongAnimation(...model.revealedCards)
          // 給予時間(1000毫秒)轉回背面(呼叫resetCards function)
          setTimeout(this.resetCards, 1000)
        }
        break
    }
    console.log('this.currentState', this.currentState)
    console.log('revealedCards', model.revealedCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealedCards)
    model.revealedCards = []
    controller.currentState = GAME_STATE.FirstCardAwaits
  }

}


const model = {
  revealedCards: [],
  // 卡片matched
  isRevealedCardsMatched() {
    return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13
  },
  score: 0,
  triedTimes: 0

}




controller.generateCards()

// Node list (array-like),所以用forEach,不能用map
// 翻牌
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', event => {
    controller.dispatchCardAction(card)
  })
})


