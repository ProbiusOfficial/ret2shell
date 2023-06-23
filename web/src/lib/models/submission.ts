export interface Submission {
  id: number
  user_id: number
  challenge_id: number
  content: string
  solved: boolean
  created_at: number
}

export interface SubmissionWithChallengeAndUserInfo {
  id: number
  user_id: number
  user_name: string
  challenge_id: number
  game_id: number
  challenge_name: string
  content: string
  solved: boolean
}
