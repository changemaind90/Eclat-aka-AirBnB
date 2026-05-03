import api from './api/index'

// Back-compat for existing imports (`import api from "@/api"`)
// plus a small convenience method that existed on the older instance.
;(api as any).createListing = (data: FormData) => api.post('/listings', data)

export default api
