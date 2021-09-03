import React, { useEffect, useState } from 'react'
import {FooterActions} from './Footer'
import {Button} from './Buttons'

export default function InstallPWA() {
  const [supportsPWA, setSupportsPWA] = useState(false)
  const [promptInstall, setPromptInstall] = useState(null)

  useEffect(() => {
    const handler = e => {
      e.preventDefault()
      setSupportsPWA(true)
      setPromptInstall(e)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("beforeinstallprompt", handler)
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("transitionend", handler)
      }
    }
  }, [])

  const onClick = evt => {
    evt.preventDefault()
    if (!promptInstall) {
      return
    }
    promptInstall.prompt()
  }
  if (!supportsPWA) {
    return null
  }
  return (
    <FooterActions>
      <Button
        aria-label="Install app"
        title="Install app"
        onClick={onClick}
      >
        Add to Home Screen
      </Button>
    </FooterActions>
  )
}
