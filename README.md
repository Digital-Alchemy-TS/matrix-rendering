# 🏠 Welcome to `@digital-alchemy/matrix-rendering`!

- Extended docs: https://docs.digital-alchemy.app/Matrix-Rendering
- [Discord](https://discord.com/invite/mtWHk36upW)

## Example config

> Matched to the [hardware build guide](https://docs.digital-alchemy.app/Pi+Matrix/Hardware+Build+Guide)

```ini
[matrix_rendering.MATRIX_OPTIONS]
  chainLength=10
  cols=64
  hardwareMapping=adafruit-hat
  rows=32

[matrix_rendering.RUNTIME_OPTIONS]
  gpioSlowdown=4
  dropPrivileges=0

[fastify]
  PORT=7000
```
