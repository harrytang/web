import React, { useEffect } from 'react'

interface CommentBoxProps {
  projectId: string
}

// Extend the window interface directly in this file
declare global {
  interface Window {
    commentBox: (projectId: string) => void
  }
}

const CommentBox: React.FC<CommentBoxProps> = ({ projectId }) => {
  useEffect(() => {
    // Create a script element
    const script = document.createElement('script')
    script.src = 'https://unpkg.com/commentbox.io/dist/commentBox.min.js'
    script.async = true

    // Append the script to the document body
    document.body.appendChild(script)

    // Initialize CommentBox.io after the script has loaded
    script.onload = () => {
      if (window.commentBox) {
        window.commentBox(projectId)
      }
    }

    // Cleanup function to remove the script when the component unmounts
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [projectId])

  return <div className="commentbox"></div>
}

export default CommentBox
