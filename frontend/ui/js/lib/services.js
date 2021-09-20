const protocol = location.protocol
const port = location.port ? `:${location.port}` : ''

export function getServiceUrl (serviceRecord) {
  if (serviceRecord?.settings?.manifest?.frame) {
    return `${protocol}//localhost${port}/app/${serviceRecord.settings.id}`
  }
  return getUnframedServiceUrl(serviceRecord.settings.id)
}

export function getUnframedServiceUrl (id) {
  return `${protocol}//${id}.localhost${port}/`
}