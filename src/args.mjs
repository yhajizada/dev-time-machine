export function parse(args, allowed) {
  const positionals = [], options = {};
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (!arg.startsWith('--')) { positionals.push(arg); continue; }
    const key = arg.slice(2);
    if (!allowed.includes(key)) throw new Error(`Unknown option ${arg}. Use --help for usage.`);
    if (key in options) throw new Error(`Option ${arg} was supplied twice.`);
    if (!args[i + 1] || args[i + 1].startsWith('--')) throw new Error(`${arg} needs a value.`);
    options[key] = args[++i];
  }
  return { positionals, options };
}
