export interface Platform {
  name: string
  footer_info: string
  footer_url: string
  subject_info: string
  subject_url: string
  record: string | null
  hide_maker: boolean
}

export enum Validator {
  None = 0,
  Image = 1,
  Pow = 2,
  RecaptchaV3 = 3,
  HCaptcha = 4,
}

export interface Captcha {
  enabled: boolean
  difficulty: number
  validator: Validator
}

export interface Auth {
  signing_key: string
  buffer_time: number
  expires_time: number
}

export interface Email {
  enabled: boolean
  host: string
  port: number
  sender: string
  username: string
  password: string
  tls: 'none' | 'tls' | 'starttls'
  reset_password_email_body: string
  reset_password_email_subject: string
  verify_email_body: string
  verify_email_subject: string
}

export interface Media {
  anti_theft: boolean
  limit: number
}

export interface Pusher {
  enabled: boolean
  token: string
}

export interface Config {
  id?: number
  platform?: Platform
  captcha?: Captcha
  auth?: Auth
  email?: Email
  media?: Media
  pusher?: Pusher
}

export interface CPULoad {
  user: number
  system: number
}

export interface Memory {
  total: number
  free: number
}

export interface Disk {
  total: number
  free: number
  avail: number
  fs_type: string
  fs_mounted_from: string
  fs_mounted_on: string
}

export interface PlatformStat {
  cpu: CPULoad[]
  memory: Memory
  swap: Memory
  disks: Disk[]
  uptime: number
}

export interface ClusterInfo {
  default_namespace: string
  configs: {
    items: {
      apiVersion: string
      data?: {
        since?: string
        clusterDNS?: string
        clusterDomain?: string
      }
    }[]
  }
  version: {
    buildDate: string
    compiler: string
    gitCommit: string
    gitTreeState: string
    gitVersion: string
    goVersion: string
    major: string
    minor: string
    platform: string
  }
  nodes: {
    metadata: {
      resourceVersion: string
    }
    items: {
      apiVersion: string
      kind: string
      metadata: {
        createTimestamp: string
        name: string
        resourceVersion: string
        uid: string
      }
      spec: {
        podCIDR: string
        podCIDRs: string[]
        providerID: string
      }
      status: {
        addresses: {
          address: string
          type: string
        }[]
        allocatable: {
          cpu: string
          'ephemeral-storage': string
          memory: string
          pods: string
        }
        capacity: {
          cpu: string
          'ephemeral-storage': string
          memory: string
          pods: string
        }
        conditions: {
          lastHeartbeatTime: string
          lastTransitionTime: string
          message: string
          reason: string
          status: string
          type: string
        }[]
        nodeInfo: {
          architecture: string
          bootID: string
          containerRuntimeVersion: string
          kernelVersion: string
          kubeProxyVersion: string
          kubeletVersion: string
          machineID: string
          operatingSystem: string
          osImage: string
          systemUUID: string
        }
      }
    }[]
  }
}
