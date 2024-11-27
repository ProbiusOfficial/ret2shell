import { addToast } from "@storage/toast";
import { HTTPError } from "ky";

export async function handleHttpError(err: Error, tip: string) {
  if (err instanceof HTTPError) {
    const text = await err.response.text();
    addToast({
      level: "error",
      description: `${tip}: ${text}`,
      duration: 5000,
    });
  } else {
    addToast({
      level: "error",
      description: (err as Error).toString(),
      duration: 5000,
    });
  }
}
