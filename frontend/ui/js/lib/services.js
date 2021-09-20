const protocol = location.protocol
const port = location.port ? `:${location.port}` : ''

export function getServiceUrl (serviceRecord) {
  return `${protocol}//${serviceRecord.settings.id}.localhost${port}/`
}