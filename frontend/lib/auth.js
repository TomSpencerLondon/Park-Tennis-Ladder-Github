import { useEffect } from "react"
import Router from "next/router"
import Cookie from "js-cookie"
import axios from "axios"
import { useAuthContext } from '../auth/AuthProvider'
import Signin from '../pages/signin'
import {URLS} from '../components/Nav'

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:1337"

//register a new user
export const registerUser = (data) => {
  //prevent function from being ran on the server
  if (typeof window === "undefined") {
    return
  }
  return new Promise((resolve, reject) => {
    axios
      .post(`${API_URL}/auth/local/register`, data)
      .then((res) => {
        //set token response from Strapi for server validation
        // Cookie.set("token", res.data.jwt)

        //resolve the promise to set loading to false in SignUp form
        resolve(res)
        //redirect back to home page 
        // Router.push("/")
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error)
      })
  })
}

export const login = (identifier, password) => {
  //prevent function from being ran on the server
  if (typeof window === "undefined") {
    return
  }

  return new Promise((resolve, reject) => {
    axios
      .post(`${API_URL}/auth/local/`, { identifier, password })
      .then((res) => {
        //set token response from Strapi for server validation
        Cookie.set("token", res.data.jwt)

        //resolve the promise to set loading to false in SignUp form
        resolve(res)
        //redirect back to home page 
        Router.push("/")
      })
      .catch((error) => {
        //reject the promise and pass the error object back to the form
        reject(error)
      })
  })
}

export const logout = () => {
  //remove token and user cookie
  Cookie.remove("token")
  delete window.__user
  // sync logout between multiple windows
  window.localStorage.setItem("logout", Date.now())
  // reset challenge alert
  window.localStorage.setItem('challengeAlertCount', 0)
  //redirect to the home page
  console.log('LOGOUT REDIRECT TO LOGIN')
  Router.push(URLS.home())
}

export const sendEmailConfirmation = async (email) => axios.post(`${API_URL}/auth/send-email-confirmation`, {
  email,
})

export const forgottenPassword = async (email) => axios.post(`${API_URL}/auth/forgot-password`, {
  email,
})
// .then(response => {
//   // Handle success.
//   console.log('Your user received an email');
// })
// .catch(error => {
//   // Handle error.
//   console.log('An error occurred:', error.response);
// });

export const resetPassword = async (code, password, passwordConfirmation) => axios.post(`${API_URL}/auth/reset-password`, {
    code, 
    password,
    passwordConfirmation,
  })
  // .then(response => {
  //   // Handle success.
  //   console.log('Your user\'s password has been changed.');
  // })
  // .catch(error => {
  //   // Handle error.
  //   console.log('An error occurred:', error.response);
  // });

//Higher Order Component to wrap our pages and logout simultaneously logged in tabs
// THIS IS NOT USED in the tutorial, only provided if you wanted to implement
export const withAuthSync = (Component) => {
  const Wrapper = (props) => {
    const syncLogout = (event) => {
      if (event.key === "logout") {
        console.log('WITH_AUTH_SYNC REDIRECT TO LOGIN')
        Router.push(URLS.home())
      }
    }

    useEffect(() => {
      window.addEventListener("storage", syncLogout)

      return () => {
        window.removeEventListener("storage", syncLogout)
        window.localStorage.removeItem("logout")
      }
    }, [])

    return <Component {...props} />
  }

  if (Component.getInitialProps) {
    Wrapper.getInitialProps = Component.getInitialProps
  }

  return Wrapper
}

// HOC to load auth or show signin page
export const withAuth = (Component) => {
  const Wrapper = (props) => {

    const auth = useAuthContext()

    if (!auth.isAuthenticated) {
      return <Signin />
    }  

    return <Component auth={auth} {...props} />
  }

  if (Component.getInitialProps) {
    Wrapper.getInitialProps = Component.getInitialProps
  }

  return Wrapper
}