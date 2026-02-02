import dayjs from 'dayjs';
import { uid } from './storage';

export function extractTitleFromMarkdown(content = '') {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '未命名博客';
}

export function extractSummary(content = '', maxLen = 200) {
  const plain = content
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[[^\]]*]\([^)]*\)/g, '')
    .replace(/[#>*_`-]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return plain.slice(0, maxLen);
}

export function buildBlogFromMarkdown(content, html) {
  return {
    id: uid('blog'),
    title: extractTitleFromMarkdown(content),
    summary: extractSummary(content),
    md: content,
    html,
    publishAt: dayjs().toISOString(),
    views: 0,
    likes: 0,
    liked: false,
    comments: [],
  };
}

export function buildComment({ user, content }) {
  return {
    id: uid('comment'),
    user: user || '匿名用户',
    content: content || '',
    createdAt: dayjs().toISOString(),
    likes: 0,
    liked: false,
  };
}
