import { useState, useEffect } from 'react'
import axios from 'axios'

const App = () => {
  const [search, setSearch] = useState('')
  const [countries, setCountries] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [weather, setWeather] = useState(null)

  const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY

  useEffect(() => {
    axios
      .get('https://studies.cs.helsinki.fi/restcountries/api/all')
      .then(response => {
        setCountries(response.data)
      })
  }, [])

  const countriesToShow = search === ''
    ? []
    : countries.filter(country =>
        country.name.common
          .toLowerCase()
          .includes(search.toLowerCase())
      )

  useEffect(() => {
    if (!selectedCountry) {
      return
    }

    const capital = selectedCountry.capital?.[0]

    if (!capital) {
      return
    }

    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(capital)}&appid=${apiKey}&units=metric`
      )
      .then(response => {
        setWeather(response.data)
      })
      .catch(() => {
        setWeather(null)
      })
  }, [selectedCountry, apiKey])

  const handleSearchChange = event => {
    setSearch(event.target.value)
    setSelectedCountry(null)
  }

  const showCountry = country => {
    setSelectedCountry(country)
    setSearch(country.name.common)
  }

  const countryToShow =
    selectedCountry ||
    (countriesToShow.length === 1 ? countriesToShow[0] : null)

  return (
    <div>
      <div>
        find countries{' '}
        <input
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {countryToShow ? (
        <>
          <Country country={countryToShow} />

          <Weather weather={weather} />
        </>
      ) : (
        <CountryList
          countries={countriesToShow}
          onShow={showCountry}
        />
      )}
    </div>
  )
}

const CountryList = ({ countries, onShow }) => {
  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length === 0) {
    return null
  }

  return (
    <div>
      {countries.map(country => (
        <div key={country.cca3}>
          {country.name.common}{' '}
          <button onClick={() => onShow(country)}>
            show
          </button>
        </div>
      ))}
    </div>
  )
}

const Country = ({ country }) => {
  return (
    <div>
      <h1>{country.name.common}</h1>

      <p>
        capital {country.capital?.[0]}
      </p>

      <p>
        area {country.area}
      </p>

      <h2>languages:</h2>

      <ul>
        {Object.values(country.languages || {}).map(language => (
          <li key={language}>{language}</li>
        ))}
      </ul>

      <img
        src={country.flags.png}
        alt={`Flag of ${country.name.common}`}
        width="200"
      />
    </div>
  )
}

const Weather = ({ weather }) => {
  if (!weather) {
    return null
  }

  return (
    <div>
      <h2>Weather in {weather.name}</h2>

      <p>
        temperature {weather.main.temp} Celsius
      </p>

      <img
        src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
        alt={weather.weather[0].description}
      />

      <p>
        wind {weather.wind.speed} m/s
      </p>
    </div>
  )
}

export default App