discordCache = []
movieHTML = ""
movieList = []
movieRatingNumber = []
movieRatingPercent = []
movieRatingSize = []
commentList = []

// Grab comments and put into variable
$.getJSON('/json/discord.json', function (data) {
    discordCache = data
}).then(function () {
    $.getJSON('/json/comments.json', function (data) {
        commentList = data
    }).then(function () {
        $.getJSON('/json/movies.json', function (data) {
            movieList = data

            // Get rating information of each movie
            data.movies.forEach(movie => {
                let parsedTitle = parseTitle(movie.title)
                movieRatingNumber[parsedTitle] = getRatingNumber(movie, commentList)
                movieRatingPercent[parsedTitle] = getRatingPercent(movie, commentList)
                movieRatingSize[parsedTitle] = getRatingSize(movie, commentList)
            })

            let upcomingHTML = ""
            data.movies.forEach(movie => {
                if (movie.upcoming == true) {
                    upcomingHTML = ""
                    upcomingHTML +=
                        `<div class="info">
                    <h1>NEXT UPCOMING MOVIE</h1>
                    <h2>${movie.title.replace(/\[IRL]|\[CRACK]/, '')}</h2>
                    <h3>${movie.date}</h3>
                    <p>If you want to join us for movie night, make sure you have the movie night role in the #information channel.</p>`
                    if (movie.title.startsWith("[IRL]")) upcomingHTML += `<h6 class="irl">IN REAL LIFE</h6></div>`
                    else if (movie.title.startsWith("[CRACK]")) upcomingHTML += `<h6 class="crack">CRACK NIGHT</h6></div>`
                    else upcomingHTML += `</div>`
                    document.querySelector("#upcoming-movie").style.backgroundImage = `url(${movie.poster})`
                }
            })
            document.getElementById("upcoming-movie").innerHTML = upcomingHTML
        }).then(function () {
            loadMovies("ALL")
        })
    })
})

// Load the movies the user asks for
function loadMovies(type) {
    movieList.movies.forEach(function (item, index) {
        let parsedTitle = parseTitle(item.title)
        if (item.title == "@DIV") movieHTML += `<div class="old-movies">OLD MOVIES</div>`
        else {
            movieHTML += // Start of movie HTML
                `<div class="movie-box" id="movie-${parsedTitle}"><div class="movie-img-box">
                <img src="${item.poster}" />`

            // Custom movie tags
            if (item.upcoming == true) movieHTML += `<h3 class="upcoming">UPCOMING</h3>`
            else if (item.title.startsWith("[IRL]")) movieHTML += `<h3 class="irl">IRL</h3>`
            else if (item.title.startsWith("[CRACK]")) movieHTML += `<h3 class="crack">CRACK NIGHT</h3>`

            movieHTML += // End of movie HTML
                `<div class="movie-stars-box"><div class="movie-stars-outer"><div class="movie-stars-inner" style="width: ${movieRatingPercent[parsedTitle]}%;"></div></div><div class="movie-stars-rating">(${movieRatingNumber[parsedTitle]})</div></div>
                <div class="movie-img-overlay" onclick=""><h1>${item.title.replace(/\[IRL]|\[CRACK]/, '')}<br><span class="date">${item.date}</span></h1><a class="comments" onclick="openComments('${parsedTitle}')">VIEW ${movieRatingSize[parsedTitle]} COMMENTS</a></div></div></div >`
        }
    })
    // <a class="download" href="download/${parsedTitle}">DOWNLOAD</a>
    document.getElementById("movies").innerHTML = movieHTML

    // Smoothly fade in all movies with delay
    movieList.movies.forEach(function (item, index) {
        setTimeout(function () {
            $(`#movie-${parseTitle(item.title)}`).fadeIn(500)
        }, 50 * index)
    })
}

function parseTitle(title) {
    return title.replace(/[ "'`*!?.,:;@&\[\]]/g, "")
}

function getRatingNumber(movie, com) {
    let size = 0
    let total = 0
    com.comments.forEach(function (item, index) {
        if (movie.title == item.movie) {
            size++
            total += (item.rating)
        }
    })
    let rating = (total / size).toFixed(1)
    if (isNaN(rating) == true) return "0"
    else return (rating)
}

function getRatingPercent(movie, com) {
    let size = 0
    let total = 0
    com.comments.forEach(function (item, index) {
        if (movie.title == item.movie) {
            size++
            total += (item.rating)
        }
    })
    let percent = (((total / size) / 5) * 100)
    if (isNaN(percent) == true) return "0"
    else return (percent)
}

function getRatingSize(movie, com) {
    let size = 0
    com.comments.forEach(function (item, index) {
        if (movie.title == item.movie) size++
    })
    return (size)
}

function openComments(movie) {
    let commentsHTML = ""
    movieList.movies.forEach(function (item, index) {
        let rawTitle = item.title
        let parsedTitle = parseTitle(item.title)
        if (parsedTitle == movie) {
            commentsHTML +=
                `<div class="comments-container">
                <div class="comments-header-container">
                <h1>${item.title.replace(/\[IRL]|\[CRACK]/, '')} - ${movieRatingSize[parsedTitle]} Comments</h1><a onclick="closeComments()">&times;</a></div>
                <div class="comments-info-container"><img src="${item.poster}" />
                <div class="comments-stars-box"><div class="comments-stars-outer"><div class="comments-stars-inner" style="width: ${movieRatingPercent[parsedTitle]}%;"></div></div><div class="comments-stars-rating">(${movieRatingNumber[parsedTitle]})</div></div></div>
                <div class="comments-reviews-container">`
            if (movieRatingSize[parsedTitle] == 0) commentsHTML += `<h1 class="no-comments">There are no comments on this movie.</h1>`
            else commentList.comments.forEach(function (item, index) {
                if (item.movie != rawTitle) return
                let name = item.name
                let image = "/images/profile.png"
                discordCache.users.forEach(user => {
                    if (item.id == user.id) {
                        if (user.nickname == null) name = user.name
                        else name = user.nickname
                        image = user.image
                    }
                })
                commentsHTML +=
                    `<div class="comments-review-box">
                    <img src='${image}'" />
                    <h1>${name}</h1>
                    <div class="comments-review-stars-box"><div class="comments-review-stars-outer"><div class="comments-review-stars-inner" style="width: ${item.rating * 20}%;"></div></div><div class="comments-review-stars-rating">(${item.rating})</div></div>
                    <p><br>${item.comment}</p></div>`
            })
            commentsHTML += `</div></div>`
        }
    })
    document.getElementById("comments").innerHTML = commentsHTML
    $("#comments").fadeIn(200)
    setTimeout(function () {
        $("#overlay").fadeIn(200)
    }, 200)
}

function closeComments() {
    $("#overlay").fadeOut(300)
    $("#comments").fadeOut(300)
}

document.querySelector("#overlay").addEventListener('click', () => {
    closeComments()
})

document.addEventListener("keydown", (e) => {
    if (e.key == "Escape") closeComments()
});