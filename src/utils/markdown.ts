const escapeHtml = (value: string): string => {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const applyInlineFormats = (value: string): string => {
  let text = escapeHtml(value)

  text = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />')
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  text = text.replace(/`([^`]+)`/g, '<code class="md-inline-code">$1</code>')
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>')
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>')

  return text
}

const extractCodeBlocks = (markdown: string) => {
  const blocks: string[] = []
  const text = markdown.replace(/```([a-zA-Z0-9_-]+)?\n([\s\S]*?)```/g, (_match, lang, code) => {
    const safeCode = escapeHtml(code.trimEnd())
    const languageClass = lang ? ` language-${lang}` : ''
    const html = `<pre class="md-code"><code class="md-inline-code${languageClass}">${safeCode}</code></pre>`
    const index = blocks.length
    blocks.push(html)
    return `@@CODE_BLOCK_${index}@@`
  })
  return { text, blocks }
}

const flushParagraph = (buffer: string[], blocks: string[]): string => {
  if (buffer.length === 0) return ''
  const paragraph = applyInlineFormats(buffer.join(' '))
  buffer.length = 0
  return `<p>${paragraph}</p>`
}

export const renderMarkdown = (markdown: string): string => {
  const normalized = markdown.replace(/\r\n/g, '\n')
  const { text, blocks } = extractCodeBlocks(normalized)
  const lines = text.split('\n')

  const htmlParts: string[] = []
  const paragraphBuffer: string[] = []

  const flushIfNeeded = () => {
    const paragraph = flushParagraph(paragraphBuffer, blocks)
    if (paragraph) htmlParts.push(paragraph)
  }

  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()

    if (!trimmed) {
      flushIfNeeded()
      i += 1
      continue
    }

    const codeMatch = trimmed.match(/^@@CODE_BLOCK_(\d+)@@$/)
    if (codeMatch) {
      flushIfNeeded()
      const index = Number(codeMatch[1])
      if (!Number.isNaN(index) && blocks[index]) {
        htmlParts.push(blocks[index])
      }
      i += 1
      continue
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/)
    if (headingMatch) {
      flushIfNeeded()
      const level = headingMatch[1].length
      const content = applyInlineFormats(headingMatch[2].trim())
      htmlParts.push(`<h${level}>${content}</h${level}>`)
      i += 1
      continue
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushIfNeeded()
      htmlParts.push('<hr />')
      i += 1
      continue
    }

    if (trimmed.startsWith('>')) {
      flushIfNeeded()
      const quoteLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].trim().replace(/^>\s?/, ''))
        i += 1
      }
      const quoteContent = applyInlineFormats(quoteLines.join(' '))
      htmlParts.push(`<blockquote>${quoteContent}</blockquote>`)
      continue
    }

    if (/^(\-|\*|\+)\s+/.test(trimmed)) {
      flushIfNeeded()
      const items: string[] = []
      while (i < lines.length && /^(\-|\*|\+)\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^(\-|\*|\+)\s+/, '')
        items.push(`<li>${applyInlineFormats(itemText)}</li>`)
        i += 1
      }
      htmlParts.push(`<ul>${items.join('')}</ul>`)
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      flushIfNeeded()
      const items: string[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const itemText = lines[i].trim().replace(/^\d+\.\s+/, '')
        items.push(`<li>${applyInlineFormats(itemText)}</li>`)
        i += 1
      }
      htmlParts.push(`<ol>${items.join('')}</ol>`)
      continue
    }

    paragraphBuffer.push(trimmed)
    i += 1
  }

  flushIfNeeded()
  return htmlParts.join('\n')
}

export const extractTitleFromMarkdown = (markdown: string, fallback: string): string => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  for (const line of lines) {
    const match = line.trim().match(/^#\s+(.*)$/)
    if (match) {
      return match[1].trim() || fallback
    }
  }
  return fallback
}

export const extractSummaryFromMarkdown = (markdown: string, maxLength = 200): string => {
  let text = markdown.replace(/\r\n/g, '\n')
  text = text.replace(/```[\s\S]*?```/g, '')
  text = text.replace(/`[^`]+`/g, '')
  text = text.replace(/!\[[^\]]*\]\([^)]+\)/g, '')
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  text = text.replace(/[#>*_\-\n]/g, ' ')
  text = text.replace(/\s+/g, ' ').trim()

  if (text.length <= maxLength) {
    return text
  }
  return `${text.slice(0, maxLength)}...`
}
