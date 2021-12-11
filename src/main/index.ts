import { IPackage } from "../typings/OLeX.type"
import { packageUse } from "./packages"

export class OLeX {
    private _packages = []
    constructor(text: string) {}

    packages = {
        use: (p: IPackage): OLeX => packageUse.call(this, p)
    }
}
