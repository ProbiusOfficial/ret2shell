export interface Game {
  id: number
  name: string
  brief: string
  updated_at: number
  introduction: string
  start_time: number
  end_time: number
  register_time: number
  archive_time: number
  hidden: boolean
  frozen: boolean
  host_as_game: boolean
  team_size_limit: number
  cover_path: string
  enable_team_audit: boolean
  can_register_after_started: boolean
  institute_id: number | null
}

export enum GameStatus {
  NotStart = 1,
  Started = 2,
  Ended = 3,
}

export interface Notification {
  id: number
  title: string
  content: string
  published_at: number
  game_id: number
}
