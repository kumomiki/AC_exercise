const BASE_URL = 'https://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []
let filteredMovies = []

const dataPanel = document.querySelector('#data-panel')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')

const MOVIE_PER_PAGE = 12
const paginator = document.querySelector('#paginator')



// add movies to favorite
function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteMovies')) || []

  const movie = movies.find((movie) => movie.id === id)
  if (list.some((movie) => movie.id === id)) {
    return alert('此電影已經在收藏清單中！')
  }
  list.push(movie)
  console.log(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(list))
}

// pagination
function getMoviesByPage(page) {
  // 如果搜尋清單有東西，就取搜尋清單 filteredMovies，否則就還是取總清單 movies
  const data = filteredMovies.length ? filteredMovies : movies


  // page 1: 0-11
  // page 2: 12-23
  // page 3: 24-35
  // start index
  const startIndex = (page - 1) * MOVIE_PER_PAGE
  // 回傳切割後的新陣列
  return data.slice(startIndex, startIndex + MOVIE_PER_PAGE)
}

// render pagination
function renderPaginator(amount) {
  // 80部電影 / 每一頁12部 = 6....8 => 需要7頁
  const numberOfPages = Math.ceil(amount / MOVIE_PER_PAGE)
  // 製作template
  let rawHTML = ''

  // 中間用for loop循環
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`

  }

  paginator.innerHTML = rawHTML

}

// 監聽paginator
paginator.addEventListener('click', function onPaginatorClicked(event) {
  // 先確保若按到的不是<a>，則結束函式
  if (event.target.tagName !== 'A') return

  // 透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)

  // 更新畫面
  renderMovieList(getMoviesByPage(page))

})





// 監聽 data panel
dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    showMovieModal(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})




function renderMovieList(data) {
  let rawHTML = ''

  data.forEach(item => {
    rawHTML +=
      `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img src="${POSTER_URL + item.image
      }" class="card-img-top" alt="Movie Poster">
        <div class="card-body">
          <h5 class="card-title">${item.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${item.id}">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${item.id}">+</button>
        </div>
      </div>
    </div>
  </div>`
  })

  dataPanel.innerHTML = rawHTML
}


function showMovieModal(id) {
  // title, data, image, description
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')

  axios
    .get(INDEX_URL + id)
    .then(response => {
      const data = response.data.results
      modalTitle.innerText = data.title
      modalImage.innerHTML = `<img src="${POSTER_URL + data.image
        }" alt="movie-poster" class="img-fluid">`
      modalDate.innerText = 'Release Date:' + data.release_date
      modalDescription.innerText = data.description
    })
}

// search from function
searchForm.addEventListener('submit', function onSubmitFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  // if (!keyword.length) {
  //   return alert('請輸入有效字串！')
  // }
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  )


  //錯誤處理：無符合條件的結果
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`)
  }

  //重製分頁器
  renderPaginator(filteredMovies.length)

  //預設顯示第 1 頁的搜尋結果
  renderMovieList(getMoviesByPage(1))

})




axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results)
    renderPaginator(movies.length)
    renderMovieList(getMoviesByPage(1))

  })
  .catch((err) => console.log(err))