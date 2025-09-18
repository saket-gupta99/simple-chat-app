export function cn(...args: (string | null | undefined | false | "")[]) {
  return args.filter(Boolean).join(" ");
}
