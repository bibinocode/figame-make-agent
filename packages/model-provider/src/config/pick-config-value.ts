/**
 * 从一组候选值里取第一个“已定义”的值。
 *
 * 这里明确使用 `!== undefined`，
 * 是因为配置里像空字符串、0 这样的值在某些场景下也是合法输入，
 * 不能简单用 truthy/falsy 判断。
 */
export function pickFirstDefined<T>(
  ...values: Array<T | undefined>
): T | undefined {
  return values.find((value) => value !== undefined);
}
