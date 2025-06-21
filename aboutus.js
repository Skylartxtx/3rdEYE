// Index of the currently displayed image
let index = 0

// Number of images
let imageCount = document.querySelectorAll(
    ".carousel .container img"
).length

const bottom = document.querySelector(".carousel .bottom")
for (let i = 0; i < imageCount; i++) {
    // DOM manipulation
    // Knowledge point: https://3yya.com/courseware/chapter/162

    // Create the bottom buttons
    const indicator = document.createElement("div")
    indicator.classList.add("indicator")
    indicator.onclick = () => setIndex(i)

    bottom.append(indicator)
}

function createAuto() {
    return setInterval(() => {
        index++
        refresh()
    }, 3000)
}

// Auto scroll
let autoTimer = createAuto()

function refresh() {
    if (index < 0) {
        // When the index is less than 0
        // Set to the rightmost image
        index = imageCount - 1
    } else if (index >= imageCount) {
        // When the index exceeds the limit
        // Set to the leftmost image
        index = 0
    }

    // Get the carousel element
    let carousel = document.querySelector(".carousel")

    // Get the width of the carousel
    let width = getComputedStyle(carousel).width
    width = Number(width.slice(0, -2))

    carousel.querySelector(".container").style.left =
        index * width * -1 + "px"
}

let refreshWrapper = (func) => {
    // refresh decorator
    return function (...args) {
        let result = func(...args)
        refresh()

        // Reset auto scroll
        clearInterval(autoTimer)
        autoTimer = createAuto()
        return result
    }
}

let setIndex = refreshWrapper((idx) => {
    index = idx
})

refresh()