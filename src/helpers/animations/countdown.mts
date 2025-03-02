import { TextWidgetDTO } from "../render-widget.dto.mts";

export class CountdownOptions extends TextWidgetDTO {
  public format: "hms" | "hmss";
  public interval?: number;
  public target: string;
  declare public type: "countdown";
}
