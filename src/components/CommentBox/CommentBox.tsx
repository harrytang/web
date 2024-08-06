import { useTheme } from 'next-themes'
import { Fragment, useEffect, useState } from 'react'

declare global {
  interface Window {
    REMARK42: any
    remark_config: any
  }
}

const insertScript = (
  id: string,
  parentElement: HTMLElement,
  theme: string,
) => {
  const script = window.document.createElement('script')
  script.type = 'text/javascript'
  script.async = true
  script.id = id
  let url = window.location.origin + window.location.pathname
  if (url.endsWith('/')) {
    url = url.slice(0, -1)
  }
  script.innerHTML = `
    var remark_config = {
      host: "${process.env.NEXT_PUBLIC_REMARK42_HOST}",
      site_id: "${process.env.NEXT_PUBLIC_REMARK42_SITE_ID}",
      url: "${url}",
      theme: "${theme}",
      no_footer: true,
    };
    !function(e,n){for(var o=0;o<e.length;o++){var r=n.createElement("script"),c=".js",d=n.head||n.body;"noModule"in r?(r.type="module",c=".mjs"):r.async=!0,r.defer=!0,r.src=remark_config.host+"/web/"+e[o]+c,d.appendChild(r)}}(remark_config.components||["embed"],document);`
  parentElement.appendChild(script)
}

const removeScript = (id: string, parentElement: HTMLElement) => {
  const script = window.document.getElementById(id)
  if (script) {
    parentElement.removeChild(script)
  }
}

const manageScript = (theme: string) => {
  if (!window) {
    return () => {}
  }
  const { document } = window
  if (document.getElementById('remark42')) {
    insertScript('comments-script', document.body, theme)
  }
  return () => removeScript('comments-script', document.body)
}

const recreateRemark42Instance = () => {
  if (!window) {
    return
  }
  const remark42 = window.REMARK42
  if (remark42) {
    remark42.destroy()
    remark42.createInstance(window.remark_config)
  }
}

const getPreferredTheme = (theme: string) => {
  if (theme === 'system') {
    const prefersDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? 'dark' : 'light'
  }
  return theme
}

type CommentBoxProps = {
  location: string
}

export default function CommentBox({ location }: CommentBoxProps) {
  const { theme } = useTheme()
  const [preferredTheme, setPreferredTheme] = useState(
    getPreferredTheme(theme ?? 'system'),
  )

  useEffect(() => {
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      if (theme === 'system') {
        setPreferredTheme(e.matches ? 'dark' : 'light')
      }
    }

    if (theme === 'system') {
      const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')
      mediaQueryList.addEventListener('change', handleSystemThemeChange)
      setPreferredTheme(mediaQueryList.matches ? 'dark' : 'light')

      return () => {
        mediaQueryList.removeEventListener('change', handleSystemThemeChange)
      }
    } else {
      setPreferredTheme(theme ?? 'system')
    }
  }, [theme])

  useEffect(() => {
    return manageScript(preferredTheme)
  }, [location, preferredTheme])

  useEffect(recreateRemark42Instance, [location, preferredTheme])

  return (
    <Fragment>
      <h2>Comments</h2>
      <div id="remark42" />
    </Fragment>
  )
}
