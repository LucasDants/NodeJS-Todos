const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');
const app = express();

app.use(cors());
app.use(express.json());

 const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const userAlreadyExists = users.some(user => user.username === username)

  if(!userAlreadyExists) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }
  next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if (userAlreadyExists) {
    return response.status(400).json({
      error: 'Mensagem do erro'
    })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user)

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers

  const user = users.find(user => user.username === username)

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  const userIndex = users.findIndex(user => user.username === username)
  const user = users[userIndex]

   users.splice(userIndex, 1, {
     ...user,
     todos: [todo, ...user.todos]
   })
  
  return response.status(201).send(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username)
  const user = users[userIndex]

  const updateTodo = {
    deadline: new Date(deadline),
    title,
    done: false
  }

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  user.todos[todoIndex] = {
    ...user.todos[todoIndex],
    ...updateTodo
  }



  return response.json(updateTodo)

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username)
  const user = users[userIndex]

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if(todoIndex === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  const userTodo = user.todos[todoIndex]
  userTodo.done = true 

  return response.json(userTodo)
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { username } = request.headers
  const { id } = request.params

  const userIndex = users.findIndex(user => user.username === username)
  const user = users[userIndex]

  const todoIndex = user.todos.findIndex(todo => todo.id === id)

  if (todoIndex === -1) {
    return response.status(404).json({
      error: 'Mensagem do erro'
    })
  }

  user.todos.splice(todoIndex, 1)

  return response.status(204).send()

});

module.exports = app;