import dayjs from 'dayjs';
import { uid } from './storage';

const VIDEO_EXTS = ['mp4', 'avi', 'mkv', 'mov', 'webm', 'm4v', 'flv'];

export function isVideoFile(file) {
  if (!file) return false;
  const name = file.name || '';
  const ext = name.split('.').pop().toLowerCase();
  return VIDEO_EXTS.includes(ext);
}

export function formatSize(bytes = 0) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let idx = 0;
  while (size >= 1024 && idx < units.length - 1) {
    size /= 1024;
    idx += 1;
  }
  return `${size.toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
}

export function formatDuration(seconds = 0) {
  const total = Math.max(0, Math.floor(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (num) => String(num).padStart(2, '0');
  if (h > 0) return `${pad(h)}:${pad(m)}:${pad(s)}`;
  return `${pad(m)}:${pad(s)}`;
}

export function buildVideoKey(fileName, size) {
  return `${fileName || ''}__${size || 0}`;
}

export function extractCollectionInfo(fileName = '') {
  const cleanName = fileName.replace(/\.[^/.]+$/, '');
  const patterns = [
    /(.*?)[-_ ]?第\s*(\d+)\s*集/i,
    /(.*?)[-_ ]?(\d{1,4})\s*$/i,
    /(.*?)[-_ ]?(\d{1,4})\D*$/i,
  ];
  for (const pattern of patterns) {
    const match = cleanName.match(pattern);
    if (match) {
      const name = (match[1] || '').replace(/[-_ ]+$/g, '').trim();
      const episode = Number(match[2]);
      if (name) {
        return { collectionName: name, episodeNumber: episode || 0 };
      }
    }
  }
  return { collectionName: '', episodeNumber: 0 };
}

export function sortByEpisode(a, b) {
  const ea = Number(a.episodeNumber || 0);
  const eb = Number(b.episodeNumber || 0);
  if (ea !== eb) return ea - eb;
  return (a.title || '').localeCompare(b.title || '');
}

export function buildCollections(videos = []) {
  const groups = {};
  videos.forEach((video) => {
    const name = video.collectionName || '';
    if (!name) return;
    if (!groups[name]) groups[name] = [];
    groups[name].push(video);
  });
  return Object.keys(groups)
    .sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'))
    .map((name) => ({
      name,
      videos: groups[name].slice().sort(sortByEpisode),
    }));
}

export function buildVideoFromFile(file, overrides = {}) {
  const { collectionName, episodeNumber } = extractCollectionInfo(file.name);
  return {
    id: uid('video'),
    title: file.name.replace(/\.[^/.]+$/, ''),
    fileName: file.name,
    size: file.size,
    type: file.type,
    duration: 0,
    uploadAt: dayjs().toISOString(),
    sourceUrl: '',
    sourceType: 'local',
    coverUrl: '',
    categoryId: '',
    tagIds: [],
    liked: false,
    favorited: false,
    lastPlayedAt: '',
    collectionName,
    episodeNumber,
    ...overrides,
  };
}

export function getVideoDuration(file) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(video.duration || 0);
      };
      video.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(0);
      };
    } catch (err) {
      resolve(0);
    }
  });
}

export function buildVideoSourceFromFile(file) {
  try {
    return URL.createObjectURL(file);
  } catch (err) {
    return '';
  }
}

export function createHistoryItem(time = 0) {
  return {
    time,
    updatedAt: dayjs().toISOString(),
  };
}
