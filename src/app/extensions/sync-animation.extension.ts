import { TServiceParams } from "@digital-alchemy/core";
import { v4 } from "uuid";

import {
  AnimatedBorderCallback,
  AnimationWidgetDTO,
  BorderSpinQueue,
  GenericWidgetDTO,
} from "../..";

export function SyncAnimation({
  pi_matrix,
  pi_matrix_app,
  logger,
}: TServiceParams) {
  const post = new Map<string, GenericWidgetDTO[]>();
  const pre = new Map<string, GenericWidgetDTO[]>();
  return {
    post,
    pre,
    async runAnimation({
      order = "post",
      ...animation
    }: AnimationWidgetDTO): Promise<void> {
      const id = v4();
      const callback: AnimatedBorderCallback = lines => {
        const map = order === "pre" ? pre : post;
        map.set(id, lines);
        pi_matrix_app.render.render();
      };
      if (animation.mqttStart) {
        logger.error(
          `[%s] cannot publish {%s}`,
          animation.mqttStart,
          "mqttStart",
        );
      }
      switch (animation.animationOptions.type) {
        case "border-spin": {
          await pi_matrix.border_spin({
            ...animation.animationOptions,
            callback,
          });
          break;
        }
        case "countdown": {
          await pi_matrix_app.countdown.exec({
            ...animation.animationOptions,
            callback,
          });
          break;
        }
        case "pulse-laser": {
          await pi_matrix.pulse_laser({
            ...animation.animationOptions,
            callback,
          });
          break;
        }
      }
      pre.delete(id);
      post.delete(id);
      pi_matrix_app.render.render();
      if (animation.mqttEnd) {
        logger.error(`[%s] cannot publish {%s}`, animation.mqttEnd, "mqttEnd");
        // mqtt.publish(animation.mqttEnd, id);
      }
    },
    async spinQueue(data: BorderSpinQueue): Promise<void> {
      await pi_matrix_app.border_spin.add(data);
    },
  };
}
