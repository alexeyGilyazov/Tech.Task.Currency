const rates = {}
const newRates = {}
const ratesValute = document.querySelector('.rates__valute')
const time = document.getElementById('nowTime')
const input = document.querySelector('#input')
const select = document.querySelector('#select')
const result = document.querySelector('#result')
const saveExchangeBtn = document.getElementById('saveExchange')
let historyExchange = localStorage.getItem('userExchange') ? JSON.parse(localStorage.getItem('userExchange')) : []
const historyList = document.getElementById('historyList')
const deleteFromHistory = document.getElementById('deleteFromHistory')
const table = document.querySelector('#table tbody')

const copyTable = document.querySelector('#table tbody')

function copyTables() {
    return copyTable
}

getCurrencies()
async function getCurrencies() {
    const response = await fetch(`https://www.cbr-xml-daily.ru/daily_json.js`)
    const data = await response.json()
    const result = await data;

    rates.USD = result.Valute.USD.Value.toFixed(2)
    rates.GBP = result.Valute.GBP.Value.toFixed(2)
    rates.EUR = result.Valute.EUR.Value.toFixed(2)

    Object.entries(rates).map(item => ratesValute.innerHTML += `<div class="rates__valute_item" data-value="">Rates ${item[0]} : ${item[1]}</div>`)

    const allRates = result.Valute
    renderListValute(allRates)
}

function renderListValute(obj) {

    renderHeaderForTable()

    for (const currency in obj) {
        let tableRow = document.createElement('tr')
        let name = document.createElement('td')
        let nameCurrnecy = document.createElement('td')
        let actualCurrnecy = document.createElement('td')
        actualCurrnecy.classList.add('sortValue')
        let prevCurrnecy = document.createElement('td')
        name.textContent = obj[currency].Name
        nameCurrnecy.textContent = currency
        actualCurrnecy.textContent = obj[currency].Value.toFixed(2)
        prevCurrnecy.textContent = obj[currency].Previous.toFixed(2)
        parseFloat(actualCurrnecy.textContent) > parseFloat(prevCurrnecy.textContent) ? actualCurrnecy.classList.add('up') : prevCurrnecy.classList.add('down')

        tableRow.append(name, nameCurrnecy, actualCurrnecy, prevCurrnecy)
        table.append(tableRow)
    }
    document.getElementById('currentRate').addEventListener('click', sortCurrentRates)
    document.getElementById('currentName').addEventListener('click', sortName)
}

const getTime = () => {
    let today = new Date()
    let now = today.toLocaleString()
    time.textContent = now
}
setInterval(getTime, 1000)

input.oninput = convertValue
select.oninput = convertValue

function convertValue() {
    result.value = (parseFloat(input.value) / rates[select.value]).toFixed(2);
}

saveExchangeBtn.addEventListener('click', function (event) {
    const saveValue = result.value
    let saveValute = input.value
    if (saveValute === '') return false
    const convertValute = select.value
    const userChange = {}
    userChange.input = saveValute
    userChange.output = saveValue
    userChange.valute = convertValute
    userChange.time = new Date().toLocaleString()
    historyList.innerHTML += `<div  >Input: ${userChange.input} RUB, Output: ${userChange.output}, valute : ${userChange.valute}, time : ${userChange.time}  <button class="deleteFromHistory">Delete History Item</button></div>`
    historyExchange.push(userChange)
    localStorage.setItem('userExchange', JSON.stringify(historyExchange))
    input.value = ''
    result.value = ''
})


const render = data => data.map(item => {
    if (item) {
        return `<div class="history__item"> Input: ${item.input} RUB, Output: ${item.output},  valute : ${item.valute}, time : ${item.time}  <button class="deleteFromHistory">Delete History Item</button></div>`
    }
})

render(historyExchange)
historyList.innerHTML = render(historyExchange).join('');

historyList.addEventListener('click', function (event) {
    const targetElement = event.target
    if (targetElement.classList.contains('deleteFromHistory')) {
        const parentElement = targetElement.parentElement
        const index = Array.from(parentElement.parentElement.children).indexOf(parentElement)
        historyExchange.splice(index, 1)
        parentElement.remove()
        localStorage.setItem('userExchange', JSON.stringify(historyExchange))
    }
})


function sortCurrentRates() {
    const rows = Array.from(table.getElementsByTagName('tr'));
    rows.shift();
    rows.sort((a, b) => {
        const aValue = parseFloat(a.cells[2].textContent);
        const bValue = parseFloat(b.cells[2].textContent);
        return aValue - bValue;
    });
    while (table.rows.length > 0) {
        table.deleteRow(0);
    }
    renderHeaderForTable()
    rows.forEach(row => {
        table.appendChild(row);
    });
}

function sortName() {
    const rows = Array.from(table.getElementsByTagName('tr'));
    rows.shift(); // Удаляем заголовочную строку

    rows.sort((a, b) => {
        const nameA = a.cells[0].textContent.toUpperCase();
        const nameB = b.cells[0].textContent.toUpperCase();

        if (nameA < nameB) {
            return -1;
        }
        if (nameA > nameB) {
            return 1;
        }
        return 0;
    });

    while (table.rows.length > 0) {
        table.deleteRow(0);
    }

    renderHeaderForTable();

    rows.forEach(row => {
        table.appendChild(row);
    });
}




const renderHeaderForTable = () => {
    const headerRow = document.createElement('tr');
    const nameHeader = document.createElement('th');
    const nameCurrencyHeader = document.createElement('th');
    const currentRateHeader = document.createElement('th');
    const previousRateHeader = document.createElement('th');
    nameHeader.textContent = 'Currency name';
    nameHeader.setAttribute('id', 'currentName')
    nameCurrencyHeader.textContent = 'CharCode';
    currentRateHeader.textContent = 'Current rate';
    currentRateHeader.setAttribute('id', 'currentRate')
    previousRateHeader.textContent = 'Previous rate';
    headerRow.append(nameHeader, nameCurrencyHeader, currentRateHeader, previousRateHeader);
    return table.appendChild(headerRow);
}