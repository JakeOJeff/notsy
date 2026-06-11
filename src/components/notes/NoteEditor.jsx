import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Code, Quote, Heading1, Heading2, Heading3,
  Undo2, Redo2, Search, Type,
} from 'lucide-react'
import { useNotesStore } from '../../store/useNotesStore'

const FONT_SIZES = ['10', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48']

export default function NoteEditor({ note }) {
  const editorRef   = useRef(null)
  const titleRef    = useRef(null)
  const updateNote  = useNotesStore(s => s.updateNote)
  const saveTimer   = useRef(null)

  const [savedAt, setSavedAt]     = useState(null)
  const [wordCount, setWordCount] = useState(0)
  const [charCount, setCharCount] = useState(0)
  const [fontSize, setFontSize]   = useState('14')

  // Find & Replace state
  const [showFind, setShowFind]     = useState(false)
  const [findText, setFindText]     = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCase, setMatchCase]   = useState(false)
  const [matchCount, setMatchCount] = useState(0)
  const findRef = useRef(null)

  // Load content once on mount
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = note.content || ''
      recalcStats()
    }
  }, []) // eslint-disable-line

  const recalcStats = () => {
    const text = editorRef.current?.innerText ?? ''
    const words = text.trim() ? text.trim().split(/\s+/).length : 0
    setWordCount(words)
    setCharCount(text.length)
  }

  const scheduleSave = () => {
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      const content = editorRef.current?.innerHTML ?? ''
      updateNote(note.id, { content })
      setSavedAt(new Date())
    }, 600)
  }

  const onInput = () => {
    recalcStats()
    scheduleSave()
  }

  const onTitleBlur = (e) => {
    updateNote(note.id, { title: e.target.value || 'Untitled Note' })
  }

  // Keyboard shortcuts
  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
      e.preventDefault()
      setShowFind(v => !v)
    }
  }

  // Ctrl+H global
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowFind(v => { if (!v) setTimeout(() => findRef.current?.focus(), 50); return !v })
      }
    }
    window.addEventListener('keydown', handler)
    return () => {
      window.removeEventListener('keydown', handler)
      // Flush any pending save immediately on unmount
      clearTimeout(saveTimer.current)
      if (editorRef.current) {
        updateNote(note.id, { content: editorRef.current.innerHTML })
      }
    }
  }, [])

  // Focus find input when shown
  useEffect(() => {
    if (showFind) setTimeout(() => findRef.current?.focus(), 50)
  }, [showFind])

  const exec = (cmd, val = null) => {
    editorRef.current?.focus()
    document.execCommand(cmd, false, val)
    scheduleSave()
  }

  const insertHeading = (level) => {
    editorRef.current?.focus()
    document.execCommand('formatBlock', false, `h${level}`)
    scheduleSave()
  }

  const setFontSizeCmd = (size) => {
    setFontSize(size)
    editorRef.current?.focus()
    // execCommand fontSize uses 1-7, so we use a workaround with styled spans
    document.execCommand('fontSize', false, '7')
    const fontEls = editorRef.current?.querySelectorAll('font[size="7"]')
    fontEls?.forEach(el => {
      el.removeAttribute('size')
      el.style.fontSize = size + 'px'
    })
    scheduleSave()
  }

  // Find & Replace
  const highlightMatches = useCallback((search) => {
    // Remove old highlights first
    const editor = editorRef.current
    if (!editor) return 0
    const html = editor.innerHTML.replace(/<mark class="find-highlight">(.*?)<\/mark>/gi, '$1')
    if (!search) { editor.innerHTML = html; return 0 }
    const flags = matchCase ? 'g' : 'gi'
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const count = (html.match(new RegExp(escaped, flags)) || []).length
    editor.innerHTML = html.replace(
      new RegExp(escaped, flags),
      m => `<mark class="find-highlight">${m}</mark>`
    )
    return count
  }, [matchCase])

  useEffect(() => {
    if (showFind) {
      setMatchCount(highlightMatches(findText))
    } else {
      // Clear highlights
      if (editorRef.current) {
        editorRef.current.innerHTML = editorRef.current.innerHTML
          .replace(/<mark class="find-highlight">(.*?)<\/mark>/gi, '$1')
      }
    }
  }, [findText, showFind, matchCase, highlightMatches])

  const replaceAll = () => {
    const editor = editorRef.current
    if (!editor || !findText) return
    const html = editor.innerHTML.replace(/<mark class="find-highlight">(.*?)<\/mark>/gi, '$1')
    const flags = matchCase ? 'g' : 'gi'
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    editor.innerHTML = html.replace(new RegExp(escaped, flags), replaceText)
    scheduleSave()
    setMatchCount(0)
    setFindText('')
  }

  const replaceOne = () => {
    const editor = editorRef.current
    if (!editor || !findText) return
    const html = editor.innerHTML.replace(/<mark class="find-highlight">(.*?)<\/mark>/gi, '$1')
    const flags = matchCase ? '' : 'i'
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    editor.innerHTML = html.replace(new RegExp(escaped, flags), replaceText)
    scheduleSave()
    const newCount = highlightMatches(findText)
    setMatchCount(newCount)
  }

  const toolbarGroups = [
    [
      { icon: <Undo2 size={14} />,        title: 'Undo (Ctrl+Z)',    cmd: () => exec('undo') },
      { icon: <Redo2 size={14} />,        title: 'Redo (Ctrl+Y)',    cmd: () => exec('redo') },
    ],
    [
      { icon: <Heading1 size={14} />,     title: 'Heading 1',        cmd: () => insertHeading(1) },
      { icon: <Heading2 size={14} />,     title: 'Heading 2',        cmd: () => insertHeading(2) },
      { icon: <Heading3 size={14} />,     title: 'Heading 3',        cmd: () => insertHeading(3) },
    ],
    [
      { icon: <Bold size={14} />,         title: 'Bold (Ctrl+B)',    cmd: () => exec('bold') },
      { icon: <Italic size={14} />,       title: 'Italic (Ctrl+I)',  cmd: () => exec('italic') },
      { icon: <Underline size={14} />,    title: 'Underline (Ctrl+U)', cmd: () => exec('underline') },
      { icon: <Strikethrough size={14} />,title: 'Strikethrough',    cmd: () => exec('strikeThrough') },
      { icon: <Code size={14} />,         title: 'Inline code',      cmd: () => {
        const sel = window.getSelection()
        if (sel && sel.toString()) {
          exec('insertHTML', `<code>${sel.toString()}</code>`)
        }
      }},
    ],
    [
      { icon: <AlignLeft size={14} />,    title: 'Align left',       cmd: () => exec('justifyLeft') },
      { icon: <AlignCenter size={14} />,  title: 'Align center',     cmd: () => exec('justifyCenter') },
      { icon: <AlignRight size={14} />,   title: 'Align right',      cmd: () => exec('justifyRight') },
    ],
    [
      { icon: <List size={14} />,         title: 'Bullet list',      cmd: () => exec('insertUnorderedList') },
      { icon: <ListOrdered size={14} />,  title: 'Numbered list',    cmd: () => exec('insertOrderedList') },
      { icon: <Quote size={14} />,        title: 'Blockquote',       cmd: () => exec('formatBlock', 'blockquote') },
    ],
    [
      { icon: <Search size={14} />,       title: 'Find & Replace (Ctrl+H)', cmd: () => setShowFind(v => !v), active: showFind },
    ],
  ]

  return (
    <div className="flex flex-col h-full bg-surface">
      {/* Title */}
      <div className="px-8 pt-6 pb-2 border-b border-surface-border flex-shrink-0">
        <input
          ref={titleRef}
          type="text"
          defaultValue={note.title}
          onBlur={onTitleBlur}
          placeholder="Untitled Note"
          className="w-full bg-transparent text-xl font-semibold text-ink placeholder-ink-faint outline-none border-none"
          onKeyDown={(e) => e.key === 'Enter' && editorRef.current?.focus()}
        />
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-4 py-1.5 border-b border-surface-border bg-surface-raised flex-shrink-0 flex-wrap">
        {toolbarGroups.map((group, gi) => (
          <div key={gi} className="flex items-center gap-0.5">
            {gi > 0 && <span className="w-px h-4 bg-surface-border mx-1 flex-shrink-0" />}
            {group.map((btn, i) => (
              <button
                key={i}
                title={btn.title}
                onMouseDown={(e) => { e.preventDefault(); btn.cmd() }}
                className={`p-1.5 rounded transition-colors text-ink-muted hover:text-ink hover:bg-surface-overlay
                  ${btn.active ? 'bg-surface-overlay text-ink' : ''}`}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        ))}

        {/* Font size */}
        <span className="w-px h-4 bg-surface-border mx-1 flex-shrink-0" />
        <div className="flex items-center gap-1">
          <Type size={13} className="text-ink-faint" />
          <select
            value={fontSize}
            onChange={(e) => setFontSizeCmd(e.target.value)}
            className="bg-surface-overlay text-ink-muted text-xs rounded px-1 py-0.5 border border-surface-border outline-none cursor-pointer hover:text-ink"
          >
            {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
          </select>
        </div>
      </div>

      {/* Find & Replace bar */}
      {showFind && (
        <div className="flex items-center gap-2 px-4 py-2 bg-surface-raised border-b border-surface-border flex-shrink-0 flex-wrap gap-y-1.5">
          <div className="flex items-center gap-1.5 bg-surface-overlay border border-surface-border rounded px-2 py-1">
            <Search size={12} className="text-ink-faint flex-shrink-0" />
            <input
              ref={findRef}
              type="text"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
              placeholder="Find…"
              className="bg-transparent text-ink text-sm outline-none w-36 placeholder-ink-faint"
            />
            {matchCount > 0 && (
              <span className="text-xs text-ink-faint flex-shrink-0">{matchCount} match{matchCount !== 1 ? 'es' : ''}</span>
            )}
            {findText && matchCount === 0 && (
              <span className="text-xs text-red-400 flex-shrink-0">No match</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 bg-surface-overlay border border-surface-border rounded px-2 py-1">
            <input
              type="text"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
              placeholder="Replace…"
              className="bg-transparent text-ink text-sm outline-none w-36 placeholder-ink-faint"
            />
          </div>
          <label className="flex items-center gap-1 text-xs text-ink-muted cursor-pointer select-none">
            <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="accent-accent" />
            Case
          </label>
          <button onClick={replaceOne}  className="px-2 py-1 text-xs bg-surface-overlay border border-surface-border rounded hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors">Replace</button>
          <button onClick={replaceAll}  className="px-2 py-1 text-xs bg-surface-overlay border border-surface-border rounded hover:bg-surface-hover text-ink-muted hover:text-ink transition-colors">Replace All</button>
          <button onClick={() => setShowFind(false)} className="px-2 py-1 text-xs text-ink-faint hover:text-ink transition-colors">✕</button>
        </div>
      )}

      {/* Editor */}
      <div className="flex-1 overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          suppressContentEditableWarning
          spellCheck
          onInput={onInput}
          onKeyDown={onKeyDown}
          className="note-editor-content px-8 py-5 min-h-full focus:outline-none"
          data-placeholder="Start writing…"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-8 py-1.5 border-t border-surface-border text-xs text-ink-faint flex-shrink-0 bg-surface-raised">
        <span>{wordCount} word{wordCount !== 1 ? 's' : ''} · {charCount} char{charCount !== 1 ? 's' : ''}</span>
        <span>{savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unsaved changes'}</span>
      </div>
    </div>
  )
}
