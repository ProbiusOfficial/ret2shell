import type { Challenge } from "@models/challenge";
import type { ParseEntry } from "shell-quote";
import type { Stdio } from "../stdio";

export interface Command {
  name: string;
  func(io: Stdio, challenge: Challenge | null, args: ParseEntry[], origin: string): Promise<number>;
  man: string;
}
