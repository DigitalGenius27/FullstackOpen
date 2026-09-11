import { useState, useEffect } from 'react'
import personService from './services/persons'

const Filter = ({ search, onChange }) => {
  return (
    <div>
      filter shown with{' '}
      <input value={search} onChange={onChange} />
    </div>
  )
}

const PersonForm = ({
  onSubmit,
  newName,
  onNameChange,
  newNumber,
  onNumberChange
}) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name: <input value={newName} onChange={onNameChange} />
      </div>

      <div>
        number: <input value={newNumber} onChange={onNumberChange} />
      </div>

      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )
}

const Persons = ({ persons, onDelete }) => {
  return (
    <div>
      {persons.map(person =>
        <p key={person.id}>
          {person.name} {person.number}{' '}
          <button onClick={() => onDelete(person.id)}>
            delete
          </button>
        </p>
      )}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [search, setSearch] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })
  }, [])

  const addPerson = event => {
    event.preventDefault()

    const existingPerson = persons.find(
      person => person.name === newName
    )

    if (existingPerson) {
      const confirmed = window.confirm(
        `${newName} is already added to phonebook, replace the old number with a new one?`
      )

      if (!confirmed) {
        return
      }

      const updatedPerson = {
        ...existingPerson,
        number: newNumber
      }

      personService
        .update(existingPerson.id, updatedPerson)
        .then(response => {
          setPersons(
            persons.map(person =>
              person.id === existingPerson.id
                ? response.data
                : person
            )
          )

          setNewName('')
          setNewNumber('')
        })

      return
    }

    const personObject = {
      name: newName,
      number: newNumber
    }

    personService
      .create(personObject)
      .then(response => {
        setPersons(persons.concat(response.data))
        setNewName('')
        setNewNumber('')
      })
  }

  const deletePerson = id => {
    const person = persons.find(person => person.id === id)

    if (window.confirm(`Delete ${person.name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(
            persons.filter(person => person.id !== id)
          )
        })
    }
  }

  const handleNameChange = event => {
    setNewName(event.target.value)
  }

  const handleNumberChange = event => {
    setNewNumber(event.target.value)
  }

  const handleSearchChange = event => {
    setSearch(event.target.value)
  }

  const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h2>Phonebook</h2>

      <Filter
        search={search}
        onChange={handleSearchChange}
      />

      <h3>Add a new</h3>

      <PersonForm
        onSubmit={addPerson}
        newName={newName}
        onNameChange={handleNameChange}
        newNumber={newNumber}
        onNumberChange={handleNumberChange}
      />

      <h3>Numbers</h3>

      <Persons
        persons={personsToShow}
        onDelete={deletePerson}
      />
    </div>
  )
}

export default App