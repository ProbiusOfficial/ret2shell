import { useChallenge, useChallengeSolveStatus, useChallenges } from "@api/challenge";
import { checkSubmissionStatus, submitFlag } from "@api/game";
import { useSelfTeam } from "@api/team";
import type { Challenge } from "@models/challenge";
import type { Game } from "@models/game";
import { isAdminOfGame, isGameInProgress } from "@storage/game";
import { t } from "@storage/theme";
import ansiColors from "ansi-colors";
import { HTTPError } from "ky";
import type { ParseEntry } from "shell-quote";
import type { Stdio } from "../stdio";
import type { Command } from "./interface";

export class Submit implements Command {
  name = "submit";
  man = t("shell.submit.man");
  func = async (
    io: Stdio,
    _args: ParseEntry[],
    origin: string,
    {
      game,
      challenge,
    }: {
      game?: Game;
      challenge?: Challenge;
    }
  ) => {
    if (!game || !challenge) {
      io.error(t("shell.errors.noGameSpecified.title"));
      return 1;
    }
    const flag = origin.replace("submit", "").trim();
    io.info(`${t("shell.submit.submitting")}: ${ansiColors.blue(flag)}`);
    try {
      const submission = await submitFlag(game!.id, challenge!.id, flag);
      io.print(ansiColors.green(`${t("shell.submit.waitingForChecking")}`));
      let iter = 7;
      let checked = false;
      while (iter > 0) {
        const st = await checkSubmissionStatus(game!.id, challenge!.id, submission.id);
        if (st.solved !== null) {
          io.println("");
          if (st.solved) {
            const c = useChallenge({
              game_id: () => game!.id,
              challenge_id: () => challenge!.id,
            });
            const s = useChallengeSolveStatus({
              game_id: () => game!.id,
              challenge_id: () => challenge!.id,
            });
            const cs = useChallenges({
              game_id: () => game!.id,
            });
            io.success(`${t("challenge.submission.status.solved.title")}: ${st.result}`);
            c.refetch();
            s.refetch();
            cs.refetch();
            if (isGameInProgress(game) && !isAdminOfGame(game)) {
              const te = useSelfTeam({
                game_id: () => game!.id,
              });
              te.refetch();
            }
          } else {
            io.error(`${t("challenge.submission.status.failed.title")}: ${st.result}`);
          }
          checked = true;
          break;
        }
        io.print(ansiColors.green("."));
        await new Promise((resolve) => setTimeout(resolve, 1000));
        iter--;
      }
      if (!checked) {
        io.error(`${t("shell.submit.errors.timeout.title")}`);
      }
    } catch (e) {
      if (e instanceof HTTPError) {
        const text = await e.response.text();
        io.error(`${t("challenge.submission.errors.submit.title")}: ${text}`);
      }
    }
    return 0;
  };
}
