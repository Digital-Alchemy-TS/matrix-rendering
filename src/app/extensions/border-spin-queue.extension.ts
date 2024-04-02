import { TServiceParams } from "@digital-alchemy/core";

import { BorderSpinQueue, BorderSpinQueueItem } from "../..";
type RunningItem = {
  stop: () => void;
};
export function BorderSpinQueueExtension({ logger }: TServiceParams) {
  let QUEUE = [] as BorderSpinQueueItem[];
  const RUNNING = new Map<number, RunningItem>();

  const queue = {
    QUEUE,
    RUNNING,
    async add(data: BorderSpinQueue): Promise<void> {
      data.type ??= "auto";
      data.completeMode ??= "leave";
      data.spins ??= [];

      switch (data.type) {
        case "replace":
          QUEUE = [];
          RUNNING.forEach((item, index) => {
            RUNNING.delete(index);
            item.stop();
          });
          queue.tick();
          return;
        case "queue":
          //
          return;
        default:
          logger.error(`unknown spin type: {${data.type}}`);
      }
    },
    tick(): void {
      //
    },
  };
  return queue;
}
