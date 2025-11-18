import React from 'react'
import Login from './component/login/page'

export default function page() {

  console.log('db  url', process.env.MONGO_URL)
  return (
    <div>
      <Login />

    </div>
  )
}
