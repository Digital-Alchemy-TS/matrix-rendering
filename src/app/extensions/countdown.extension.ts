import { sleep, TServiceParams } from "@digital-alchemy/core";
import dayjs from "dayjs";

import { AnimatedBorderCallback, CountdownOptions, HMS, HMSS, TextWidgetDTO } from "../..";

export function Countdown({ pi_matrix_app }: TServiceParams) {
  return {
    async exec({
      callback,
      format,
      interval,
      target,
      ...widget
    }: CountdownOptions & {
      callback: AnimatedBorderCallback<TextWidgetDTO>;
    }): Promise<void> {
      const end = new Date(target);
      const endTime = end.getTime();
      pi_matrix_app.text.load(widget.font);
      while (dayjs().isBefore(end)) {
        const diff = endTime - Date.now();
        const timer = format === "hmss" ? HMSS(diff) : HMS(diff);
        widget.text ??= "";
        callback([{ ...widget, text: widget.text + timer, type: "text" }]);
        await sleep(interval);
      }
    },
  };
}
