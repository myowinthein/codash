// prepare variables
const ipURL = 'http://ip-api.com/json'
const summaryURL = 'https://corona.lmao.ninja/all'
const countryURL = 'https://corona.lmao.ninja/countries?sort='
const worldPopulation = 7800000000

let countryTableBody, newCountryTableRow, ipCountryCode, lastUpdatedSeconds
let sortBy = ''

// prepare functions
function getIP () {
	fetch(ipURL)
		.then((response) => {
			response.json().then(function(data) {
				ipCountryCode = data.countryCode
			})
		})
}

function getSummaryData () {
	fetch(summaryURL)
		.then((response) => {
			response.json().then(function(data) {
				// prepare variables
				const totalCases = data.cases
				const percentageWorldPopulartionCases = calculatePercentage(worldPopulation, totalCases)

				const totalDeaths = data.deaths
				const percentageWorldPopulartionDeaths = calculatePercentage(worldPopulation, totalDeaths)
				const percentageTotalCaseDeaths = calculatePercentage(totalCases, totalDeaths)

				const totalRecovered = data.recovered
				const percentageTotalCaseRecovered = calculatePercentage(totalCases, totalRecovered)

				const totalActive = totalCases - (totalDeaths + totalRecovered)
				const percentageWorldPopulartionActive = calculatePercentage(worldPopulation, totalActive)
				const percentageTotalCaseActive = calculatePercentage(totalCases, totalActive)

				const currentDate = new Date()
				const refreshDate = new Date(data.updated)
				lastUpdatedSeconds = (currentDate.getTime() - refreshDate.getTime()) / 1000

				// feed data
				addData('totalCases', totalCases)
				addData('percentageWorldPopulartionCases', percentageWorldPopulartionCases, false)

				addData('totalDeaths', totalDeaths)
				addData('percentageWorldPopulartionDeaths', percentageWorldPopulartionDeaths, false)
				addData('percentageTotalCaseDeaths', percentageTotalCaseDeaths, false)

				addData('totalRecovered', totalRecovered)
				addData('percentageTotalCaseRecovered', percentageTotalCaseRecovered, false)

				addData('totalActive', totalActive)
				addData('percentageWorldPopulartionActive', percentageWorldPopulartionActive, false)
				addData('percentageTotalCaseActive', percentageTotalCaseActive, false)

				addData('lastUpdatedTime', secondInFormat(lastUpdatedSeconds), false)
			})
		})
		.catch((err) => {
			alert('Something wrong in receiving summary data!')
		})
}

function getCountryData () {
	fetch(countryURL + sortBy)
		.then((response) => {
			response.json().then(function(data) {
				// clear old rows
				countryTableBody.innerHTML = ''

				// create new rows
				for (const index in data) {
					// prepare variables
					const country = data[index]
					const countryInfo = country['countryInfo']
					const googleMapURL = `https://www.google.com/maps/@${countryInfo.lat},${countryInfo.long},7.5z`

					newCountryTableRow = `
						<tr>
							<td class="align-left">
								<img src="${countryInfo.flag}" class="flagImg" />
								<a href="${googleMapURL}" target="_blank">${country.country}</a>
							</td>
							<td>${thousandSeperator(country.todayCases)}</td>
							<td>${thousandSeperator(country.todayDeaths)}</td>
							<td>${thousandSeperator(country.cases)}</td>
							<td>${thousandSeperator(country.deaths)}</td>
							<td>${thousandSeperator(country.recovered)}</td>
							<td>${thousandSeperator(country.active)}</td>
						</tr>
					`


					// insert new rows
					if (countryInfo.iso2 == ipCountryCode) {
							let countryTableBodyFirstRow = countryTableBody.firstChild
							let newRow = document.createElement('tr')
							newRow.classList.add('yrCountry')

							newRow.innerHTML = newCountryTableRow
							countryTableBodyFirstRow.parentNode.insertBefore(newRow, countryTableBodyFirstRow);
					} else {
						countryTableBody.insertRow().innerHTML = newCountryTableRow
					}
				}
			})
		})
		.catch((err) => {
			alert('Something wrong in receiving country data!')
		})
}

function calculatePercentage (total, current) {
	const value = (100 / total) * current
	const symbol = '%'
	const decimalLimit = 5

	return value.toFixed(decimalLimit) + symbol
}

function thousandSeperator (value) {
	value = value || 0
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

function addData (id, value, needSeperator = true) {
	value = needSeperator ? thousandSeperator(value) : value
	document.getElementById(id).innerHTML = value
}

function secondInFormat (seconds) {
	const days = Math.floor( seconds / (60 * 60 * 24) )
	const hour = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60))
	const minutes = Math.floor(((seconds % (60 * 60 * 24)) % (60 * 60)) / 60 )
	const second = Math.floor(((seconds % (60 * 60 * 24)) % (60 * 60)) % 60 )

	let format = ''
	if (days > 0){
		format += days + ' Day '
	}
	if (hour > 0){
		format += hour + ' hour '
	}
	if (minutes > 0){
		format += minutes + ' minutes '
	}
	if (second > 0){
		format += second + ' second '
	}

	return format
}

function toggleDisplay (tag) {
	tag.classList.toggle('hidden')
}

function fetchData () {
	getSummaryData()
	getCountryData()
}

function sortTable (column) {
	sortBy = column
	getCountryData()
}

// document ready
window.addEventListener('load', (event) => {
	// prepare variables
	const summaryTable = document.getElementById('summaryTable')
	const countryTable = document.getElementById('countryTable')

	const sortCountry = document.getElementById('sortCountry')
	const sortTodayCases = document.getElementById('sortTodayCases')
	const sortTodayDeaths = document.getElementById('sortTodayDeaths')
	const sortTotalCases = document.getElementById('sortTotalCases')
	const sortTotalDeaths = document.getElementById('sortTotalDeaths')
	const sortTotalRecovered = document.getElementById('sortTotalRecovered')
	const sortTotalActive = document.getElementById('sortTotalActive')

	const toggleTableBtn = document.getElementById('toggleTable')
	const reloadTimer = document.getElementById('reloadTimer')

	countryTableBody = document.querySelector('#countryTable tbody')

	// load source data
	getIP()
	fetchData()

	// load source data every xxx second
	let timer = 0
	setInterval(function() {
		if (timer == 5) {
			fetchData()
			timer = 1
		} else {
			timer++
		}

		lastUpdatedSeconds++
		addData('lastUpdatedTime', secondInFormat(lastUpdatedSeconds), false)

		reloadTimer.innerHTML = timer
	}, 1000)

	sortCountry.addEventListener('click', function() {
		sortTable('country')
	})

	sortTodayCases.addEventListener('click', function() {
		sortTable('todayCases')
	})

	sortTodayDeaths.addEventListener('click', function() {
		sortTable('todayDeaths')
	})

	sortTotalCases.addEventListener('click', function() {
		sortTable('cases')
	})

	sortTotalDeaths.addEventListener('click', function() {
		sortTable('deaths')
	})

	sortTotalRecovered.addEventListener('click', function() {
		sortTable('recovered')
	})

	sortTotalActive.addEventListener('click', function() {
		sortTable('active')
	})
})