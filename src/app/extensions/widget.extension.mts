import { eachSeries, EMPTY, NONE, TServiceParams } from "@digital-alchemy/core";
import dayjs from "dayjs";
import { HorizontalAlignment, LayoutUtils, VerticalAlignment } from "rpi-led-matrix";

import {
  CircleWidgetDTO,
  ClockWidgetDTO,
  Colors,
  CountdownWidgetDTO,
  GenericWidgetDTO,
  HMS,
  ImageWidgetDTO,
  LineWidgetDTO,
  MAX_COLOR_BRIGHTNESS,
  RectangleWidgetDTO,
  TextWidgetDTO,
  UNLOAD_WIDGETS,
} from "../../index.mts";

export function Widget({ event, pi_matrix_app, logger }: TServiceParams) {
  function renderCircle({
    brightness = MAX_COLOR_BRIGHTNESS,
    color = Colors.White,
    r = EMPTY,
    x = EMPTY,
    y = EMPTY,
  }: CircleWidgetDTO): void {
    pi_matrix_app.instance.instance.fgColor(color).brightness(brightness).drawCircle(x, y, r);
  }

  function renderCountdown({
    overflow = false,
    prefix = "",
    suffix = "",
    ...widget
  }: CountdownWidgetDTO & { end?: number }): void {
    widget.end ??= dayjs(widget.target).valueOf();
    const now = Date.now();
    const diff = !overflow && widget.end < now ? EMPTY : Math.abs(widget.end - now);
    renderText({
      ...(widget as CountdownWidgetDTO),
      text: `${prefix}${HMS(diff)}${suffix}`,
    });
  }

  function renderLine({
    brightness = MAX_COLOR_BRIGHTNESS,
    color = Colors.White,
    endX = EMPTY,
    endY = EMPTY,
    x = EMPTY,
    y = EMPTY,
  }: LineWidgetDTO): void {
    pi_matrix_app.instance.instance
      .fgColor(color)
      .brightness(brightness)
      .drawLine(Number(x), Number(y), Number(endX), Number(endY));
  }

  function renderRectangle({
    brightness = MAX_COLOR_BRIGHTNESS,
    color = Colors.White,
    fill = "none",
    height,
    width,
    x = EMPTY,
    y = EMPTY,
  }: RectangleWidgetDTO): void {
    pi_matrix_app.instance.instance.fgColor(color).brightness(brightness);
    if (fill === "solid") {
      // ? Keeping the interface consistent
      pi_matrix_app.instance.instance.fill(x, y, x + width, y + height);
      return;
    }
    pi_matrix_app.instance.instance.drawRect(x, y, width, height);
  }

  function renderText({
    brightness = MAX_COLOR_BRIGHTNESS,
    color = Colors.White,
    horizontal = HorizontalAlignment.Left,
    text,
    vertical = VerticalAlignment.Top,
    ...widget
  }: Partial<TextWidgetDTO>): void {
    const font = pi_matrix_app.text.font(widget.font);
    if (!font) {
      logger.error(`failed to load font to render, asked for {%s}`, widget.font);
      return;
    }
    const lines = LayoutUtils.textToLines(font, pi_matrix_app.instance.instance.width(), text);
    const glyphs = LayoutUtils.linesToMappedGlyphs(
      lines,
      font.height(),
      pi_matrix_app.instance.instance.width(),
      pi_matrix_app.instance.instance.height(),
      horizontal,
      vertical,
    );
    pi_matrix_app.instance.instance.font(font).fgColor(color).brightness(brightness);
    glyphs.forEach(({ x, y, char }) =>
      pi_matrix_app.instance.instance.drawText(
        char,
        x + (widget.x ?? EMPTY),
        y + (widget.y ?? EMPTY),
      ),
    );
  }

  /**
   * order of operations in rendering
   */
  function prerender() {
    const out = [] as GenericWidgetDTO[];
    pi_matrix_app.sync.pre.forEach(value => {
      out.push(...value);
    });
    return out;
  }

  /**
   * order of operations in rendering
   */
  function postrender() {
    const out = [] as GenericWidgetDTO[];
    pi_matrix_app.sync.post.forEach(value => {
      out.push(...value);
    });
    return out;
  }

  const widget = {
    initWidgets(widgets: GenericWidgetDTO[]): void {
      widgets.forEach((widget: GenericWidgetDTO) => {
        if (["clock", "text", "countdown"].includes(widget.type)) {
          pi_matrix_app.text.load((widget as TextWidgetDTO).font);
          return;
        }
        if (["image"].includes(widget.type)) {
          const w = widget as ImageWidgetDTO;
          pi_matrix_app.image.loadImage(w.path, w);
          return;
        }
        if (["gif"].includes(widget.type)) {
          const w = widget as ImageWidgetDTO;
          pi_matrix_app.image.loadAnimation(w);
          return;
        }
        if (["rectangle", "line", "circle"].includes(widget.type)) {
          return;
        }
        logger.warn(`unknown widget type: {${widget.type}}`);
      });
    },

    async render(): Promise<void> {
      const list = [prerender(), widget.widgets, postrender()].flat();
      try {
        pi_matrix_app.instance.instance.clear();
        await eachSeries(list, async widget => await pi_matrix_app.widget.renderWidget(widget));
        pi_matrix_app.instance.instance.sync();
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    },

    renderWidget(widget: GenericWidgetDTO): void {
      switch (widget.type) {
        case "image": {
          const i = widget as ImageWidgetDTO;
          pi_matrix_app.image.render(i.path, i);
          return;
        }
        case "countdown": {
          renderCountdown(widget as CountdownWidgetDTO);
          return;
        }
        case "clock": {
          renderText({
            ...(widget as ClockWidgetDTO),
            text: dayjs().format((widget as ClockWidgetDTO).format ?? "hh:mm:ss"),
          });
          return;
        }
        case "text": {
          renderText(widget as TextWidgetDTO);
          return;
        }
        case "line": {
          renderLine(widget as LineWidgetDTO);
          return;
        }
        case "rectangle": {
          renderRectangle(widget as RectangleWidgetDTO);
          return;
        }
        case "circle": {
          renderCircle(widget as CircleWidgetDTO);
          return;
        }
      }
    },

    setWidgets(incoming: GenericWidgetDTO[]) {
      pi_matrix_app.render.renderMode = "widget";
      event.emit(UNLOAD_WIDGETS);
      widget.widgets = incoming;
      const counts = {} as Record<string, number>;
      incoming.forEach(i => {
        counts[i.type] ??= NONE;
        counts[i.type]++;
      });
      widget.initWidgets(incoming);
    },

    widgets: [
      {
        font: "5x8",
        format: "hh:mm:ss",
        type: "clock",
      } as ClockWidgetDTO,
    ] as GenericWidgetDTO[],
  };

  return widget;
}
