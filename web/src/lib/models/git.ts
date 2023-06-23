export interface GitFile {
  type: 'tree' | 'blob'
  name: string
  time: number
}
