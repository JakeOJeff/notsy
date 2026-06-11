import { useRef, useEffect, useState, useCallback } from 'react'
import {
  Bold, Italic, Underline, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Code, Quote, Heading1, Heading2, Heading3,
  Undo2, Redo2, Search, Type,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'
import { Separator } from '../ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip'
import { useNotesStore } from '../../store/useNotesStore'

const FONT_SIZES = ['11','12','13','14','15','16','18','20','24','28','32']

export default function NoteEditor({ note }) {
  const editorRef          = useRef(null)
  const saveTimer          = useRef(null)
  const lastSavedContent   = useRef(note.content ?? '') // what we last wrote to the store
  const lastLocalEdit      = useRef(0)                  // timestamp of last keypress
  const titleInputRef      = useRef(null)
  const updateNote = useNotesStore(s => s.updateNote)

  const [words,       setWords]       = useState(0)
  const [chars,       setChars]       = useState(0)
  const [fontSize,    setFontSize]    = useState('14')
  const [showFind,    setShowFind]    = useState(false)
  const [findText,    setFindText]    = useState('')
  const [replaceText, setReplaceText] = useState('')
  const [matchCase,   setMatchCase]   = useState(false)
  const [matchCount,  setMatchCount]  = useState(0)
  const [savedAt,     setSavedAt]     = useState(null)
  const findRef = useRef(null)

  useEffect(() => {
    if (editorRef.current) { editorRef.current.innerHTML = note.content || ''; recalc() }
  }, []) // eslint-disable-line

  const recalc = () => {
    const t = editorRef.current?.innerText ?? ''
    setWords(t.trim() ? t.trim().split(/\s+/).length : 0)
    setChars(t.length)
  }

  const save = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML
      lastSavedContent.current = content
      updateNote(note.id, { content })
      setSavedAt(new Date())
    }
  }, [note.id, updateNote])

  const schedule = () => {
    lastLocalEdit.current = Date.now()
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(save, 600)
  }

  // ── Remote content sync ────────────────────────────────────────────────────
  // When a collaborator's patch lands, note.content changes in the store.
  // Only apply it if: it's not our own echo AND we haven't typed in the last second.
  useEffect(() => {
    if (note.content === lastSavedContent.current) return          // own echo
    if (Date.now() - lastLocalEdit.current < 1000) return          // mid-edit grace
    if (!editorRef.current) return
    editorRef.current.innerHTML = note.content || ''
    lastSavedContent.current = note.content ?? ''
    recalc()
  }, [note.content]) // eslint-disable-line

  // ── Remote title sync ─────────────────────────────────────────────────────
  useEffect(() => {
    if (titleInputRef.current && document.activeElement !== titleInputRef.current) {
      titleInputRef.current.value = note.title || ''
    }
  }, [note.title])

  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault()
        setShowFind(v => { if (!v) setTimeout(() => findRef.current?.focus(), 40); return !v })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      clearTimeout(saveTimer.current)
      if (editorRef.current) updateNote(note.id, { content: editorRef.current.innerHTML })
    }
  }, []) // eslint-disable-line

  useEffect(() => { if (showFind) setTimeout(() => findRef.current?.focus(), 40) }, [showFind])

  const exec = (cmd, val = null) => { editorRef.current?.focus(); document.execCommand(cmd, false, val); schedule() }
  const heading = (n) => { editorRef.current?.focus(); document.execCommand('formatBlock', false, `h${n}`); schedule() }

  const applyFontSize = (sz) => {
    setFontSize(sz)
    editorRef.current?.focus()
    document.execCommand('fontSize', false, '7')
    editorRef.current?.querySelectorAll('font[size="7"]').forEach(el => { el.removeAttribute('size'); el.style.fontSize = sz + 'px' })
    schedule()
  }

  const highlight = useCallback((search) => {
    const el = editorRef.current
    if (!el) return 0
    const clean = el.innerHTML.replace(/<mark class="find-hl">(.*?)<\/mark>/gi, '$1')
    if (!search) { el.innerHTML = clean; return 0 }
    const flags = matchCase ? 'g' : 'gi'
    const esc = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const count = (clean.match(new RegExp(esc, flags)) || []).length
    el.innerHTML = clean.replace(new RegExp(esc, flags), m => `<mark class="find-hl">${m}</mark>`)
    return count
  }, [matchCase])

  useEffect(() => {
    if (showFind) setMatchCount(highlight(findText))
    else if (editorRef.current)
      editorRef.current.innerHTML = editorRef.current.innerHTML.replace(/<mark class="find-hl">(.*?)<\/mark>/gi, '$1')
  }, [findText, showFind, matchCase, highlight])

  const replaceOne = () => {
    const el = editorRef.current; if (!el || !findText) return
    const clean = el.innerHTML.replace(/<mark class="find-hl">(.*?)<\/mark>/gi, '$1')
    el.innerHTML = clean.replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? '' : 'i'), replaceText)
    save(); setMatchCount(highlight(findText))
  }

  const replaceAll = () => {
    const el = editorRef.current; if (!el || !findText) return
    const clean = el.innerHTML.replace(/<mark class="find-hl">(.*?)<\/mark>/gi, '$1')
    el.innerHTML = clean.replace(new RegExp(findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), matchCase ? 'g' : 'gi'), replaceText)
    save(); setFindText(''); setMatchCount(0)
  }

  const groups = [
    [
      { icon: <Undo2 size={13} />,         title: 'Undo',          fn: () => exec('undo') },
      { icon: <Redo2 size={13} />,         title: 'Redo',          fn: () => exec('redo') },
    ],
    [
      { icon: <Heading1 size={13} />,      title: 'Heading 1',     fn: () => heading(1) },
      { icon: <Heading2 size={13} />,      title: 'Heading 2',     fn: () => heading(2) },
      { icon: <Heading3 size={13} />,      title: 'Heading 3',     fn: () => heading(3) },
    ],
    [
      { icon: <Bold size={13} />,          title: 'Bold  Ctrl+B',  fn: () => exec('bold') },
      { icon: <Italic size={13} />,        title: 'Italic  Ctrl+I',fn: () => exec('italic') },
      { icon: <Underline size={13} />,     title: 'Underline  Ctrl+U', fn: () => exec('underline') },
      { icon: <Strikethrough size={13} />, title: 'Strikethrough', fn: () => exec('strikeThrough') },
      { icon: <Code size={13} />,          title: 'Inline code',   fn: () => { const s = window.getSelection()?.toString(); if (s) exec('insertHTML', `<code>${s}</code>`) }},
    ],
    [
      { icon: <AlignLeft size={13} />,   title: 'Align left',   fn: () => exec('justifyLeft') },
      { icon: <AlignCenter size={13} />, title: 'Align center', fn: () => exec('justifyCenter') },
      { icon: <AlignRight size={13} />,  title: 'Align right',  fn: () => exec('justifyRight') },
    ],
    [
      { icon: <List size={13} />,        title: 'Bullet list',   fn: () => exec('insertUnorderedList') },
      { icon: <ListOrdered size={13} />, title: 'Numbered list', fn: () => exec('insertOrderedList') },
      { icon: <Quote size={13} />,       title: 'Blockquote',    fn: () => exec('formatBlock', 'blockquote') },
    ],
    [
      { icon: <Search size={13} />, title: 'Find & Replace  Ctrl+H', fn: () => setShowFind(v => !v), active: showFind },
    ],
  ]

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full bg-background">
        {/* Title bar */}
        <div className="px-8 pt-6 pb-3 border-b border-border shrink-0">
          <input
            ref={titleInputRef}
            type="text"
            defaultValue={note.title}
            placeholder="Untitled Note"
            onBlur={(e) => updateNote(note.id, { title: e.target.value || 'Untitled Note' })}
            onKeyDown={(e) => e.key === 'Enter' && editorRef.current?.focus()}
            className="w-full bg-transparent text-lg font-semibold text-foreground placeholder:text-muted-foreground/40 outline-none border-none"
          />
        </div>

        {/* Toolbar */}
        <div
          className="flex items-center gap-px px-3 py-1.5 border-b border-border bg-card shrink-0 overflow-x-auto"
          style={{ scrollbarWidth: 'none' }}
        >
          {groups.map((group, gi) => (
            <div key={gi} className="flex items-center gap-px">
              {gi > 0 && <Separator orientation="vertical" className="h-3.5 mx-1.5" />}
              {group.map((btn, i) => (
                <Tooltip key={i}>
                  <TooltipTrigger asChild>
                    <button
                      onMouseDown={(e) => { e.preventDefault(); btn.fn() }}
                      className={cn(
                        'size-7 flex items-center justify-center rounded-lg transition-colors',
                        'text-muted-foreground hover:text-foreground hover:bg-muted',
                        btn.active && 'bg-muted text-foreground'
                      )}
                    >
                      {btn.icon}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>{btn.title}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          ))}

          <Separator orientation="vertical" className="h-3.5 mx-1.5" />
          <div className="flex items-center gap-1.5">
            <Type size={12} className="text-muted-foreground/40 shrink-0" />
            <select
              value={fontSize}
              onChange={(e) => applyFontSize(e.target.value)}
              className="bg-muted text-muted-foreground text-xs rounded-lg px-1.5 py-1 border border-border outline-none cursor-pointer hover:text-foreground transition-colors"
            >
              {FONT_SIZES.map(s => <option key={s} value={s}>{s}px</option>)}
            </select>
          </div>
        </div>

        {/* Find & Replace */}
        {showFind && (
          <div className="flex items-center flex-wrap gap-2 px-4 py-2 border-b border-border bg-card shrink-0">
            <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1.5 focus-within:ring-2 focus-within:ring-ring/30 transition-all">
              <Search size={11} className="text-muted-foreground/50 shrink-0" />
              <input
                ref={findRef}
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                placeholder="Find…"
                className="bg-transparent text-sm text-foreground outline-none w-28 placeholder:text-muted-foreground/40"
              />
              {findText && (
                <span className={cn('text-[11px] shrink-0 tabular-nums', matchCount > 0 ? 'text-muted-foreground' : 'text-destructive')}>
                  {matchCount}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 bg-background border border-input rounded-lg px-2.5 py-1.5">
              <input
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                placeholder="Replace…"
                className="bg-transparent text-sm text-foreground outline-none w-28 placeholder:text-muted-foreground/40"
              />
            </div>
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
              <input type="checkbox" checked={matchCase} onChange={(e) => setMatchCase(e.target.checked)} className="accent-foreground rounded" />
              Aa
            </label>
            <Button variant="outline" size="xs" onClick={replaceOne}>Replace</Button>
            <Button variant="outline" size="xs" onClick={replaceAll}>All</Button>
            <button onClick={() => setShowFind(false)} className="text-muted-foreground/40 hover:text-muted-foreground text-xs transition-colors ml-1">✕</button>
          </div>
        )}

        {/* Editor content */}
        <div className="flex-1 overflow-y-auto">
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            data-placeholder="Start writing…"
            onInput={() => { recalc(); schedule() }}
            className="note-editor px-8 py-5 min-h-full focus:outline-none"
          />
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between px-8 py-1.5 border-t border-border text-[11px] text-muted-foreground/40 shrink-0 bg-card">
          <span>{words} {words === 1 ? 'word' : 'words'} · {chars} {chars === 1 ? 'char' : 'chars'}</span>
          <span>{savedAt ? `Saved ${savedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}</span>
        </div>
      </div>
    </TooltipProvider>
  )
}
