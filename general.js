// prepare variables
const ipURL = 'https://ipapi.co/json/'
const summaryURL = 'https://corona.lmao.ninja/v2/all'
const countryURL = 'https://corona.lmao.ninja/v2/countries?sort='
const worldPopulation = 7800000000

let countryTableBody, newCountryTableRow, ipCountryCode, lastUpdatedSeconds
let sortBy = 'todayCases'

// prepare functions
function getIP () {
	fetch(ipURL)
		.then((response) => {
			response.json().then(function(data) {
				ipCountryCode = data.country_code
			})
		})
}

function getSummaryData () {
	fetch(summaryURL)
		.then((response) => {
			response.json().then(function(data) {
				// prepare variables				
				const totalTested = data.tests
				const percentageWorldPopulartionTested = calculatePercentage(worldPopulation, totalTested)

				const totalCases = data.cases
				const percentageInfectedOfTested = calculatePercentage(totalTested, totalCases)

				const totalDeaths = data.deaths			
				const percentageDeathsOfInfected = calculatePercentage(totalCases, totalDeaths)

				const totalRecovered = data.recovered
				const percentageRecoveredOfInfected = calculatePercentage(totalCases, totalRecovered)

				const totalActive = data.active		
				const percentageMonitoringOfInfected = calculatePercentage(totalCases, totalActive)

				const currentDate = new Date()
				const refreshDate = new Date(data.updated)
				lastUpdatedSeconds = (currentDate.getTime() - refreshDate.getTime()) / 1000

				// feed data
				addData('totalTested', totalTested)
				addData('percentageWorldPopulartionTested', percentageWorldPopulartionTested, false)

				addData('totalCases', totalCases)
				addData('percentageInfectedOfTested', percentageInfectedOfTested, false)

				addData('totalDeaths', totalDeaths)
				addData('percentageDeathsOfInfected', percentageDeathsOfInfected, false)

				addData('totalRecovered', totalRecovered)
				addData('percentageRecoveredOfInfected', percentageRecoveredOfInfected, false)

				addData('totalActive', totalActive)
				addData('percentageMonitoringOfInfected', percentageMonitoringOfInfected, false)

				addData('lastUpdatedTime', secondInFormat(lastUpdatedSeconds), false)
			})
		})
		.catch((err) => {
			console.log('Something wrong in receiving summary data!')
		})
}

function getCountryData () {
	fetch(countryURL + sortBy)
		.then((response) => {
			response.json().then(function(data) {
				// prepare variables
				let rank = 0
				let country, countryInfo, previousValue, currentValue, googleMapURL

				// clear old table rows
				countryTableBody.innerHTML = ''

				// add all table rows
				for (const index in data) {
					// prepare variables
					country = data[index]
					countryInfo = country['countryInfo']
					currentValue = country[sortBy]
					googleMapURL = `https://www.google.com/maps/@${countryInfo.lat},${countryInfo.long},7.5z`

					// calculate rank
					if (previousValue != currentValue) {
						rank++;
					}

					newCountryTableRow = `
						<tr>
							<td>${rank}</td>
							<td class="align-left">
								<img src="${countryInfo.flag}" class="flagImg" />
								<a href="${googleMapURL}" target="_blank">${country.country}</a>
							</td>
							<td>${thousandSeperator(country.todayCases)}</td>
							<td>${thousandSeperator(country.todayDeaths)}</td>
							<td>${thousandSeperator(country.tests)}</td>
							<td>${thousandSeperator(country.cases)}</td>
							<td>${thousandSeperator(country.deaths)}</td>
							<td>${thousandSeperator(country.recovered)}</td>
							<td>${thousandSeperator(country.active)}</td>
						</tr>`

					// insert new rows
					if (countryInfo.iso2 == ipCountryCode) {
						let countryTableBodyFirstRow = countryTableBody.firstChild
						let newRow = document.createElement('tr')
						newRow.classList.add('yrCountry')

						newRow.innerHTML = newCountryTableRow
						countryTableBodyFirstRow.parentNode.insertBefore(newRow, countryTableBodyFirstRow)
					} else {
						countryTableBody.insertRow().innerHTML = newCountryTableRow
					}

					// save previous row value for rank calculation
					previousValue = currentValue
				}
			})
		})
		.catch((err) => {
			console.log('Something wrong in receiving country data!')
		})
}

function calculatePercentage (total, current, decimalLimit = 2) {
	const value = (100 / total) * current
	const symbol = '%'

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

function sortTable (obj, column) {
	// remove highlight of current active column
	const activeColumn = document.querySelector('.sortable.active')
	activeColumn.classList.remove('active')

	// add highlight to new column
	obj.classList.add('active')

	// sort with new column
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
	const sortTotalTested = document.getElementById('sortTotalTested')
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
	let timer = 5
	setInterval(function() {
		if (timer == 0) {
			fetchData()
			timer = 5
		} else {
			timer--
		}

		lastUpdatedSeconds++
		addData('lastUpdatedTime', secondInFormat(lastUpdatedSeconds), false)

		reloadTimer.innerHTML = timer
	}, 1000)

	sortCountry.addEventListener('click', function() {
		sortTable(this, 'country')
	})

	sortTodayCases.addEventListener('click', function() {
		sortTable(this, 'todayCases')
	})

	sortTodayDeaths.addEventListener('click', function() {
		sortTable(this, 'todayDeaths')
	})

	sortTotalTested.addEventListener('click', function() {
		sortTable(this, 'tests')
	})

	sortTotalCases.addEventListener('click', function() {
		sortTable(this, 'cases')
	})

	sortTotalDeaths.addEventListener('click', function() {
		sortTable(this, 'deaths')
	})

	sortTotalRecovered.addEventListener('click', function() {
		sortTable(this, 'recovered')
	})

	sortTotalActive.addEventListener('click', function() {
		sortTable(this, 'active')
	})
})
