import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Blog, BlogComment } from '@/types'
import { extractSummaryFromMarkdown, extractTitleFromMarkdown, renderMarkdown } from '@/utils/markdown'

const STORAGE_KEY = 'blogPosts'

const loadFromStorage = (): Blog[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Blog[]
    return Array.isArray(parsed) ? parsed : []
  } catch (error) {
    console.warn('Failed to load blog posts:', error)
    return []
  }
}

const saveToStorage = (blogs: Blog[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(blogs))
}

export const useBlogStore = defineStore('blog', () => {
  const blogs = ref<Blog[]>(loadFromStorage())

  const persist = () => {
    saveToStorage(blogs.value)
  }

  const addBlogFromMarkdown = (markdown: string, fileName: string) => {
    const fallbackTitle = fileName.replace(/\.md$/i, '') || '未命名博客'
    const title = extractTitleFromMarkdown(markdown, fallbackTitle)
    const summary = extractSummaryFromMarkdown(markdown, 200)
    const html = renderMarkdown(markdown)
    const now = Date.now()

    const blog: Blog = {
      id: `blog_${now}_${Math.random().toString(36).slice(2, 8)}`,
      title,
      summary,
      contentMarkdown: markdown,
      contentHtml: html,
      createdAt: now,
      views: 0,
      likes: 0,
      liked: false,
      comments: []
    }

    blogs.value.unshift(blog)
    persist()
    return blog
  }

  const getBlogById = (id: string): Blog | undefined => {
    return blogs.value.find(item => item.id === id)
  }

  const incrementViews = (id: string) => {
    const blog = getBlogById(id)
    if (!blog) return
    blog.views += 1
    persist()
  }

  const toggleLike = (id: string) => {
    const blog = getBlogById(id)
    if (!blog) return
    blog.liked = !blog.liked
    blog.likes += blog.liked ? 1 : -1
    if (blog.likes < 0) blog.likes = 0
    persist()
  }

  const addComment = (id: string, comment: Omit<BlogComment, 'id' | 'createdAt' | 'likes'>) => {
    const blog = getBlogById(id)
    if (!blog) return
    const newComment: BlogComment = {
      id: `comment_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      username: comment.username,
      content: comment.content,
      createdAt: Date.now(),
      likes: 0
    }
    blog.comments.unshift(newComment)
    persist()
  }

  return {
    blogs,
    addBlogFromMarkdown,
    getBlogById,
    incrementViews,
    toggleLike,
    addComment
  }
})
