import { TServiceParams } from "@digital-alchemy/core";
import { readdirSync } from "fs";
import { isAbsolute, join } from "path";

import {
  APlaySpeakerDevice,
  NO_SOUND_DEVICE,
  PlaySoundCommand,
  SoundConfiguration,
} from "../../index.mts";

export async function Sound({ config, logger }: TServiceParams) {
  const { execa } = await import("execa");
  const sound = {
    describeConfiguration(): SoundConfiguration {
      return {
        directory: config.matrix_rendering.SOUND_DIRECTORY,
        files: sound.soundFileList(),
      };
    },
    async playSound({
      sound,
      card = config.matrix_rendering.DEFAULT_SOUND_DEVICE,
    }: PlaySoundCommand): Promise<void> {
      sound = isAbsolute(sound) ? sound : join(config.matrix_rendering.SOUND_DIRECTORY, sound);
      if (card !== NO_SOUND_DEVICE) {
        logger.info(`[%s] playing on card {%s}`, sound, card);
        await execa("mplayer", ["-ao", `alsa:device=hw=${card}.0`, sound]);
        return;
      }
      logger.info(`[%s] playing on system default card`, sound);
      await execa("mplayer", [sound]);
    },

    soundFileList(): string[] {
      return readdirSync(config.matrix_rendering.SOUND_DIRECTORY).filter(
        i => ![".", ".."].includes(i),
      );
    },

    async speakerDeviceList(): Promise<APlaySpeakerDevice[]> {
      const out = await execa("aplay", ["-l"]);
      const speakers = [] as APlaySpeakerDevice[];
      out.stdout.split("\n").forEach(line => {
        if (!line.startsWith("card")) {
          return;
        }
        const [card, description, name] = line.split(":");
        const speaker = {
          card: Number(card.replace("card ", "")),
          description: description.split(",").shift(),
          name,
        };
        speakers.push(speaker);
        logger.debug(`[%s] (device {%s})`, speaker.description, speaker.card);
      });

      return speakers;
    },
  };

  return sound;
}

/**
 * ## Reference command for playing a sound
 *
 * ```bash
 * mplayer -ao alsa:device=hw=2.0 bell-123742.mp3
 * ```
 *
 * ## Reference output of `aplay -l` for parsing
 *
 * ```text
 * **** List of PLAYBACK Hardware Devices ****
 * card 0: Headphones [bcm2835 Headphones], device 0: bcm2835 Headphones [bcm2835 Headphones]
 *   Subdevices: 8/8
 *   Subdevice #0: subdevice #0
 *   Subdevice #1: subdevice #1
 *   Subdevice #2: subdevice #2
 *   Subdevice #3: subdevice #3
 *   Subdevice #4: subdevice #4
 *   Subdevice #5: subdevice #5
 *   Subdevice #6: subdevice #6
 *   Subdevice #7: subdevice #7
 * card 1: vc4hdmi0 [vc4-hdmi-0], device 0: MAI PCM i2s-hifi-0 [MAI PCM i2s-hifi-0]
 *   Subdevices: 1/1
 *   Subdevice #0: subdevice #0
 * card 2: UACDemoV10 [UACDemoV1.0], device 0: USB Audio [USB Audio]
 *   Subdevices: 1/1
 *   Subdevice #0: subdevice #0
 * card 3: vc4hdmi1 [vc4-hdmi-1], device 0: MAI PCM i2s-hifi-0 [MAI PCM i2s-hifi-0]
 *   Subdevices: 1/1
 *   Subdevice #0: subdevice #0
 * ```
 *
 * ### Notes
 *
 *  card 2: UACDemoV10 [UACDemoV1.0], device 0: USB Audio [USB Audio]
 * :-----^----^^^^^^^^^^^^^^^-------------------^^^^^^^^^^^^^^^^^^^^^:
 *       |       +--- description               +--- card name
 *       +--- card number
 */
