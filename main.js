import "./style.css"
import Toastify from 'toastify-js'
let board = document.querySelector("#board");
let message = document.querySelector("#message");
let keys = "QWERTYUIOPASDFGHJKLZXCVBNM".split("");
let restartBtn = document.querySelector("#restart-btn");
let showBtn = document.querySelector("#show-btn");
showBtn.setAttribute("disabled", "true");
keys.push("Backspace");
let keyboard = document.querySelector(".keyboard");
let boardContent = [
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0],
];
let currentRow = 0;
let currentBox = 0;
let secretWord;



for (let i = 0; i <= 5; i++) {
    let row = document.createElement('div')
    for (let y = 0; y <= 4; y++) {
        let box = document.createElement('span');
        row.appendChild(box);
        row.className = `row-${i + 1}`
    }
    board.appendChild(row);
}


keys.forEach(entry => {
    let key = document.createElement("button");
    if (entry === "*") {
        key.innerText = "Backspace";
    } else {
        key.innerText = entry;
    }
    key.className = "key"
    key.setAttribute("data-key", entry.toUpperCase());
    key.addEventListener("click", () => {
        insertKey(entry.toUpperCase())
        setTimeout(() => {
            document.querySelector(`button[data-key=${entry.toUpperCase()}]`).blur();
        }, 250)
    })
    keyboard.append(key);
})


function getNewWord() {
    async function fetchWord() {
        try {
            const response = await fetch("https://random-word-api.herokuapp.com/word?length=5");
            if (response.ok) {
                const data = await response.json();
                return data;
            } else {
                throw new Error("Something went wrong!")
            }
        } catch (error) {
            message.innerText = `Something went wrong. \n${error}\nCheck your internet connection.`;
        }
    }

    fetchWord().then(data => {
        secretWord = data[0].toUpperCase();
        main();
    })

}

function main() {
    let rows = [...document.querySelectorAll('div')].filter(x => x.className.includes("row-"));
    let boxes = [];
    rows.forEach(row => [...row.children].forEach(child => boxes.push(child)))
    boxes.forEach((box) => {
        box.classList.add("empty");
    })
    message.style.display = "none";

    window.addEventListener('keyup', (e) => {
        if (isValidCharacter(e.key)) {
            document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).focus();
            document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).click();
            setTimeout(() => {
                document.querySelector(`button[data-key=${e.key.toUpperCase()}]`).blur();
            }, 250)
        }
    })

    showBtn.addEventListener('click', () => {
        Toastify({
            text: `Alright fine! the answer is ${secretWord}`,
            duration: 2500,
            className: "alert",
        }).showToast();
    })

    restartBtn.addEventListener('click', () => {
        location.reload();
    })
    function isValidCharacter(val) {
        return (val.match(/^[a-zA-Z]+$/) && (val.length === 1 || val === "Backspace"))
    }
}

function renderBox(row, box, data) {
    [...document.querySelector(`.row-${row}`).children][box].innerText = data;
}


function insertKey(key) {
    if (key === "Backspace".toUpperCase() && currentRow < boardContent.length) {
        boardContent[currentRow][currentBox] = 0;
        if (currentBox !== 0) {
            currentBox--;
            renderBox(currentRow + 1, currentBox, "");
        }
    } else {
        if (currentRow < boardContent.length) {
            boardContent[currentRow][currentBox] = key;
            renderBox(currentRow + 1, currentBox, key);
            currentBox++;
        }
        if (currentRow < boardContent.length && boardContent[currentRow][currentBox] !== 0) {
            evaluate(currentRow, key);
            currentBox = 0;
            currentRow++;
        }
    }
}

function evaluate(row) {
    if (currentRow === 4) {
        showBtn.removeAttribute('disabled')
    }
    let guess = boardContent[row].join('').toUpperCase();
    let answer = secretWord.split("");
    let colors = guess
        .split("")
        .map((letter, idx) => letter == answer[idx] ? (answer[idx] = false) : letter)
        .map((letter, idx) =>
            letter
                ? (idx = answer.indexOf(letter)) < 0
                    ? "grey"
                    : (answer[idx] = "yellow")
                : "green"
        );
    setColor(colors);
    function setColor(colors) {
        // Set the keyboard key color
        colors.forEach((color, index) => {
            document.querySelector(`button[data-key=${guess[index].toUpperCase()}]`).style.backgroundColor = color;
            [...document.querySelector(`.row-${row + 1}`).children][index].style.backgroundColor = color;
        })
    }
}

getNewWord();