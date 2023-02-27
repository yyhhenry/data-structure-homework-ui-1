/**
 * @argument module 请传入一个形如await import('./wasm/xxx.js')的结果;
 * 你需要保证目标js代码加入了export default Module;这一句
 */
export async function loadEmscripten<
    Module extends Record<string, any>,
    Config extends {} = {}
>(module: any, config?: Config) {
    const loader = module.default ?? module;
    const cwrap = (await loader(config)).cwrap;
    return cwrap as <T extends keyof Module>(
        s: T,
        ret: string,
        args: string[]
    ) => Module[T];
}
