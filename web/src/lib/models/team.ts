export interface ScoreHistory {
  score: number
  time: number
}

export interface Team {
  id: number
  name: string
  game_id: number
  token: string
  state: number
  institute_id: number | null
  score: number
  history: ScoreHistory[]
  last_active_at: number
}

export function getTeamState(state: number) {
  switch (state) {
    case -1:
      return 'Banned'
    case 0:
      return 'NeedAudit'
    case 1:
      return 'Normal'
    case 2:
      return 'Hidden'
    default:
      return 'Unknown'
  }
}

export interface TeamList {
  teams: Team[]
  total: number
}

export interface TeamRank {
  rank: number
}
