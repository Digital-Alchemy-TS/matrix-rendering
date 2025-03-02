import { Type } from "@sinclair/typebox";

export type SendSoundBody = {
  name: string;
};

export type APlaySpeakerDevice = {
  card: number;
  description: string;
  name: string;
};

export const PlaySoundCommand = Type.Object({
  card: Type.Optional(Type.Number()),
  sound: Type.String(),
});
export type PlaySoundCommand = typeof PlaySoundCommand.static;

export const NO_SOUND_DEVICE = -1;

export type SoundConfiguration = {
  directory: string;
  files: string[];
};
