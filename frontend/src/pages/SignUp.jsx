import React from 'react'
import { Link } from 'react-router-dom'
const SignUp = () => {
  return (
    <div className ="p-3 max-w-lg mx-auto ">
      <h1 className='text-2xl text-center font-semibold my-7'>Sign Up Page</h1>
      <form className="flex flex-col  gap-4 rounded">
        <input type="text" placeholder='Username'
        className=' border border-gray-300 p-2 rounded-b-lg mb-2'
        id='username'
        />
        <input type="email" placeholder='Email'
        className='border border-gray-300 p-2 rounded-lg mb-2'
        id='email'
        />
        <input type="password" placeholder='Password'
        className='border border-gray-300 p-2 rounded-lg mb-2'
        id='password'
        />
        <button className='bg-slate-700 text-white p-3 uppercase rounded-lg
          hover:opacity-95 disabled:opacity-80
        '>SIGN UP</button>
        <button className='bg-red-700 uppercase text-white p-3 rounded-lg'>continue with Google</button>
      </form>
      <div className=' flex gap-2 pt-5'>
        <p>Already have an account? </p>
        <Link to="/sign-in" className='text-blue-700 underline'>Sign in</Link>
      </div>
    </div>
  )
}

export default SignUp