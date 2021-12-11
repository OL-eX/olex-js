// Mounter for pre-handling tex content
function MountPackages(tex: string) {
    const regex = /\\usepackage(\[([^\n]*)\])?(\{([^\n]*)\})?/g
    const packages = regex.exec(tex).map((item) => [item[2], item[4]])
    return [tex.replace(regex, ""), packages]
}
