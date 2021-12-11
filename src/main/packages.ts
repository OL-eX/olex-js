import { IPackage } from "../typings/OLeX.type"

export function packageUse(p: IPackage) {
    console.log(p)
    this._packages.push(p)
    return this
}

export function packageGet() {
    return this._packages.map((p: IPackage) => p.name)
}
