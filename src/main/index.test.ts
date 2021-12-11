import { OLeX } from "./index"
import { IPackage } from "../typings/OLeX.type"

const testPackage: IPackage = {
    name: "test",
    author: "Herbert He",
    version: "v1.0.0",
    renderers: new Map([
        [
            "testA",
            function (node, ctx) {
                return "Hello"
            },
        ],
    ]),
}

test("Test OLeX", () => {
    const olex = new OLeX("测试文本")
    olex.packages.use(testPackage)
    console.log(JSON.stringify(olex))
})
