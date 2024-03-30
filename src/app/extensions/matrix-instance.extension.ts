import { is, TServiceParams } from "@digital-alchemy/core";
import { LedMatrix, LedMatrixInstance } from "rpi-led-matrix";

export function MatrixInstance({ config, lifecycle, logger }: TServiceParams) {
  lifecycle.onPostConfig(() => {
    const matrix = Object.fromEntries(
      Object.entries(config.pi_matrix.MATRIX_OPTIONS).map(([name, value]) => {
        const number = Number(value);
        return [name, is.string(value) && is.number(number) ? number : value];
      }),
    );
    const runtime = Object.fromEntries(
      Object.entries(config.pi_matrix.RUNTIME_OPTIONS).map(([name, value]) => {
        const number = Number(value);
        return [name, is.string(value) && is.number(number) ? number : value];
      }),
    );
    logger.info({ matrix, name: "onPostConfig", runtime }, `new [LedMatrix]`);
    lexMatrix.instance = new LedMatrix(
      { ...LedMatrix.defaultMatrixOptions(), ...matrix },
      { ...LedMatrix.defaultRuntimeOptions(), ...runtime },
    );
  });

  const lexMatrix = { instance: undefined as LedMatrixInstance };
  return lexMatrix;
}
