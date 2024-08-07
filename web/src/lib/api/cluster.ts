import type { RegistryConfig } from "@models/config";
import type { ConfigMapList, NodeList } from "kubernetes-types/core/v1";
import { DateTime } from "luxon";
import api, { api_root } from ".";

export async function getClusterConfig() {
  return await api.get(`${api_root}/cluster/config`).json<ConfigMapList>();
}

export async function getClusterNodes() {
  return await api.get(`${api_root}/cluster/node`).json<NodeList>();
}

export async function getRegistryConfig() {
  return await api.get(`${api_root}/cluster/repo/config`).json<RegistryConfig>();
}

export async function getRegistryRepositories() {
  return await api.get(`${api_root}/cluster/repo`).json<string[]>();
}

export async function getRegistryImageTags(repo: string) {
  return await api.get(`${api_root}/cluster/repo/${repo}`).json<string[]>();
}

export async function getCalmdownStatus() {
  const result = await api.get(`${api_root}/cluster/calmdown`).json<number | null>();
  if (result) {
    return DateTime.fromSeconds(result);
  }
  return null;
}
