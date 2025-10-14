import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:5000/api' })

export async function computeProfile(payload){
  const resp = await api.post('/compute', payload)
  return resp.data
}
