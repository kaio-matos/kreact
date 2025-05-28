export function debounce<T extends Function>(this: any, fn: T, time: number) {
  let timeout: number | undefined;

  return function (this: any) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(fn, time);
  };
}
