import { joinPath } from './strings.js'

export const DEBUG_ENDPOINTS = {
  'dev1.localhost': 'localhost:3000',
  'dev2.localhost': 'localhost:4000',
  'dev3.localhost': 'localhost:5000',
  'dev4.localhost': 'localhost:6000'
}

function getDebugDomain () {
  for (let [hostname, endpoint] of Object.entries(DEBUG_ENDPOINTS)) {
    if (endpoint.endsWith(window.location.port)) {
      return hostname
    }
  }
  return window.location.hostname
}

export const OUR_DOMAIN = window.location.hostname === 'localhost' ? getDebugDomain() : window.location.hostname

export function HTTP_ENDPOINT (domain) {
  return DEBUG_ENDPOINTS[domain] ? `http://${DEBUG_ENDPOINTS[domain]}` : `https://${domain}`
}

export function AVATAR_URL (userId) {
  return '/' + joinPath(`_api/view/ctzn.network/views/avatar?dbId=${encodeURIComponent(userId)}`)
}

export function USER_URL (userId) {
  return `/${userId}`
}

export function POST_URL (post) {
  return '/' + joinPath(post.author.dbId, 'ctzn.network/post', post.key)
}

export function FULL_POST_URL (post) {
  return location.origin + '/' + joinPath(post.author.userId, 'ctzn.network/post', post.key)
}

export function COMMENT_URL (comment) {
  return '/' + joinPath(comment.author.dbId, 'ctzn.network/comment', comment.key)
}

export function FULL_COMMENT_URL (comment) {
  return location.origin + '/' + joinPath(comment.author.userId, 'ctzn.network/comment', comment.key)
}

export function BLOB_URL (userId, table, key, blobName) {
  return '/' + joinPath('_api/table', encodeURIComponent(userId), table, key, 'blobs', blobName)
}

export const SUGGESTED_REACTIONS = [
  'like',
  'haha',
  'interesting!',
  '❤️',
  '👍',
  '😂',
  '🤔',
  '🔥',
  '😢'
]
